import { type Model } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { ModelRepository } from '$lib/ts/repositories/ModelRepository';
import { toastState } from '$lib/ts/toastState.svelte';

export function createPageState(modelId: string) {
    let model = $state<Model | null>(null);
    let loading = $state(true);
    let expandedCategories = $state(new Set<number>());
    
    let isAddCategoryModalOpen = $state(false);
    let newCategoryName = $state("");
    
    let isAddItemModalOpen = $state(false);
    let newItemName = $state("");
    let newItemQuantity = $state(1);
    let currentCategoryNameForNewItem = $state<string | null>(null);

    onMount(async () => {
        const m = await ModelRepository.getByUuid(modelId);
        if (m) {
            // Vérifier que le modèle appartient bien à l'utilisateur
            if (layoutState.user?.uuid && m.userId !== layoutState.user.uuid) {
                goto(`${base}/modeles/`);
                return;
            }
            model = m;
            // Ouvrir toutes les catégories par défaut
            const initialSet = new Set<number>();
            m.elements.forEach((_, index) => initialSet.add(index));
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
        if (!model) return;
        
        model.modelLastModifiedDate = new Date().toISOString();
        if (layoutState.user?.id) {
            model.userId = layoutState.user.uuid;
        }

        // On s'assure que addedByUser est à false pour toutes les catégories du modèle
        model.elements.forEach(el => {
            el.addedByUser = false;
        });
        
        const existing = await ModelRepository.getByUuid(modelId);
        if (existing && existing.id) {
            const rawModel = $state.snapshot(model);
            if (rawModel) {
                rawModel.id = existing.id;
                try {
                    await ModelRepository.save(rawModel);
                } catch (e) {
                    console.error("Erreur de sauvegarde:", e);
                    toastState.error("Erreur lors de l'enregistrement");
                }
            }
        }
    }

    function openAddCategoryModal() {
        isAddCategoryModalOpen = true;
        newCategoryName = "";
    }

    function closeAddCategoryModal() {
        isAddCategoryModalOpen = false;
    }

    async function addCategory() {
        if (!model || !newCategoryName.trim()) return;

        const nameToAdd = newCategoryName.trim();
        const exists = model.elements.some(
            e => e.category.toLowerCase() === nameToAdd.toLowerCase()
        );

        if (exists) return;

        newCategoryName = "";

        model.elements.unshift({
            category: nameToAdd,
            progress: 0,
            addedByUser: false,
            items: []
        });

        const newExpanded = new Set([0]);
        expandedCategories.forEach(idx => newExpanded.add(idx + 1));
        expandedCategories = newExpanded;

        await save();
        toastState.success(`Catégorie "${nameToAdd}" ajoutée au modèle`);
        closeAddCategoryModal();
    }

    function openAddItemModal(categoryName: string) {
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
        if (!model || currentCategoryNameForNewItem === null || !newItemName.trim()) return;

        const nameToAdd = newItemName.trim();
        const category = model.elements.find(e => e.category === currentCategoryNameForNewItem);
        
        if (!category) return;

        const exists = category.items.some(
            item => item.item.toLowerCase() === nameToAdd.toLowerCase()
        );

        if (exists) return;

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
        toastState.success(`Élément "${nameToAdd}" ajouté au modèle`);
        closeAddItemModal();
    }

    async function updateItemQuantity(categoryIndex: number, itemIndex: number, delta: number) {
        if (!model) return;
        const item = model.elements[categoryIndex].items[itemIndex];
        const currentQty = Number(item['wanted-quantity']) || 1;
        item['wanted-quantity'] = Math.max(1, currentQty + delta);
        await save();
    }

    async function deleteItem(categoryIndex: number, itemIndex: number) {
        if (!model) return;
        const name = model.elements[categoryIndex].items[itemIndex].item;
        model.elements[categoryIndex].items.splice(itemIndex, 1);
        await save();
        toastState.success(`Élément "${name}" retiré du modèle`);
    }

    async function deleteCategory(index: number) {
        if (!model) return;
        const name = model.elements[index].category;
        model.elements.splice(index, 1);
        
        const newExpanded = new Set<number>();
        expandedCategories.forEach(idx => {
            if (idx < index) newExpanded.add(idx);
            else if (idx > index) newExpanded.add(idx - 1);
        });
        expandedCategories = newExpanded;
        
        await save();
        toastState.success(`Catégorie "${name}" retirée du modèle`);
    }

    function quit() {
        goto(`${base}/modeles/`);
    }

    return {
        get model() { return model; },
        get loading() { return loading; },
        get expandedCategories() { return expandedCategories; },
        get isAddCategoryModalOpen() { return isAddCategoryModalOpen; },
        get newCategoryName() { return newCategoryName; },
        set newCategoryName(value: string) { newCategoryName = value; },
        get isAddItemModalOpen() { return isAddItemModalOpen; },
        get newItemName() { return newItemName; },
        set newItemName(value: string) { newItemName = value; },
        get newItemQuantity() { return newItemQuantity; },
        set newItemQuantity(value: number) { newItemQuantity = value; },
        get itemExists() {
            if (!model || currentCategoryNameForNewItem === null || !newItemName.trim()) return false;
            const category = model.elements.find(e => e.category === currentCategoryNameForNewItem);
            if (!category) return false;
            return category.items.some(
                item => item.item.toLowerCase() === newItemName.trim().toLowerCase()
            );
        },
        get categoryExists() {
            if (!model || !newCategoryName.trim()) return false;
            return model.elements.some(
                e => e.category.toLowerCase() === newCategoryName.trim().toLowerCase()
            );
        },
        toggleCategory,
        quit,
        openAddCategoryModal,
        closeAddCategoryModal,
        addCategory,
        openAddItemModal,
        closeAddItemModal,
        addItem,
        updateItemQuantity,
        deleteItem,
        deleteCategory
    };
}
