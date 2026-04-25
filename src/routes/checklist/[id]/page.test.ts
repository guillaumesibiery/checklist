import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createChecklistState } from './page.svelte.ts';
import { db } from '$lib/db';

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
        const state = createChecklistState(checklistId);
        
        // Attendre que le chargement soit fini (Dexie est asynchrone)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(state.checklist).not.toBeNull();
        expect(state.checklist?.elements.length).toBe(1);

        state.newCategoryName = 'Cat2';
        await state.addCategory();

        expect(state.checklist?.elements.length).toBe(2);
        expect(state.checklist?.elements[0].category).toBe('Cat2');
        expect(state.checklist?.elements[0].addedByUser).toBe("true");
        
        // Vérifier en base
        const updated = await db.checklists.where('checklistId').equals(checklistId).first();
        expect(updated?.elements.length).toBe(2);
        expect(updated?.elements[0].category).toBe('Cat2');
        expect(updated?.elements[0].addedByUser).toBe("true");
    });

    it('ne devrait pas ajouter une catégorie si elle existe déjà (insensible à la casse)', async () => {
        const state = createChecklistState(checklistId);
        
        // Attendre que le chargement soit fini
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(state.checklist?.elements.length).toBe(1);

        state.newCategoryName = 'cat1'; // Déjà présente sous 'Cat1'
        await state.addCategory();

        expect(state.checklist?.elements.length).toBe(1);
    });

    it('ne devrait pas ajouter une catégorie vide', async () => {
        const state = createChecklistState(checklistId);
        
        // Attendre que le chargement soit fini
        await new Promise(resolve => setTimeout(resolve, 100));
        
        state.newCategoryName = '   ';
        await state.addCategory();

        expect(state.checklist?.elements.length).toBe(1);
    });
});
