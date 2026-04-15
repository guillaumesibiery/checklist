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

    it('devrait mettre à jour une checklist avec des items et du progrès', async () => {
        const userId = await db.users.add({ firstName: 'UserProgress' });
        const checklist = {
            checklistId: 'test-uuid-progress',
            checklistName: 'Checklist Progrès',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Model',
            elements: [
                {
                    category: 'Test Cat',
                    progress: '0',
                    items: [
                        { item: 'Item 1', 'wanted-quantity': '2', 'added-quantity': '0', disabled: '' },
                        { item: 'Item 2', 'wanted-quantity': '1', 'added-quantity': '0', disabled: '' }
                    ]
                }
            ]
        };
        const id = await db.checklists.add(checklist as any);
        
        const c = await db.checklists.get(id);
        if (c) {
            c.elements[0].items[0]['added-quantity'] = '1';
            c.elements[0].progress = '50';
            c.progress = '33';
            await db.checklists.update(id, c);
        }

        const updated = await db.checklists.get(id);
        expect(updated?.elements[0].items[0]['added-quantity']).toBe('1');
        expect(updated?.elements[0].progress).toBe('50');
        expect(updated?.progress).toBe('33');
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

    it('devrait supprimer toutes les checklists associées lors de la suppression d\'un utilisateur', async () => {
        // 1. Créer un utilisateur
        const userId = await db.users.add({ firstName: 'UserToDelete' });

        // 2. Lui associer des checklists
        await db.checklists.add({
            checklistId: 'c1',
            checklistName: 'Checklist 1',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Model',
            elements: []
        });
        await db.checklists.add({
            checklistId: 'c2',
            checklistName: 'Checklist 2',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'Model',
            elements: []
        });

        // Vérifier qu'elles sont là
        const countBefore = await db.checklists.where('userId').equals(userId).count();
        expect(countBefore).toBe(2);

        // 3. Simuler la logique de suppression (celle implémentée dans page.svelte.ts)
        await db.checklists.where('userId').equals(userId).delete();
        await db.users.delete(userId);

        // 4. Vérifier que tout est supprimé
        const user = await db.users.get(userId);
        const checklistsCount = await db.checklists.where('userId').equals(userId).count();

        expect(user).toBeUndefined();
        expect(checklistsCount).toBe(0);
    });
});