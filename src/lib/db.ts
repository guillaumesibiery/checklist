import Dexie, { type Table } from 'dexie';

export interface User {
    id?: number;
    firstName: string;
}

export interface ChecklistItem {
    item: string;
    'wanted-quantity': string | number;
    'added-quantity': string | number;
    disabled: string | boolean;
    addedByUser?: string | boolean;
}

export interface ChecklistElement {
    category: string;
    progress: string;
    addedByUser?: string | boolean;
    items: ChecklistItem[];
}

export interface Checklist {
    id?: number;
    checklistId: string;
    checklistName: string;
    userId: number;
    creationDate: string;
    lastModifiedDate: string;
    progress: string;
    status: string;
    modelName: string;
    elements: ChecklistElement[];
}

export interface Model {
    id?: number;
    modelId: string;
    modelName: string;
    modelCreationDate: string;
    modelLastModifiedDate: string;
    checklistId: string;
    checklistName: string;
    userId: number | string;
    creationDate: string;
    lastModifiedDate: string;
    progress: string;
    status: string;
    elements: ChecklistElement[];
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
}

export const db = new ChecklistDatabase();
