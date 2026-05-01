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

describe('Model Editor State', () => {
    beforeEach(async () => {
        await db.models.clear();
        await db.users.clear();
    });

    it('devrait initialiser en chargement', () => {
        const state = createPageState('test-id');
        expect(state.loading).toBe(true);
    });
});
