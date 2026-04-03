import Dexie, { type Table } from 'dexie';

export interface User {
    id?: number;
    firstName: string;
}

export class ChecklistDatabase extends Dexie {
    users!: Table<User, number>;

    constructor() {
        super('ChecklistDB');
        this.version(1).stores({
            users: '++id, &firstName'
        });
    }
}

export const db = new ChecklistDatabase();
