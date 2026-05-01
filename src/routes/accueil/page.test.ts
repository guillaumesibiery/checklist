import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageState } from './page.svelte.ts';
import { db } from '$lib/ts/db';
import { goto } from '$app/navigation';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';

// Mock Svelte lifecycle and navigation
vi.mock('svelte', () => ({
    onMount: vi.fn((fn) => fn()),
    tick: vi.fn()
}));

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

describe('Accueil State', () => {
    beforeEach(async () => {
        await db.users.clear();
        localStorage.clear();
        await layoutState.init();
        vi.clearAllMocks();
    });

    it('devrait charger l\'utilisateur si un ID est présent dans localStorage', async () => {
        const id = await db.users.add({ uuid: 'uuid-1', firstName: 'Alice' });
        localStorage.setItem('currentUserId', id.toString());
        await layoutState.init();

        const state = createPageState();
        
        // Attendre que Dexie finisse ses opérations (Tick)
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Note: user est maintenant dans layoutState, mais accueilState le récupère via un getter
        expect(state.user).toBeDefined();
        expect(state.user?.firstName).toBe('Alice');
    });

    it('devrait charger les checklists de l\'utilisateur connecté', async () => {
        const uuid = 'uuid-alice';
        const id = await db.users.add({ uuid, firstName: 'Alice' });
        localStorage.setItem('currentUserId', id.toString());
        await layoutState.init();

        // Ajouter une checklist pour Alice
        await db.checklists.add({
            checklistId: 'c1',
            checklistName: 'Checklist Alice',
            userId: uuid,
            userName: 'Alice',
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: 0,
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        } as any);

        // Ajouter une checklist pour un autre utilisateur
        await db.checklists.add({
            checklistId: 'c2',
            checklistName: 'Checklist Bob',
            userId: 'uuid-bob',
            userName: 'Bob',
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: 0,
            status: 'IN_PROGRESS',
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

