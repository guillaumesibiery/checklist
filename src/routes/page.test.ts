import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageState } from './page.svelte';
import { db } from '$lib/ts/db';

// Mock navigation
vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

vi.mock('$app/paths', () => ({
    base: ''
}));

describe('Page State - User Deletion', () => {
    beforeEach(async () => {
        await db.users.clear();
        await db.checklists.clear();
        await db.models.clear();
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('devrait purger toutes les données quand le dernier utilisateur est supprimé', async () => {
        const userId = await db.users.add({ firstName: 'Alice' });
        
        // Ajouter des données annexes
        await db.checklists.add({
            checklistId: 'c1',
            checklistName: 'C1',
            userId: userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        });
        
        localStorage.setItem('someKey', 'someValue');
        
        const state = createPageState();
        
        // Simuler la sélection pour suppression
        state.promptDeleteUser({ id: userId, firstName: 'Alice' }, { stopPropagation: () => {} } as any);
        
        const spyPurge = vi.spyOn(db, 'purgeAllData');
        
        await state.confirmDeleteUser();
        
        expect(spyPurge).toHaveBeenCalled();
        expect(await db.users.count()).toBe(0);
        expect(await db.checklists.count()).toBe(0);
        expect(localStorage.getItem('someKey')).toBeNull();
        
        spyPurge.mockRestore();
    });

    it('ne devrait pas purger tout s\'il reste des utilisateurs', async () => {
        const id1 = await db.users.add({ firstName: 'Alice' });
        const id2 = await db.users.add({ firstName: 'Bob' });
        
        localStorage.setItem('someKey', 'someValue');
        
        const state = createPageState();
        state.promptDeleteUser({ id: id1, firstName: 'Alice' }, { stopPropagation: () => {} } as any);
        
        const spyPurge = vi.spyOn(db, 'purgeAllData');
        
        await state.confirmDeleteUser();
        
        expect(spyPurge).not.toHaveBeenCalled();
        expect(await db.users.count()).toBe(1);
        expect(localStorage.getItem('someKey')).toBe('someValue');
        
        spyPurge.mockRestore();
    });
});
