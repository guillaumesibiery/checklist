import Dexie, { type Table } from 'dexie';

export interface User {
    id?: number;
    firstName: string;
}

export type ChecklistStatus = 'IN_PROGRESS' | 'FINISHED';

export interface ChecklistItem {
    item: string;
    'wanted-quantity': number;
    'added-quantity': number;
    disabled: boolean;
    addedByUser: boolean;
}

export interface ChecklistElement {
    category: string;
    progress: number;
    addedByUser: boolean;
    items: ChecklistItem[];
}

/**
 * Base pour les structures contenant des éléments de checklist (Checklists et Modèles)
 */
interface ChecklistBase {
    elements: ChecklistElement[];
}

export interface Checklist extends ChecklistBase {
    id?: number;
    checklistId: string;
    checklistName: string;
    userId: number;
    creationDate: string;
    lastModifiedDate: string;
    progress: number;
    status: ChecklistStatus;
    modelName: string;
}

export interface Model extends ChecklistBase {
    id?: number;
    modelId: string;
    modelName: string;
    modelCreationDate: string;
    modelLastModifiedDate: string;
    userId: number;
}

export class ChecklistDatabase extends Dexie {
    users!: Table<User, number>;
    checklists!: Table<Checklist, number>;
    models!: Table<Model, number>;

    constructor() {
        super('ChecklistDB');
        this.version(4).stores({
            users: '++id, &firstName',
            checklists: '++id, checklistId, userId, checklistName',
            models: '++id, modelId, userId, modelName'
        });
    }

    async purgeAllData() {
        await Promise.all([
            this.users.clear(),
            this.checklists.clear(),
            this.models.clear()
        ]);
        localStorage.clear();
    }
}

export const db = new ChecklistDatabase();
