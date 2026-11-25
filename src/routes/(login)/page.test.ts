import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPageState } from './page.svelte';
import { db } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';

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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('devrait purger toutes les données quand le dernier utilisateur est supprimé', async () => {
        const user = { uuid: 'uuid-1', firstName: 'Alice' };
        const userId = await db.users.add(user);
        
        // Ajouter des données annexes
        await db.checklists.add({
            checklistId: 'c1',
            checklistName: 'C1',
            userId: user.uuid,
            userName: 'Alice',
            creationDate: '',
            lastModifiedDate: '',
            progress: 0,
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        } as any);
        
        localStorage.setItem('someKey', 'someValue');
        
        const state = createPageState();
        
        // Simuler la sélection pour suppression
        state.promptDeleteUser({ id: userId, uuid: user.uuid, firstName: 'Alice' } as any, { stopPropagation: () => {} } as any);
        
        const spyPurge = vi.spyOn(db, 'purgeAllData');
        
        await state.confirmDeleteUser();
        
        expect(spyPurge).toHaveBeenCalled();
        expect(await db.users.count()).toBe(0);
        expect(await db.checklists.count()).toBe(0);
        expect(localStorage.getItem('someKey')).toBeNull();
        
        spyPurge.mockRestore();
    });

    it('ne devrait pas purger tout s\'il reste des utilisateurs', async () => {
        const id1 = await db.users.add({ uuid: 'uuid-1', firstName: 'Alice' });
        const id2 = await db.users.add({ uuid: 'uuid-2', firstName: 'Bob' });
        
        localStorage.setItem('someKey', 'someValue');
        
        const state = createPageState();
        state.promptDeleteUser({ id: id1, uuid: 'uuid-1', firstName: 'Alice' } as any, { stopPropagation: () => {} } as any);
        
        const spyPurge = vi.spyOn(db, 'purgeAllData');
        
        await state.confirmDeleteUser();
        
        expect(spyPurge).not.toHaveBeenCalled();
        expect(await db.users.count()).toBe(1);
        expect(localStorage.getItem('someKey')).toBe('someValue');
        
        spyPurge.mockRestore();
    });

    it('devrait réinitialiser le thème lors de la suppression d\'un utilisateur', async () => {
        const userId = await db.users.add({ uuid: 'uuid-1', firstName: 'Alice' });
        localStorage.setItem('darkMode', 'true');
        await layoutState.init();
        expect(layoutState.isDarkMode).toBe(true);

        const state = createPageState();
        state.promptDeleteUser({ id: userId, uuid: 'uuid-1', firstName: 'Alice' } as any, { stopPropagation: () => {} } as any);
        
        await state.confirmDeleteUser();
        
        expect(layoutState.isDarkMode).toBe(false);
    });

    describe('Creation de l\'utilisateur', () => {
        it('devrait permettre de créer le premier utilisateur', async () => {
            const state = createPageState();
            state.firstName = 'Alice';
            await state.createUser();

            expect(await db.users.count()).toBe(1);
        });

        it('ne devrait pas permettre de créer un deuxième utilisateur', async () => {
            await db.users.add({ uuid: 'uuid-1', firstName: 'Alice' });            
            const state = createPageState();
            state.firstName = 'Bob';
            await state.createUser();

            expect(await db.users.count()).toBe(1);
            expect(await db.users.where('firstName').equals('Bob').count()).toBe(0);
        });
    });

    describe('Vérification de mise à jour et version affichée', () => {
        it('initialise currentVersion avec la version stockée si elle est plus récente que le build', () => {
            expect.assertions(1);

            localStorage.setItem('app_last_known_version', '99.0.0');
            const state = createPageState();

            expect(state.currentVersion).toBe('99.0.0');
        });

        it('met à jour currentVersion lorsqu\'une nouvelle version est détectée via handleCheckUpdate', async () => {
            expect.assertions(3);

            localStorage.setItem('app_last_known_version', '1.16.4');
            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(JSON.stringify({ version: '99.1.0' }), { status: 200 })
            );

            const state = createPageState();
            await state.handleCheckUpdate();

            expect(state.updateChecking).toBe(false);
            expect(state.updateResult).toEqual({ status: 'updated', newVersion: '99.1.0' });
            expect(state.currentVersion).toBe('99.1.0');
        });

        it('met à jour currentVersion lors d\'une première vérification si la version distante est plus récente', async () => {
            expect.assertions(2);

            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(JSON.stringify({ version: '99.2.0' }), { status: 200 })
            );

            const state = createPageState();
            await state.handleCheckUpdate();

            expect(state.updateResult).toEqual({ status: 'up-to-date', version: '99.2.0' });
            expect(state.currentVersion).toBe('99.2.0');
        });

        it('conserve currentVersion intacte en mode hors-ligne', async () => {
            expect.assertions(2);

            vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

            const state = createPageState();
            const initialVersion = state.currentVersion;
            await state.handleCheckUpdate();

            expect(state.updateResult).toEqual({ status: 'offline' });
            expect(state.currentVersion).toBe(initialVersion);
        });
    });
});
