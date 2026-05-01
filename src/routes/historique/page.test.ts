import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageState } from './page.svelte.ts';
import { db } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

vi.mock('$app/paths', () => ({
    base: ''
}));

describe('Historique State', () => {
    beforeEach(async () => {
        await db.checklists.clear();
        await db.users.clear();
        localStorage.clear();
        await layoutState.init();
    });

    it('devrait initialiser avec une liste vide', () => {
        const state = createPageState();
        expect(state.checklists).toEqual([]);
        expect(state.isLoadingChecklists).toBe(true);
    });

    it('devrait charger les checklists terminées de n\'importe quel utilisateur', async () => {
        const uuid = 'uuid-alice';
        const id = await db.users.add({ uuid, firstName: 'Alice' });
        localStorage.setItem('currentUserId', id.toString());
        await layoutState.init();

        // Ajouter une checklist terminée pour Alice
        await db.checklists.add({
            checklistId: 'c1',
            checklistName: 'Checklist Alice',
            userId: uuid,
            userName: 'Alice',
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: 100,
            status: 'FINISHED',
            modelName: 'M1',
            elements: []
        } as any);

        // Ajouter une checklist terminée pour Bob (autre UUID)
        await db.checklists.add({
            checklistId: 'c2',
            checklistName: 'Checklist Bob',
            userId: 'uuid-bob',
            userName: 'Bob',
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: 100,
            status: 'FINISHED',
            modelName: 'M1',
            elements: []
        } as any);

        const state = createPageState();
        await state.loadChecklists();

        expect(state.checklists.length).toBe(2);
        expect(state.checklists.some(c => c.checklistName === 'Checklist Alice')).toBe(true);
        expect(state.checklists.some(c => c.checklistName === 'Checklist Bob')).toBe(true);
    });
});
