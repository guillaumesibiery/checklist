import { db, type Checklist } from '../db';

export const ChecklistRepository = {
    /**
     * Récupère une checklist par son ID UUID.
     */
    async getByUuid(checklistId: string): Promise<Checklist | undefined> {
        return await db.checklists.where('checklistId').equals(checklistId).first();
    },

    /**
     * Récupère toutes les checklists filtrées par statut et triées par date de modification.
     */
    async getAllByStatus(status: string): Promise<Checklist[]> {
        const data = await db.checklists
            .filter(c => c.status === status)
            .toArray();
        
        return data.sort((a, b) => 
            new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime()
        );
    },

    /**
     * Récupère les checklists d'un utilisateur filtrées par statut et triées par date de modification.
     */
    async getByUserAndStatus(userId: string, status: string): Promise<Checklist[]> {
        const data = await db.checklists
            .where('userId').equals(userId)
            .filter(c => c.status === status)
            .toArray();
        
        return data.sort((a, b) => 
            new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime()
        );
    },

    /**
     * Vérifie si une checklist existe avec ce nom pour un utilisateur.
     */
    async existsByName(userId: string, name: string): Promise<boolean> {
        const count = await db.checklists
            .where({ userId, checklistName: name })
            .count();
        return count > 0;
    },

    /**
     * Ajoute une nouvelle checklist.
     */
    async create(checklist: Checklist): Promise<void> {
        await db.checklists.add(checklist);
    },

    /**
     * Met à jour une checklist (objet complet).
     */
    async save(checklist: Checklist): Promise<void> {
        if (checklist.id) {
            await db.checklists.put(checklist);
        }
    },

    /**
     * Met à jour partiellement une checklist via son ID auto-incrémenté.
     */
    async update(id: number, changes: Partial<Checklist>): Promise<void> {
        await db.checklists.update(id, changes);
    },

    /**
     * Supprime une checklist.
     */
    async delete(id: number): Promise<void> {
        await db.checklists.delete(id);
    }
};
