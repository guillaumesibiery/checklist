import { db, type Checklist } from '$lib/db';
import { layoutState } from '$lib/layoutState.svelte.ts';

export function createHistoriqueState() {
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showRestoreModal = $state(false);
    let checklistToRestore = $state<Checklist | null>(null);

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

    return {
        get user() { return layoutState.user; },
        get checklists() { return checklists; },
        get checklistsCount() { return checklists.length; },
        get isLoadingChecklists() { return isLoadingChecklists; },
        get showRestoreModal() { return showRestoreModal; },
        get checklistToRestore() { return checklistToRestore; },
        loadChecklists,
        confirmRestore,
        cancelRestore,
        executeRestore
    };
}
