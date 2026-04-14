import Dexie, { type Table } from 'dexie';

export interface User {
    id?: number;
    firstName: string;
}

export interface ChecklistItem {
    item: string;
    quantity: string;
    disabled: string | boolean;
    checked?: boolean;
}

export interface ChecklistElement {
    category: string;
    progress: string;
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

export class ChecklistDatabase extends Dexie {
    users!: Table<User, number>;
    checklists!: Table<Checklist, number>;

    constructor() {
        super('ChecklistDB');
        this.version(2).stores({
            users: '++id, &firstName',
            checklists: '++id, checklistId, userId, checklistName'
        });
    }
}

export const db = new ChecklistDatabase();
