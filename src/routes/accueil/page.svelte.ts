import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { db, type User, type Checklist } from '$lib/db';

export function createAccueilState() {
    let user = $state<User | null>(null);
    let checklists = $state<Checklist[]>([]);
    let isLoadingChecklists = $state(true);
    let showLogoutModal = $state(false);
    let showCreateModal = $state(false);
    let showDeleteModal = $state(false);
    let checklistToDelete = $state<Checklist | null>(null);
    
    let checklistName = $state('');
    let selectedModel = $state('');
    let availableModels = $state<{ name: string, file: string }[]>([]);
    let nameError = $state('');
    let isCreating = $state(false);

    onMount(async () => {
        const idStr = localStorage.getItem('currentUserId');
        if (!idStr) {
            goto('/');
            return;
        }
        const u = await db.users.get(parseInt(idStr));
        if (u) {
            user = u;
            await loadChecklists();
        } else {
            goto('/');
        }

        availableModels = [
            { name: 'Bébé pack', file: 'model-bebepack.json' }
        ];
    });

    async function loadChecklists() {
        if (!user || !user.id) return;
        isLoadingChecklists = true;
        try {
            checklists = await db.checklists
                .where('userId').equals(user.id)
                .filter(c => c.status === 'IN_PROGRESS')
                .toArray();
        } finally {
            isLoadingChecklists = false;
        }
    }

    async function checkNameExists(name: string) {
        if (!user) return false;
        const count = await db.checklists
            .where({ userId: user.id, checklistName: name })
            .count();
        return count > 0;
    }

    async function handleNameChange(name: string) {
        const validPattern = /^[a-zA-Z0-9 àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ'-]*$/;
        if (name && !validPattern.test(name)) {
            return;
        }
        
        if (name.length > 50) {
            name = name.substring(0, 50);
        }

        checklistName = name;
        if (name && await checkNameExists(name)) {
            nameError = 'Une checklist avec ce nom existe déjà';
        } else {
            nameError = '';
        }
    }

    function toggleLogoutModal() {
        showLogoutModal = !showLogoutModal;
    }

    function toggleCreateModal() {
        showCreateModal = !showCreateModal;
        if (!showCreateModal) {
            checklistName = '';
            selectedModel = '';
            nameError = '';
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

    async function createChecklist() {
        if (!user || !checklistName || !selectedModel || nameError || isCreating) return;

        isCreating = true;
        try {
            const response = await fetch(`/models/${selectedModel}`);
            const modelData = await response.json();

            const now = new Date().toISOString();
            const newChecklist: Checklist = {
                ...modelData,
                checklistId: crypto.randomUUID(),
                checklistName: checklistName,
                userId: user.id!,
                creationDate: now,
                lastModifiedDate: now,
                progress: "0",
                status: "IN_PROGRESS"
            };

            await db.checklists.add(newChecklist);
            goto(`/checklist/${newChecklist.checklistId}`);
        } catch (error) {
            console.error('Erreur lors de la création de la checklist:', error);
        } finally {
            isCreating = false;
        }
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
        get showCreateModal() { return showCreateModal; },
        get showDeleteModal() { return showDeleteModal; },
        get checklistToDelete() { return checklistToDelete; },
        get checklistName() { return checklistName; },
        get selectedModel() { return selectedModel; },
        get availableModels() { return availableModels; },
        get nameError() { return nameError; },
        get isCreating() { return isCreating; },
        set checklistName(val: string) { handleNameChange(val); },
        set selectedModel(val: string) { selectedModel = val; },
        logout,
        toggleLogoutModal,
        toggleCreateModal,
        confirmDelete,
        cancelDelete,
        deleteChecklist,
        createChecklist
    };
}