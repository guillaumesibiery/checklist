import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLayoutState } from './layoutState.svelte';
import { db } from './db';

// Mock navigation
vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

vi.mock('$app/paths', () => ({
    base: ''
}));

describe('Layout State', () => {
    beforeEach(async () => {
        await db.users.clear();
        await db.models.clear();
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('devrait charger les modèles par défaut sans utilisateur connecté', async () => {
        const state = createLayoutState();
        await state.loadAvailableModels();

        expect(state.availableModels).toEqual([
            { name: 'Modèle vide', file: 'model-vide.json' },
            { name: 'Bébé pack', file: 'model-bebepack.json' }
        ]);
    });

    it('devrait charger les modèles par défaut et les modèles personnalisés avec un utilisateur connecté', async () => {
        const userId = await db.users.add({ firstName: 'Alice' });
        const user = await db.users.get(userId);
        
        const state = createLayoutState();
        state.user = user!;

        await db.models.add({
            modelName: 'Mon Modèle Perso',
            modelId: 'uuid-custom',
            userId: userId,
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        await state.loadAvailableModels();

        expect(state.availableModels).toContainEqual({ name: 'Modèle vide', file: 'model-vide.json' });
        expect(state.availableModels).toContainEqual({ name: 'Bébé pack', file: 'model-bebepack.json' });
        expect(state.availableModels).toContainEqual(expect.objectContaining({ name: 'Mon Modèle Perso' }));
    });

    it('devrait basculer le mode sombre globalement', async () => {
        const state = createLayoutState();
        expect(state.isDarkMode).toBe(false);

        state.toggleDarkMode();
        expect(state.isDarkMode).toBe(true);
        expect(localStorage.getItem('darkMode')).toBe('true');

        state.toggleDarkMode();
        expect(state.isDarkMode).toBe(false);
        expect(localStorage.getItem('darkMode')).toBe('false');
    });

    it('devrait persister le mode sombre après déconnexion', async () => {
        const state = createLayoutState();
        state.toggleDarkMode();
        expect(state.isDarkMode).toBe(true);

        state.logout();
        expect(state.isDarkMode).toBe(true);
        expect(localStorage.getItem('darkMode')).toBe('true');
    });

    it('devrait charger le mode sombre global lors de l\'initialisation', async () => {
        localStorage.setItem('darkMode', 'true');
        const state = createLayoutState();
        await state.init();
        expect(state.isDarkMode).toBe(true);
    });
});
