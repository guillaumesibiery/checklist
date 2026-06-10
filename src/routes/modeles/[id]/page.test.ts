import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageState } from './page.svelte.ts';
import { db } from '$lib/ts/db';

vi.mock('svelte', () => ({
    onMount: vi.fn((fn) => fn()),
    tick: vi.fn()
}));

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

vi.mock('$app/paths', () => ({
    base: ''
}));

// Mock du layoutState pour que save() fonctionne
vi.mock('$lib/ts/layoutState.svelte.ts', () => ({
    layoutState: {
        user: { id: 1, uuid: 'user-uuid-test', firstName: 'Test' }
    }
}));

describe('Model Editor State', () => {
    const modelId = 'test-model-id';

    beforeEach(async () => {
        await db.models.clear();
        await db.users.clear();
        vi.clearAllMocks();

        // Créer un modèle de test avec deux catégories
        await db.models.add({
            modelId: modelId,
            modelName: 'Test Model',
            modelCreationDate: new Date().toISOString(),
            modelLastModifiedDate: new Date().toISOString(),
            userId: 'user-uuid-test',
            elements: [
                {
                    category: 'Cat1',
                    progress: 0,
                    addedByUser: false,
                    items: [
                        {
                            item: 'Item1',
                            'wanted-quantity': 2,
                            'added-quantity': 0,
                            disabled: false,
                            addedByUser: false
                        }
                    ]
                },
                {
                    category: 'Cat2',
                    progress: 0,
                    addedByUser: false,
                    items: []
                }
            ]
        } as any);
    });

    it('devrait initialiser en chargement', () => {
        const state = createPageState('test-id');
        expect(state.loading).toBe(true);
    });

    // --- Tests de renommage de catégorie ---

    it('devrait renommer une catégorie si le nouveau nom est unique', async () => {
        const state = createPageState(modelId);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(state.model?.elements[0].category).toBe('Cat1');

        state.openEditCategoryModal(0);
        state.editCategoryName = 'CatRenamed';
        await state.renameCategory();
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(state.model?.elements[0].category).toBe('CatRenamed');

        // Vérifier en base
        const updated = await db.models.where('modelId').equals(modelId).first();
        expect(updated?.elements[0].category).toBe('CatRenamed');
    });

    it('ne devrait pas renommer une catégorie si le nom existe déjà (insensible à la casse)', async () => {
        const state = createPageState(modelId);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(state.model?.elements.length).toBe(2);

        // Tenter de renommer Cat1 en 'cat2' (doublon insensible à la casse)
        state.openEditCategoryModal(0);
        state.editCategoryName = 'cat2';
        await state.renameCategory();

        // Le nom ne doit pas avoir changé
        expect(state.model?.elements[0].category).toBe('Cat1');
    });

    it('devrait fermer la modale sans modifier si le nom est identique', async () => {
        const state = createPageState(modelId);
        await new Promise(resolve => setTimeout(resolve, 100));

        state.openEditCategoryModal(0);
        // On garde le même nom
        await state.renameCategory();

        expect(state.model?.elements[0].category).toBe('Cat1');
        expect(state.isEditCategoryModalOpen).toBe(false);
    });

    it('ne devrait pas renommer une catégorie avec un nom vide', async () => {
        const state = createPageState(modelId);
        await new Promise(resolve => setTimeout(resolve, 100));

        state.openEditCategoryModal(0);
        state.editCategoryName = '   ';
        await state.renameCategory();

        expect(state.model?.elements[0].category).toBe('Cat1');
    });

    // --- Tests d'édition d'élément ---

    it('devrait modifier le nom et la quantité d\'un élément existant', async () => {
        const state = createPageState(modelId);
        await new Promise(resolve => setTimeout(resolve, 100));

        const cat = state.model?.elements.find(e => e.category === 'Cat1');
        expect(cat?.items[0].item).toBe('Item1');
        expect(cat?.items[0]['wanted-quantity']).toBe(2);

        state.openEditItemModal('Cat1', 0);
        state.newItemName = 'ItemRenamed';
        state.newItemQuantity = 5;
        await state.addItem();
        await new Promise(resolve => setTimeout(resolve, 100));

        const updatedCat = state.model?.elements.find(e => e.category === 'Cat1');
        expect(updatedCat?.items[0].item).toBe('ItemRenamed');
        expect(updatedCat?.items[0]['wanted-quantity']).toBe(5);

        // Vérifier en base
        const updated = await db.models.where('modelId').equals(modelId).first();
        const dbCat = updated?.elements.find(e => e.category === 'Cat1');
        expect(dbCat?.items[0].item).toBe('ItemRenamed');
    });

    it('ne devrait pas renommer un élément si le nom existe déjà dans la même catégorie', async () => {
        const state = createPageState(modelId);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Ajouter un deuxième item dans Cat1
        state.openAddItemModal('Cat1');
        state.newItemName = 'Item2';
        state.newItemQuantity = 1;
        await state.addItem();
        await new Promise(resolve => setTimeout(resolve, 100));

        const cat = state.model?.elements.find(e => e.category === 'Cat1');
        expect(cat?.items.length).toBe(2);

        // Tenter de renommer Item1 en 'item2' (doublon insensible à la casse)
        // Item1 est maintenant à l'index 1 (car Item2 a été ajouté en tête)
        state.openEditItemModal('Cat1', 1);
        state.newItemName = 'item2';
        await state.addItem();

        const updatedCat = state.model?.elements.find(e => e.category === 'Cat1');
        expect(updatedCat?.items[1].item).toBe('Item1');
    });
});
