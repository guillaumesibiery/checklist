import { db, type Checklist } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';

export function createPageState() {
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showRestoreModal = $state(false);
    let checklistToRestore = $state<Checklist | null>(null);
    let showDeleteModal = $state(false);
    let checklistToDelete = $state<Checklist | null>(null);

    async function loadChecklists() {
        if (!layoutState.user || !layoutState.user.id) return;
        isLoadingChecklists = true;
        try {
            const data = await db.checklists
                .where('userId').equals(layoutState.user.id)
                .filter(c => c.status === 'FINISHED')
                .toArray();
            
            checklists = data.sort((a, b) => 
                new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime()
            );
            layoutState.finishedChecklistsCount = checklists.length;
        } finally {
            isLoadingChecklists = false;
        }
    }

    function confirmRestore(checklist: Checklist) {
        checklistToRestore = checklist;
        showRestoreModal = true;
    }

    function cancelRestore() {
        checklistToRestore = null;
        showRestoreModal = false;
    }

    async function executeRestore() {
        if (!checklistToRestore || !checklistToRestore.id) return;
        
        await db.checklists.update(checklistToRestore.id, {
            status: 'IN_PROGRESS',
            lastModifiedDate: new Date().toISOString()
        });
        
        await loadChecklists();
        cancelRestore();
    }

    function confirmDelete(checklist: Checklist) {
        checklistToDelete = checklist;
        showDeleteModal = true;
    }

    function cancelDelete() {
        checklistToDelete = null;
        showDeleteModal = false;
    }

    async function executeDelete() {
        if (!checklistToDelete || !checklistToDelete.id) return;
        
        await db.checklists.delete(checklistToDelete.id);
        
        await loadChecklists();
        cancelDelete();
    }

    return {
        get user() { return layoutState.user; },
        get checklists() { return checklists; },
        get checklistsCount() { return checklists.length; },
        get isLoadingChecklists() { return isLoadingChecklists; },
        get showRestoreModal() { return showRestoreModal; },
        get checklistToRestore() { return checklistToRestore; },
        get showDeleteModal() { return showDeleteModal; },
        get checklistToDelete() { return checklistToDelete; },
        loadChecklists,
        confirmRestore,
        cancelRestore,
        executeRestore,
        confirmDelete,
        cancelDelete,
        executeDelete
    };
}
