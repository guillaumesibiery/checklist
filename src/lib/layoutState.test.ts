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

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key: string) => { delete store[key]; }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

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
});
