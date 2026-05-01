import { db, type User } from '../db';

export const UserRepository = {
    /**
     * Récupère tous les utilisateurs triés par prénom.
     */
    async getAll(): Promise<User[]> {
        return await db.users.orderBy('firstName').toArray();
    },

    /**
     * Récupère un utilisateur par son ID.
     */
    async getById(id: number): Promise<User | undefined> {
        return await db.users.get(id);
    },

    /**
     * Vérifie si un utilisateur existe déjà avec ce prénom.
     */
    async exists(firstName: string): Promise<boolean> {
        const user = await db.users
            .where('firstName')
            .equalsIgnoreCase(firstName.trim())
            .first();
        return !!user;
    },

    /**
     * Compte le nombre total d'utilisateurs.
     */
    async count(): Promise<number> {
        return await db.users.count();
    },

    /**
     * Crée un nouvel utilisateur.
     */
    async create(firstName: string): Promise<number> {
        return await db.users.add({ 
            uuid: crypto.randomUUID(),
            firstName: firstName.trim() 
        });
    },

    /**
     * Met à jour un utilisateur.
     */
    async save(user: User): Promise<void> {
        if (user.id) {
            await db.users.put(user);
        }
    },

    /**
     * Supprime un utilisateur et toutes ses données liées (checklists et modèles).
     */
    async deleteCascading(userId: number): Promise<void> {
        const user = await db.users.get(userId);
        if (!user) return;

        await db.transaction('rw', db.users, db.checklists, db.models, async () => {
            await db.checklists.where('userId').equals(user.uuid).delete();
            await db.models.where('userId').equals(user.uuid).delete();
            await db.users.delete(userId);
            
            const count = await db.users.count();
            if (count === 0) {
                await db.purgeAllData();
            }
        });
    }
};
