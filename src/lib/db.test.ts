import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

describe('Database Operations', () => {
    beforeEach(async () => {
        // Clear the database avant chaque test pour avoir un environnement propre
        await db.users.clear();
    });

    it('devrait insérer un utilisateur (insert)', async () => {
        const id = await db.users.add({ firstName: 'Test' });
        expect(id).toBeDefined();

        const user = await db.users.get(id);
        expect(user).toBeDefined();
        expect(user?.firstName).toBe('Test');
    });

    it('devrait récupérer un utilisateur par prénom (select)', async () => {
        await db.users.add({ firstName: 'Alice' });
        await db.users.add({ firstName: 'Bob' });

        const user = await db.users.where('firstName').equals('Bob').first();
        expect(user).toBeDefined();
        expect(user?.firstName).toBe('Bob');
    });

    it('devrait mettre à jour un utilisateur (update)', async () => {
        const id = await db.users.add({ firstName: 'Charlie' });
        
        await db.users.update(id, { firstName: 'Charlie Updated' });

        const user = await db.users.get(id);
        expect(user?.firstName).toBe('Charlie Updated');
    });

    it('devrait supprimer un utilisateur (delete)', async () => {
        const id = await db.users.add({ firstName: 'David' });

        await db.users.delete(id);

        const user = await db.users.get(id);
        expect(user).toBeUndefined();
    });

    it('ne devrait pas permettre d\'insérer deux utilisateurs avec le même prénom', async () => {
        await db.users.add({ firstName: 'Eve' });
        
        await expect(db.users.add({ firstName: 'Eve' })).rejects.toThrow();
    });
});