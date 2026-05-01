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
 * Étend un objet compacté en une structure de Checklist complète (partielle).
 */
export function expandChecklist(compact: any): Partial<Checklist> {
    const checklist: any = {
        checklistName: compact[MAPPING.checklistName],
        checklistId: compact[MAPPING.checklistId],
        userName: compact[MAPPING.userName],
        elements: (compact[MAPPING.elements] || []).map((el: any) => {
            const element: ChecklistElement = {
                category: el[MAPPING.category],
                progress: 0,
                addedByUser: true,
                items: (el[MAPPING.items] || []).map((item: any) => {
                    const expandedItem: ChecklistItem = {
                        item: item[MAPPING.item],
                        'wanted-quantity': item[MAPPING['wanted-quantity']] ?? 1,
                        'added-quantity': item[MAPPING['added-quantity']] ?? 0,
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
