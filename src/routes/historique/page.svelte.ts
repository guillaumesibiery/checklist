import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { db, type User, type Checklist } from '$lib/db';

export function createHistoriqueState() {
    let user = $state<User | null>(null);
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showLogoutModal = $state(false);
    let showRestoreModal = $state(false);
    let checklistToRestore = $state<Checklist | null>(null);

    onMount(async () => {
        const idStr = localStorage.getItem('currentUserId');
        if (!idStr) {
            goto('/');
            return;
        }
        const u = await db.users.get(parseInt(idStr));
        if (u) {
            user = u;
            await loadFinishedChecklists();
        } else {
            goto('/');
        }
    });

    async function loadFinishedChecklists() {
        if (!user || !user.id) return;
        isLoadingChecklists = true;
        try {
            const data = await db.checklists
                .where('userId').equals(user.id)
                .filter(c => c.status === 'FINISHED')
                .toArray();
            
            // Tri par date de dernière modification décroissante
            checklists = data.sort((a, b) => 
                new Date(b.lastModifiedDate).getTime() - new Date(a.lastModifiedDate).getTime()
            );
        } finally {
            isLoadingChecklists = false;
        }
    }

    function toggleLogoutModal() {
        showLogoutModal = !showLogoutModal;
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
        
        await loadFinishedChecklists();
        cancelRestore();
    }

    function logout() {
        localStorage.removeItem('currentUserId');
        goto('/');
    }

    return {
        get user() { return user; },
        get checklists() { return checklists; },
        get checklistsCount() { return checklists.length; },
        get isLoadingChecklists() { return isLoadingChecklists; },
        get showLogoutModal() { return showLogoutModal; },
        get showRestoreModal() { return showRestoreModal; },
        get checklistToRestore() { return checklistToRestore; },
        logout,
        toggleLogoutModal,
        confirmRestore,
        cancelRestore,
        executeRestore
    };
}
