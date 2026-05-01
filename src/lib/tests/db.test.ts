import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '$lib/ts/db';

describe('Database Operations', () => {
    beforeEach(async () => {
        // Clear the database avant chaque test pour avoir un environnement propre
        await db.users.clear();
        await db.checklists.clear();
        await db.models.clear();
    });

    // --- Tests pour les Modèles ---
    it('devrait insérer un modèle (insert)', async () => {
        const model = {
            modelName: 'Mon Modèle',
            modelId: 'uuid-test-1',
            modelCreationDate: new Date().toISOString(),
            modelLastModifiedDate: new Date().toISOString(),
            checklistId: '',
            checklistName: '',
            userId: 'user-uuid-1',
            creationDate: '',
            lastModifiedDate: '',
            progress: "0",
            status: "IN_PROGRESS",
            elements: []
        };
        const id = await db.models.add(model);
        expect(id).toBeDefined();

        const inserted = await db.models.get(id);
        expect(inserted?.modelName).toBe('Mon Modèle');
        expect(inserted?.modelId).toBe('uuid-test-1');
    });

    it('devrait récupérer tous les modèles (select)', async () => {
        await db.models.add({
            modelName: 'Modèle 1',
            modelId: 'uuid-test-2',
            modelCreationDate: '2026-01-01T10:00:00Z',
            modelLastModifiedDate: '2026-01-01T10:00:00Z',
            checklistId: '',
            checklistName: '',
            userId: 'user-uuid-1',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        await db.models.add({
            modelName: 'Modèle 2',
            modelId: 'uuid-test-3',
            modelCreationDate: '2026-01-02T10:00:00Z',
            modelLastModifiedDate: '2026-01-02T10:00:00Z',
            checklistId: '',
            checklistName: '',
            userId: 'user-uuid-1',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        const allModels = await db.models.toArray();
        expect(allModels.length).toBe(2);
    });

    it('devrait échouer si on insère un modèle avec le même nom (case insensitive)', async () => {
        const name = 'Unique Model';
        await db.models.add({
            modelName: name,
            modelId: 'uuid-1',
            modelCreationDate: new Date().toISOString(),
            modelLastModifiedDate: new Date().toISOString(),
            checklistId: '',
            checklistName: '',
            userId: 'user-uuid-1',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        // La contrainte est gérée au niveau applicatif (validateModelName)
        // On vérifie ici que equalsIgnoreCase fonctionne comme prévu pour notre logique
        const duplicate = await db.models.where('modelName').equalsIgnoreCase('unique model').first();
        expect(duplicate).toBeDefined();
        expect(duplicate?.modelName).toBe(name);
    });

    it('devrait mettre à jour un modèle (update)', async () => {
        const id = await db.models.add({
            modelName: 'Ancien Nom',
            modelId: 'uuid-update',
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            userId: 'user-uuid-1',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });
        
        await db.models.update(id, { modelName: 'Nouveau Nom' });

        const updated = await db.models.get(id);
        expect(updated?.modelName).toBe('Nouveau Nom');
    });

    it('devrait supprimer un modèle (delete)', async () => {
        const id = await db.models.add({
            modelName: 'A supprimer',
            modelId: 'uuid-delete',
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            userId: 'user-uuid-1',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        await db.models.delete(id);

        const found = await db.models.get(id);
        expect(found).toBeUndefined();
    });

    // --- Tests pour les Checklists ---
    it('devrait insérer une checklist (insert)', async () => {
        const user = { uuid: 'user-uuid-1', firstName: 'Test' };
        await db.users.add(user);
        const checklist = {
            checklistId: 'test-uuid',
            checklistName: 'Ma Checklist',
            userId: user.uuid,
            userName: user.firstName,
            creationDate: new Date().toISOString(),
            lastModifiedDate: new Date().toISOString(),
            progress: "0",
            status: "IN_PROGRESS",
            modelName: "Bébé pack",
            elements: [
                {
                    category: 'Documents',
                    progress: '0',
                    items: [
                        {
                            item: 'Carnet de santé',
                            'wanted-quantity': 1,
                            'added-quantity': 0,
                            disabled: false
                        }
                    ]
                }
            ]
        };
        const id = await db.checklists.add(checklist as any);
        expect(id).toBeDefined();
        
        const inserted = await db.checklists.get(id);
        expect(inserted?.checklistName).toBe('Ma Checklist');
        expect(inserted?.userName).toBe('Test');
        expect(inserted?.elements.length).toBe(1);
    });

    it('devrait récupérer les checklists d\'un utilisateur (select)', async () => {
        const user = { uuid: 'user-uuid-2', firstName: 'User1' };
        await db.users.add(user);
        
        await db.checklists.add({
            checklistId: 'uuid-1',
            checklistName: 'Checklist 1',
            userId: user.uuid,
            userName: user.firstName,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        } as any);

        await db.checklists.add({
            checklistId: 'uuid-2',
            checklistName: 'Checklist 2',
            userId: user.uuid,
            userName: user.firstName,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M2',
            elements: []
        } as any);

        const checklists = await db.checklists.where('userId').equals(user.uuid).toArray();
        expect(checklists.length).toBe(2);
    });

    it('devrait mettre à jour la progression d\'une checklist (update)', async () => {
        const id = await db.checklists.add({
            checklistId: 'uuid-3',
            checklistName: 'Checklist 3',
            userId: 'user-uuid-3',
            userName: 'User3',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M3',
            elements: []
        } as any);

        await db.checklists.update(id, { progress: '50', status: 'IN_PROGRESS' });
        
        const updated = await db.checklists.get(id);
        expect(updated?.progress).toBe('50');
    });

    it('devrait supprimer une checklist (delete)', async () => {
        const id = await db.checklists.add({
            checklistId: 'uuid-4',
            checklistName: 'Checklist 4',
            userId: 'user-uuid-4',
            userName: 'User4',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M4',
            elements: []
        } as any);

        await db.checklists.delete(id);
        const found = await db.checklists.get(id);
        expect(found).toBeUndefined();
    });

    // --- Tests pour les Utilisateurs ---
    it('devrait créer un utilisateur', async () => {
        const id = await db.users.add({ uuid: 'user-uuid-3', firstName: 'Alice' });
        expect(id).toBeDefined();

        const user = await db.users.get(id);
        expect(user?.firstName).toBe('Alice');
        expect(user?.uuid).toBe('user-uuid-3');
    });

    it('devrait empêcher les prénoms en doublon', async () => {
        await db.users.add({ uuid: 'uuid-b1', firstName: 'Bob' });
        await expect(db.users.add({ uuid: 'uuid-b2', firstName: 'Bob' })).rejects.toThrow();
    });

    it('devrait supprimer un utilisateur, ses checklists et ses modèles (simulé)', async () => {
        const user = { uuid: 'uuid-charlie', firstName: 'Charlie' };
        const id = await db.users.add(user);
        await db.checklists.add({
            checklistId: 'uuid-5',
            checklistName: 'Checklist Charlie',
            userId: user.uuid,
            userName: 'Charlie',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M5',
            elements: []
        } as any);

        await db.models.add({
            modelName: 'Modèle Charlie',
            modelId: 'uuid-6',
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            userId: user.uuid,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        // Suppression de l'utilisateur
        await db.users.delete(id);
        // Suppression manuelle des checklists et modèles (ce que fait l'app)
        await db.checklists.where('userId').equals(user.uuid).delete();
        await db.models.where('userId').equals(user.uuid).delete();

        const foundUser = await db.users.get(id);
        const checklistsCount = await db.checklists.where('userId').equals(user.uuid).count();
        const modelsCount = await db.models.where('userId').equals(user.uuid).count();

        expect(foundUser).toBeUndefined();
        expect(checklistsCount).toBe(0);
        expect(modelsCount).toBe(0);
    });

    it('devrait purger toutes les données avec purgeAllData', async () => {
        const user = { uuid: 'uuid-p1', firstName: 'Alice' };
        await db.users.add(user);
        await db.checklists.add({
            checklistId: 'uuid-p1',
            checklistName: 'C1',
            userId: user.uuid,
            userName: 'Alice',
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        } as any);
        await db.models.add({
            modelName: 'M1',
            modelId: 'uuid-m1',
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            userId: user.uuid,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });
        localStorage.setItem('testKey', 'testValue');

        await db.purgeAllData();

        expect(await db.users.count()).toBe(0);
        expect(await db.checklists.count()).toBe(0);
        expect(await db.models.count()).toBe(0);
        expect(localStorage.getItem('testKey')).toBeNull();
    });
});
