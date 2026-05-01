import type { Checklist, ChecklistElement, ChecklistItem } from './db';

/**
 * Mappe les clés longues vers des clés courtes pour réduire la taille de l'URL.
 */
const MAPPING: Record<string, string> = {
    checklistName: 'n',
    checklistId: 'id',
    userName: 'u',
    elements: 'e',
    category: 'c',
    items: 'i',
    item: 't',
    'wanted-quantity': 'w',
    'added-quantity': 'a',
    disabled: 'd'
};

const REVERSE_MAPPING: Record<string, string> = Object.fromEntries(
    Object.entries(MAPPING).map(([k, v]) => [v, k])
);

/**
 * Compacte une checklist en un objet plus petit.
 */
export function compactChecklist(checklist: Checklist): any {
    return {
        [MAPPING.checklistName]: checklist.checklistName,
        [MAPPING.checklistId]: checklist.checklistId,
        [MAPPING.userName]: checklist.userName,
        [MAPPING.elements]: checklist.elements.map(el => {
            const compactEl: any = {
                [MAPPING.category]: el.category,
                [MAPPING.items]: el.items.map(item => {
                    const compactItem: any = {
                        [MAPPING.item]: item.item
                    };
                    
                    if (item['wanted-quantity'] !== 1) {
                        compactItem[MAPPING['wanted-quantity']] = item['wanted-quantity'];
                    }
                    if (item['added-quantity'] !== 0) {
                        compactItem[MAPPING['added-quantity']] = item['added-quantity'];
                    }
                    if (item.disabled) {
                        compactItem[MAPPING.disabled] = 1;
                    }
                    
                    return compactItem;
                })
            };
            return compactEl;
        })
    };
}

/**
 * Désinfecte une chaîne de caractères pour éviter les injections HTML/JS.
 */
function sanitize(str: any): string {
    if (typeof str !== 'string') return '';
    // Supprime les balises HTML et limite la longueur
    return str.replace(/<[^>]*>?/gm, '').trim().substring(0, 100);
}

/**
 * Valide la structure de l'objet compacté.
 * @throws Error si l'objet est invalide ou suspect
 */
export function validateCompactChecklist(compact: any): void {
    if (!compact || typeof compact !== 'object') {
        throw new Error('Format de données invalide');
    }

    // Vérification des champs racines requis
    if (typeof compact[MAPPING.checklistName] !== 'string' || 
        typeof compact[MAPPING.checklistId] !== 'string' ||
        typeof compact[MAPPING.userName] !== 'string') {
        throw new Error('Données racines manquantes ou invalides');
    }

    // Vérification de la liste des éléments
    const elements = compact[MAPPING.elements];
    if (!Array.isArray(elements)) {
        throw new Error('Liste d\'éléments manquante');
    }

    // Limites de sécurité pour éviter les abus de mémoire/affichage
    if (elements.length > 50) {
        throw new Error('Trop de catégories dans la checklist');
    }

    for (const el of elements) {
        if (typeof el[MAPPING.category] !== 'string') {
            throw new Error('Nom de catégorie invalide');
        }

        const items = el[MAPPING.items];
        if (!Array.isArray(items)) {
            throw new Error('Liste d\'articles manquante');
        }

        if (items.length > 100) {
            throw new Error('Trop d\'articles dans une catégorie');
        }

        for (const item of items) {
            if (typeof item[MAPPING.item] !== 'string') {
                throw new Error('Nom d\'article invalide');
            }
            
            // Vérification des quantités (doivent être des nombres positifs raisonnables)
            const w = item[MAPPING['wanted-quantity']];
            const a = item[MAPPING['added-quantity']];
            
            if (w !== undefined && (typeof w !== 'number' || w < 0 || w > 999)) {
                throw new Error('Quantité demandée invalide');
            }
            if (a !== undefined && (typeof a !== 'number' || a < 0 || a > 999)) {
                throw new Error('Quantité ajoutée invalide');
            }
        }
    }
}

/**
 * Étend un objet compacté en une structure de Checklist complète (partielle).
 * Applique une désinfection systématique sur les textes.
 */
export function expandChecklist(compact: any): Partial<Checklist> {
    // Validation avant expansion
    validateCompactChecklist(compact);

    const checklist: any = {
        checklistName: sanitize(compact[MAPPING.checklistName]),
        checklistId: compact[MAPPING.checklistId], // UUID, pas besoin de sanitize strict mais validé par regex plus tard si besoin
        userName: sanitize(compact[MAPPING.userName]),
        elements: (compact[MAPPING.elements] || []).map((el: any) => {
            const element: ChecklistElement = {
                category: sanitize(el[MAPPING.category]),
                progress: 0,
                addedByUser: true,
                items: (el[MAPPING.items] || []).map((item: any) => {
                    const expandedItem: ChecklistItem = {
                        item: sanitize(item[MAPPING.item]),
                        'wanted-quantity': Math.max(0, Math.min(999, Number(item[MAPPING['wanted-quantity']] ?? 1))),
                        'added-quantity': Math.max(0, Math.min(999, Number(item[MAPPING['added-quantity']] ?? 0))),
                        disabled: !!item[MAPPING.disabled],
                        addedByUser: true
                    };
                    return expandedItem;
                })
            };
            // Recalculer le progrès de l'élément
            const total = element.items.length;
            const added = element.items.filter(i => i['added-quantity'] >= i['wanted-quantity']).length;
            element.progress = total > 0 ? Math.round((added / total) * 100) : 0;
            return element;
        })
    };

    // Calculer le progrès global
    const totalItems = checklist.elements.reduce((acc: number, el: any) => acc + el.items.length, 0);
    const addedItems = checklist.elements.reduce((acc: number, el: any) => 
        acc + el.items.filter((i: any) => i['added-quantity'] >= i['wanted-quantity']).length, 0);
    checklist.progress = totalItems > 0 ? Math.round((addedItems / totalItems) * 100) : 0;
    
    return checklist;
}

/**
 * Encode l'objet compacté en Base64 compatible UTF-8.
 */
export function encodeChecklist(compact: any): string {
    const json = JSON.stringify(compact);
    return btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

/**
 * Décode la chaîne Base64 en objet compacté.
 */
export function decodeChecklist(base64: string): any {
    const json = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
}
