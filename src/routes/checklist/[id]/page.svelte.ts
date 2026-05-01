import { type Checklist, type ChecklistItem } from '$lib/ts/db';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { ChecklistRepository } from '$lib/ts/repositories/ChecklistRepository';

export function createPageState(id: string, readOnly: boolean = false) {
    let checklist = $state<Checklist | null>(null);
    let loading = $state(true);
    let expandedCategories = $state(new Set<number>());
    let isFinalizeModalOpen = $state(false);
    let isShareModalOpen = $state(false);
    let isShareOptionsModalOpen = $state(false);
    let isAddCategoryModalOpen = $state(false);
    let newCategoryName = $state("");
    let isAddItemModalOpen = $state(false);
    let isEditMode = $state(false);
    let newItemName = $state("");
    let newItemQuantity = $state(1);
    let currentCategoryNameForNewItem = $state<string | null>(null);
    let isMobile = $state(false);

    onMount(async () => {
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const c = await ChecklistRepository.getByUuid(id);
        if (c) {
            checklist = c;
            // Par défaut, on ouvre toutes les catégories au chargement
            const initialSet = new Set<number>();
            c.elements.forEach((_, index) => initialSet.add(index));
            expandedCategories = initialSet;
        }
        loading = false;
    });

    function toggleCategory(index: number) {
        const newSet = new Set(expandedCategories);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        expandedCategories = newSet;
    }

    async function save() {
        if (!checklist || readOnly) return;
        
        // 1. Recalculer le progrès (mise à jour du Proxy Svelte)
        updateAllProgress();
        checklist.lastModifiedDate = new Date().toISOString();
        
        // 2. Récupérer l'enregistrement actuel en base pour garantir l'ID numérique
        const existing = await ChecklistRepository.getByUuid(id);
        
        if (existing && existing.id) {
            // 3. Créer un snapshot (objet brut) à partir de l'état réactif
            const rawChecklist = $state.snapshot(checklist);
            
            if (rawChecklist) {
                // 4. On s'assure que l'ID numérique interne est présent pour le 'put'
                rawChecklist.id = existing.id;
                
                // 5. Sauvegarde complète de l'objet (écrase l'existant)
                await ChecklistRepository.save(rawChecklist);
            }
        }
    }

    function updateAllProgress() {
        if (!checklist) return;

        let totalWanted = 0;
        let totalAdded = 0;

        checklist.elements.forEach(element => {
            let catWanted = 0;
            let catAdded = 0;

            element.items.forEach(item => {
                const wanted = Number(item['wanted-quantity']) || 0;
                const added = Number(item['added-quantity']) || 0;
                
                // Un item n'est compté dans le progrès que s'il n'est pas désactivé
                if (!item.disabled) {
                    catWanted += wanted;
                    // On ne peut pas avoir ajouté plus que demandé pour le calcul du progrès (%)
                    catAdded += Math.min(added, wanted);
                }
            });

            // Calcul du progrès par catégorie
            const catProgress = catWanted > 0 ? Math.round((catAdded / catWanted) * 100) : 0;
            element.progress = catProgress;

            totalWanted += catWanted;
            totalAdded += catAdded;
        });

        // Calcul du progrès global de la checklist
        const totalProgress = totalWanted > 0 ? Math.round((totalAdded / totalWanted) * 100) : 0;
        checklist.progress = totalProgress;
    }

    async function updateQuantity(categoryIndex: number, itemIndex: number, delta: number) {
        if (!checklist || readOnly) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];
        let added = Number(item['added-quantity']) || 0;

        added = Math.max(0, added + delta);
        item['added-quantity'] = added;
        
        await save();
    }

    async function toggleItem(categoryIndex: number, itemIndex: number) {
        if (!checklist || readOnly) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];
        const wanted = Number(item['wanted-quantity']) || 0;
        let added = Number(item['added-quantity']) || 0;

        if (added >= wanted) {
            item['added-quantity'] = 0;
        } else {
            item['added-quantity'] = wanted;
        }

        await save();
    }

    async function toggleDisabled(categoryIndex: number, itemIndex: number) {
        if (!checklist || readOnly) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];
        item.disabled = !item.disabled;
        
        await save();
    }

    function openAddCategoryModal() {
        if (readOnly) return;
        isAddCategoryModalOpen = true;
        newCategoryName = "";
    }

    function closeAddCategoryModal() {
        isAddCategoryModalOpen = false;
    }

    async function addCategory() {
        if (!checklist || readOnly || !newCategoryName.trim()) return;

        const nameToAdd = newCategoryName.trim();
        const exists = checklist.elements.some(
            e => e.category.toLowerCase() === nameToAdd.toLowerCase()
        );

        if (exists) {
            return;
        }

        // On vide le champ immédiatement pour éviter le flash du message d'erreur "doublon" 
        // pendant la transition de fermeture de la modale
        newCategoryName = "";

        checklist.elements.unshift({
            category: nameToAdd,
            progress: 0,
            addedByUser: true,
            items: []
        });

        // Ouvrir la nouvelle catégorie (index 0) par défaut
        const newExpanded = new Set([0]);
        // On décale les autres catégories déjà ouvertes
        expandedCategories.forEach(idx => newExpanded.add(idx + 1));
        expandedCategories = newExpanded;

        await save();
        closeAddCategoryModal();
    }

    function openAddItemModal(categoryName: string) {
        if (readOnly) return;
        currentCategoryNameForNewItem = categoryName;
        isAddItemModalOpen = true;
        newItemName = "";
        newItemQuantity = 1;
    }

    function closeAddItemModal() {
        isAddItemModalOpen = false;
        currentCategoryNameForNewItem = null;
    }

    async function addItem() {
        if (!checklist || readOnly || currentCategoryNameForNewItem === null || !newItemName.trim()) return;

        const nameToAdd = newItemName.trim();
        const category = checklist.elements.find(e => e.category === currentCategoryNameForNewItem);
        
        if (!category) return;

        const exists = category.items.some(
            item => item.item.toLowerCase() === nameToAdd.toLowerCase()
        );

        if (exists) return;

        // Vider le champ immédiatement pour éviter le flash du message d'erreur
        const quantityToAdd = newItemQuantity;
        newItemName = "";
        newItemQuantity = 1;

        category.items = [
            {
                item: nameToAdd,
                'wanted-quantity': quantityToAdd,
                'added-quantity': 0,
                disabled: false,
                addedByUser: true
            },
            ...category.items
        ];

        await save();
        closeAddItemModal();
    }

    async function deleteItem(categoryIndex: number, itemIndex: number) {
        if (!checklist || readOnly) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];

        if (item.addedByUser) {
            checklist.elements[categoryIndex].items.splice(itemIndex, 1);
            await save();
        }
    }

    async function deleteCategory(index: number) {
        if (!checklist || readOnly) return;
        const element = checklist.elements[index];
        
        // Sécurité : on ne supprime que si c'est une catégorie ajoutée par l'utilisateur
        if (element.addedByUser) {
            checklist.elements.splice(index, 1);
            
            // Mise à jour des catégories dépliées
            const newExpanded = new Set<number>();
            expandedCategories.forEach(idx => {
                if (idx < index) newExpanded.add(idx);
                else if (idx > index) newExpanded.add(idx - 1);
            });
            expandedCategories = newExpanded;
            
            await save();
        }
    }

    function quit() {
        if (readOnly) {
            goto(`${base}/historique/`);
        } else {
            goto(`${base}/accueil/`);
        }
    }

    function openFinalizeModal() {
        if (readOnly) return;
        isFinalizeModalOpen = true;
    }

    function closeFinalizeModal() {
        isFinalizeModalOpen = false;
    }

    async function finalize() {
        if (!checklist || readOnly) return;
        
        checklist.status = 'FINISHED';
        await save();
        goto(`${base}/accueil/`);
    }

    function openShareModal() {
        isShareModalOpen = true;
    }

    function closeShareModal() {
        isShareModalOpen = false;
    }

    function openShareOptionsModal() {
        isShareModalOpen = false;
        isShareOptionsModalOpen = true;
    }

    function closeShareOptionsModal() {
        isShareOptionsModalOpen = false;
    }

    function getMissingItemsText() {
        if (!checklist) return "";
        let text = `Liste des éléments manquants pour ma checklist "${checklist.checklistName}" :\n\n`;
        let hasMissing = false;

        checklist.elements.forEach(element => {
            const missingInCategory = element.items.filter(item => {
                if (item.disabled) return false;
                
                const wanted = Number(item['wanted-quantity']) || 0;
                const added = Number(item['added-quantity']) || 0;
                return added < wanted;
            });

            if (missingInCategory.length > 0) {
                hasMissing = true;
                text += `* ${element.category.toUpperCase()} *\n`;
                missingInCategory.forEach(item => {
                    const wanted = Number(item['wanted-quantity']) || 0;
                    const added = Number(item['added-quantity']) || 0;
                    const missing = wanted - added;
                    text += `- ${item.item} (manque ${missing})\n`;
                });
                text += "\n";
            }
        });

        if (!hasMissing) {
            return `Tous les éléments de ma checklist "${checklist.checklistName}" sont complets !`;
        }
        return text;
    }

    function shareViaEmail() {
        if (!checklist) return;
        const subject = encodeURIComponent(`Checklist : ${checklist.checklistName} - Éléments manquants`);
        const body = encodeURIComponent(getMissingItemsText());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    function shareViaSMS() {
        const body = encodeURIComponent(getMissingItemsText());
        window.location.href = `sms:?body=${body}`;
    }

    function shareViaWhatsApp() {
        const text = encodeURIComponent(getMissingItemsText());
        window.open(`https://wa.me/?text=${text}`, '_blank');
    }

    return {
        get checklist() { return checklist; },
        get loading() { return loading; },
        get expandedCategories() { return expandedCategories; },
        get isFinalizeModalOpen() { return isFinalizeModalOpen; },
        get isShareModalOpen() { return isShareModalOpen; },
        get isShareOptionsModalOpen() { return isShareOptionsModalOpen; },
        get isAddCategoryModalOpen() { return isAddCategoryModalOpen; },
        get newCategoryName() { return newCategoryName; },
        set newCategoryName(value: string) { newCategoryName = value; },
        get isAddItemModalOpen() { return isAddItemModalOpen; },
        get newItemName() { return newItemName; },
        set newItemName(value: string) { newItemName = value; },
        get newItemQuantity() { return newItemQuantity; },
        set newItemQuantity(value: number) { newItemQuantity = value; },
        get itemExists() {
            if (!checklist || currentCategoryNameForNewItem === null || !newItemName.trim()) return false;
            const category = checklist.elements.find(e => e.category === currentCategoryNameForNewItem);
            if (!category) return false;
            return category.items.some(
                item => item.item.toLowerCase() === newItemName.trim().toLowerCase()
            );
        },
        get categoryExists() {
            if (!checklist || !newCategoryName.trim()) return false;
            return checklist.elements.some(
                e => e.category.toLowerCase() === newCategoryName.trim().toLowerCase()
            );
        },
        get isMobile() { return isMobile; },
        get readOnly() { return readOnly; },
        get isEditMode() { return isEditMode; },
        toggleEditMode() { isEditMode = !isEditMode; },
        updateQuantity,
        toggleItem,
        toggleDisabled,
        toggleCategory,
        quit,
        openFinalizeModal,
        closeFinalizeModal,
        finalize,
        openShareModal,
        closeShareModal,
        openShareOptionsModal,
        closeShareOptionsModal,
        openAddCategoryModal,
        closeAddCategoryModal,
        addCategory,
        openAddItemModal,
        closeAddItemModal,
        addItem,
        deleteItem,
        deleteCategory,
        shareViaEmail,
        shareViaSMS,
        shareViaWhatsApp
    };
}
