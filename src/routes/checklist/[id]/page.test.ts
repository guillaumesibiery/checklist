import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageState } from './page.svelte.ts';
import { db } from '$lib/ts/db';

// Mock Svelte lifecycle and navigation
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

vi.mock('$app/state', () => ({
    page: {
        url: {
            searchParams: new URLSearchParams()
        },
        params: {
            id: 'test-id'
        }
    }
}));

describe('Checklist State - Add Category', () => {
    const checklistId = 'test-id';

    beforeEach(async () => {
        await db.checklists.clear();
        await db.users.clear();
        vi.clearAllMocks();

        // Create a dummy checklist
        await db.checklists.add({
            checklistId: checklistId,
            checklistName: 'Test Checklist',
            userId: 1,
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Test Model',
            elements: [
                {
                    category: 'Cat1',
                    progress: '0',
                    items: []
                }
            ]
        });
    });

    it('devrait ajouter une catégorie si elle n\'existe pas', async () => {
        const state = createPageState(checklistId);
        
        // Attendre que le chargement soit fini (Dexie est asynchrone)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(state.checklist).not.toBeNull();
        expect(state.checklist?.elements.length).toBe(1);

        state.newCategoryName = 'Cat2';
        await state.addCategory();

        expect(state.checklist?.elements.length).toBe(2);
        expect(state.checklist?.elements[0].category).toBe('Cat2');
        expect(state.checklist?.elements[0].addedByUser).toBe(true);
        
        // Vérifier en base
        const updated = await db.checklists.where('checklistId').equals(checklistId).first();
        expect(updated?.elements.length).toBe(2);
        expect(updated?.elements[0].category).toBe('Cat2');
        expect(updated?.elements[0].addedByUser).toBe(true);
    });

    it('ne devrait pas ajouter une catégorie si elle existe déjà (insensible à la casse)', async () => {
        const state = createPageState(checklistId);
        
        // Attendre que le chargement soit fini
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(state.checklist?.elements.length).toBe(1);

        state.newCategoryName = 'cat1'; // Déjà présente sous 'Cat1'
        await state.addCategory();

        expect(state.checklist?.elements.length).toBe(1);
    });

    it('ne devrait pas ajouter une catégorie vide', async () => {
        const state = createPageState(checklistId);
        
        // Attendre que le chargement soit fini
        await new Promise(resolve => setTimeout(resolve, 100));
        
        state.newCategoryName = '   ';
        await state.addCategory();

        expect(state.checklist?.elements.length).toBe(1);
    });

    it('devrait ajouter un item dans une catégorie utilisateur', async () => {
        const state = createPageState(checklistId);
        await new Promise(resolve => setTimeout(resolve, 500));

        // On ajoute manuellement une catégorie utilisateur au state pour simplifier
        if (state.checklist) {
            state.checklist.elements.unshift({
                category: 'UserCat',
                progress: '0',
                addedByUser: "true",
                items: []
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Ajouter un item dans cette catégorie
        state.openAddItemModal('UserCat');
        state.newItemName = 'UserItem';
        state.newItemQuantity = 3;
        await state.addItem();
        await new Promise(resolve => setTimeout(resolve, 500));

        const cat = state.checklist?.elements.find(e => e.category === 'UserCat');
        expect(cat?.items.length).toBe(1);
        expect(cat?.items[0].item).toBe('UserItem');
        expect(cat?.items[0]['wanted-quantity']).toBe(3);
    });

    it('ne devrait pas ajouter un item déjà existant dans la même catégorie', async () => {
        const state = createPageState(checklistId);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (state.checklist) {
            state.checklist.elements.unshift({
                category: 'UserCat',
                progress: '0',
                addedByUser: "true",
                items: [{
                    item: 'UserItem',
                    'wanted-quantity': 1,
                    'added-quantity': 0,
                    disabled: ""
                }]
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        state.newItemName = 'useritem'; // Même nom, casse différente
        state.openAddItemModal('UserCat');
        await state.addItem();
        await new Promise(resolve => setTimeout(resolve, 500));

        const cat = state.checklist?.elements.find(e => e.category === 'UserCat');
        expect(cat?.items.length).toBe(1);
    });

    it('devrait supprimer un item ajouté par l\'utilisateur', async () => {
        const state = createPageState(checklistId);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (state.checklist) {
            state.checklist.elements.unshift({
                category: 'UserCat',
                progress: '0',
                addedByUser: "true",
                items: [{
                    item: 'UserItem',
                    'wanted-quantity': 1,
                    'added-quantity': 0,
                    disabled: "",
                    addedByUser: "true"
                }]
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const catIndex = state.checklist?.elements.findIndex(e => e.category === 'UserCat') ?? -1;
        await state.deleteItem(catIndex, 0);
        await new Promise(resolve => setTimeout(resolve, 500));

        const cat = state.checklist?.elements.find(e => e.category === 'UserCat');
        expect(cat?.items.length).toBe(0);
    });

    it('devrait supprimer une catégorie et tous ses items', async () => {
        const state = createPageState(checklistId);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (state.checklist) {
            state.checklist.elements.unshift({
                category: 'UserCat',
                progress: '0',
                addedByUser: "true",
                items: [{
                    item: 'Item1',
                    'wanted-quantity': 1,
                    'added-quantity': 0,
                    disabled: "",
                    addedByUser: "true"
                }, {
                    item: 'Item2',
                    'wanted-quantity': 1,
                    'added-quantity': 0,
                    disabled: "",
                    addedByUser: "true"
                }]
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(state.checklist?.elements[0].items.length).toBe(2);

        await state.deleteCategory(0);
        await new Promise(resolve => setTimeout(resolve, 500));

        const cat = state.checklist?.elements.find(e => e.category === 'UserCat');
        expect(cat).toBeUndefined();
        
        // Vérifier en base
        const updated = await db.checklists.where('checklistId').equals(checklistId).first();
        expect(updated?.elements.find(e => e.category === 'UserCat')).toBeUndefined();
    });

    it('devrait ajouter un item dans une catégorie système (venant d\'un modèle)', async () => {
        const state = createPageState(checklistId);
        await new Promise(resolve => setTimeout(resolve, 500));

        // 'Cat1' est une catégorie système créée dans beforeEach
        expect(state.checklist?.elements.find(e => e.category === 'Cat1')?.addedByUser).toBeUndefined();
        
        state.openAddItemModal('Cat1');
        state.newItemName = 'NewItemInSystemCat';
        state.newItemQuantity = 1;
        await state.addItem();
        await new Promise(resolve => setTimeout(resolve, 500));

        const cat = state.checklist?.elements.find(e => e.category === 'Cat1');
        expect(cat?.items.length).toBe(1);
        expect(cat?.items[0].item).toBe('NewItemInSystemCat');
        expect(cat?.items[0].addedByUser).toBe(true);
    });

    it('devrait basculer le mode édition', async () => {
        const state = createPageState(checklistId);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(state.isEditMode).toBe(false);
        state.toggleEditMode();
        expect(state.isEditMode).toBe(true);
        state.toggleEditMode();
        expect(state.isEditMode).toBe(false);
    });
});
