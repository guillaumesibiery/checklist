import { type Checklist } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';
import { ChecklistRepository } from '$lib/ts/repositories/ChecklistRepository';
import { toastState } from '$lib/ts/toastState.svelte';

export function createPageState() {
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showRestoreModal = $state(false);
    let checklistToRestore = $state<Checklist | null>(null);
    let showDeleteModal = $state(false);
    let checklistToDelete = $state<Checklist | null>(null);

    async function loadChecklists() {
        if (!layoutState.user?.uuid) return;
        isLoadingChecklists = true;
        try {
            checklists = await ChecklistRepository.getByUserAndStatus(layoutState.user.uuid, 'FINISHED');
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
        
        const name = checklistToRestore.checklistName;
        await ChecklistRepository.update(checklistToRestore.id, {
            status: 'IN_PROGRESS',
            lastModifiedDate: new Date().toISOString()
        });
        
        await loadChecklists();
        toastState.success(`Checklist "${name}" restaurée`);
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
        
        const name = checklistToDelete.checklistName;
        await ChecklistRepository.delete(checklistToDelete.id);
        
        await loadChecklists();
        toastState.success(`Checklist "${name}" supprimée`);
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
