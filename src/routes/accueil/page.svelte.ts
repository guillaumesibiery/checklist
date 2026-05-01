import { type Checklist } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';
import { ChecklistRepository } from '$lib/ts/repositories/ChecklistRepository';
import { toastState } from '$lib/ts/toastState.svelte';

export function createPageState() {
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showDeleteModal = $state(false);
    let checklistToDelete = $state<Checklist | null>(null);

    async function loadChecklists() {
        if (!layoutState.user || !layoutState.user.id) return;
        isLoadingChecklists = true;
        try {
            checklists = await ChecklistRepository.getByUserAndStatus(layoutState.user.id, 'IN_PROGRESS');
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
        get showDeleteModal() { return showDeleteModal; },
        get checklistToDelete() { return checklistToDelete; },
        loadChecklists,
        confirmDelete,
        cancelDelete,
        deleteChecklist
    };
}
