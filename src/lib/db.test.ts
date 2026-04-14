import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

describe('Database Operations', () => {
    beforeEach(async () => {
        // Clear the database avant chaque test pour avoir un environnement propre
        await db.users.clear();
        await db.checklists.clear();
    });

    it('devrait insérer une checklist (insert)', async () => {
        const userId = await db.users.add({ firstName: 'Test' });
        const checklist = {
            checklistId: 'test-uuid',
            checklistName: 'Ma Checklist',
            userId,
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: "0",
            status: "IN_PROGRESS",
            modelName: "Bébé pack",
            elements: []
        };
        const id = await db.checklists.add(checklist);
        expect(id).toBeDefined();

        const inserted = await db.checklists.get(id);
        expect(inserted?.checklistName).toBe('Ma Checklist');
        expect(inserted?.userId).toBe(userId);
    });

    it('devrait récupérer une checklist par nom et utilisateur (select)', async () => {
        const userId = await db.users.add({ firstName: 'Alice' });
        await db.checklists.add({
            checklistId: 'uuid1',
            checklistName: 'Voyage',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Model 1',
            elements: []
        });

        const found = await db.checklists
            .where({ userId, checklistName: 'Voyage' })
            .first();
        expect(found).toBeDefined();
        expect(found?.checklistName).toBe('Voyage');
    });

    it('devrait mettre à jour une checklist (update)', async () => {
        const id = await db.checklists.add({
            checklistId: 'uuid2',
            checklistName: 'Courses',
            userId: 1,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Model 1',
            elements: []
        });
        
        await db.checklists.update(id, { checklistName: 'Courses Updated' });

        const updated = await db.checklists.get(id);
        expect(updated?.checklistName).toBe('Courses Updated');
    });

    it('devrait supprimer une checklist (delete)', async () => {
        const id = await db.checklists.add({
            checklistId: 'uuid3',
            checklistName: 'A supprimer',
            userId: 1,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Model 1',
            elements: []
        });

        await db.checklists.delete(id);

        const found = await db.checklists.get(id);
        expect(found).toBeUndefined();
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