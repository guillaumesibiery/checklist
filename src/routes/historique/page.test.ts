import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPageState } from './page.svelte.ts';
import { db } from '$lib/ts/db';

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
    });

    it('devrait initialiser avec une liste vide', () => {
        const state = createPageState();
        expect(state.checklists).toEqual([]);
        expect(state.isLoadingChecklists).toBe(true);
    });
});
