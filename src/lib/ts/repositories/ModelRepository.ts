import { db, type Model } from '../db';

export const ModelRepository = {
    /**
     * Récupère un modèle par son ID UUID.
     */
    async getByUuid(modelId: string): Promise<Model | undefined> {
        return await db.models.where('modelId').equals(modelId).first();
    },

    /**
     * Récupère un modèle par son ID auto-incrémenté.
     */
    async getById(id: number): Promise<Model | undefined> {
        return await db.models.get(id);
    },

    /**
     * Récupère les modèles personnalisés d'un utilisateur triés par date de création.
     */
    async getByUser(userId: string): Promise<Model[]> {
        if (!userId) return [];
        const data = await db.models
            .where('userId')
            .equals(userId)
            .toArray();
        
        return data.sort((a, b) => 
            new Date(b.modelCreationDate).getTime() - new Date(a.modelCreationDate).getTime()
        );
    },

    /**
     * Vérifie si un modèle existe avec ce nom pour un utilisateur.
     */
    async existsByName(userId: string, name: string): Promise<boolean> {
        const model = await db.models
            .where('modelName')
            .equalsIgnoreCase(name.trim())
            .filter(m => m.userId === userId)
            .first();
        return !!model;
    },

    /**
     * Ajoute un nouveau modèle.
     */
    async create(model: Model): Promise<void> {
        await db.models.add(model);
    },

    /**
     * Met à jour un modèle (objet complet).
     */
    async save(model: Model): Promise<void> {
        if (model.id) {
            await db.models.put(model);
        }
    },

    /**
     * Supprime un modèle.
     */
    async delete(id: number): Promise<void> {
        await db.models.delete(id);
    }
};
