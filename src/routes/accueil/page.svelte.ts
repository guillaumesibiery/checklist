import { db, type User, type Checklist } from '$lib/db';
import { layoutState } from '$lib/layoutState.svelte.ts';

export function createAccueilState() {
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showDeleteModal = $state(false);
    let checklistToDelete = $state<Checklist | null>(null);

    async function loadChecklists() {
        if (!layoutState.user || !layoutState.user.id) return;
        isLoadingChecklists = true;
        try {
            const data = await db.checklists
                .where('userId').equals(layoutState.user.id)
                .filter(c => c.status === 'IN_PROGRESS')
                .toArray();
            
            checklists = data.sort((a, b) => 
                new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime()
            );
            layoutState.checklistsCount = checklists.length;
        } finally {
            isLoadingChecklists = false;
        }
    }

    function confirmDelete(checklist: Checklist) {
        checklistToDelete = checklist;
        showDeleteModal = true;
    }

    function cancelDelete() {
        checklistToDelete = null;
        showDeleteModal = false;
    }

    async function deleteChecklist() {
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
        get showDeleteModal() { return showDeleteModal; },
        get checklistToDelete() { return checklistToDelete; },
        loadChecklists,
        confirmDelete,
        cancelDelete,
        deleteChecklist
    };
}
