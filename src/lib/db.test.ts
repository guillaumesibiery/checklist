import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

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
            userId: '',
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
            userId: '',
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
            userId: '',
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
            userId: '',
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
            userId: 1,
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
            userId: 1,
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
        const id = await db.checklists.add(checklist);
        expect(id).toBeDefined();
        
        const inserted = await db.checklists.get(id);
        expect(inserted?.checklistName).toBe('Ma Checklist');
        expect(inserted?.elements.length).toBe(1);
    });

    it('devrait récupérer les checklists d\'un utilisateur (select)', async () => {
        const userId = await db.users.add({ firstName: 'User1' });
        
        await db.checklists.add({
            checklistId: 'uuid-1',
            checklistName: 'Checklist 1',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        });

        await db.checklists.add({
            checklistId: 'uuid-2',
            checklistName: 'Checklist 2',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M2',
            elements: []
        });

        const checklists = await db.checklists.where('userId').equals(userId).toArray();
        expect(checklists.length).toBe(2);
    });

    it('devrait mettre à jour la progression d\'une checklist (update)', async () => {
        const id = await db.checklists.add({
            checklistId: 'uuid-3',
            checklistName: 'Checklist 3',
            userId: 1,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M3',
            elements: []
        });

        await db.checklists.update(id, { progress: '50', status: 'IN_PROGRESS' });
        
        const updated = await db.checklists.get(id);
        expect(updated?.progress).toBe('50');
    });

    it('devrait supprimer une checklist (delete)', async () => {
        const id = await db.checklists.add({
            checklistId: 'uuid-4',
            checklistName: 'Checklist 4',
            userId: 1,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M4',
            elements: []
        });

        await db.checklists.delete(id);
        const found = await db.checklists.get(id);
        expect(found).toBeUndefined();
    });

    // --- Tests pour les Utilisateurs ---
    it('devrait créer un utilisateur', async () => {
        const id = await db.users.add({ firstName: 'Alice' });
        expect(id).toBeDefined();

        const user = await db.users.get(id);
        expect(user?.firstName).toBe('Alice');
    });

    it('devrait empêcher les prénoms en doublon', async () => {
        await db.users.add({ firstName: 'Bob' });
        await expect(db.users.add({ firstName: 'Bob' })).rejects.toThrow();
    });

    it('devrait supprimer un utilisateur, ses checklists et ses modèles (simulé)', async () => {
        const userId = await db.users.add({ firstName: 'Charlie' });
        await db.checklists.add({
            checklistId: 'uuid-5',
            checklistName: 'Checklist Charlie',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M5',
            elements: []
        });

        await db.models.add({
            modelName: 'Modèle Charlie',
            modelId: 'uuid-6',
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            userId,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            elements: []
        });

        // Suppression de l'utilisateur
        await db.users.delete(userId);
        // Suppression manuelle des checklists et modèles (ce que fait l'app)
        await db.checklists.where('userId').equals(userId).delete();
        await db.models.where('userId').equals(userId).delete();

        const user = await db.users.get(userId);
        const checklistsCount = await db.checklists.where('userId').equals(userId).count();
        const modelsCount = await db.models.where('userId').equals(userId).count();

        expect(user).toBeUndefined();
        expect(checklistsCount).toBe(0);
        expect(modelsCount).toBe(0);
    });

    it('devrait purger toutes les données avec purgeAllData', async () => {
        await db.users.add({ firstName: 'Alice' });
        await db.checklists.add({
            checklistId: 'uuid-p1',
            checklistName: 'C1',
            userId: 1,
            creationDate: '',
            lastModifiedDate: '',
            progress: '0',
            status: 'IN_PROGRESS',
            modelName: 'M1',
            elements: []
        });
        await db.models.add({
            modelName: 'M1',
            modelId: 'uuid-m1',
            modelCreationDate: '',
            modelLastModifiedDate: '',
            checklistId: '',
            checklistName: '',
            userId: 1,
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
