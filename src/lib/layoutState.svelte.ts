import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { db, type User } from '$lib/db';

export function createLayoutState() {
    let user = $state<User | null>(null);
    let showLogoutModal = $state(false);
    let showCreateModal = $state(false);
    
    let checklistName = $state('');
    let selectedModel = $state('');
    let availableModels = $state<{ name: string, file: string }[]>([]);
    let nameError = $state('');
    let isCreating = $state(false);
    let checklistsCount = $state(0);
    let finishedChecklistsCount = $state(0);

    async function init() {
        const idStr = localStorage.getItem('currentUserId');
        if (!idStr) {
            user = null;
            return null;
        }
        const u = await db.users.get(parseInt(idStr));
        if (u) {
            user = u;
        } else {
            user = null;
        }
        availableModels = [
            { name: 'Bébé pack', file: 'model-bebepack.json' }
        ];
        return user;
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

    async function createChecklist() {
        if (!user || !checklistName || !selectedModel || nameError || isCreating) return;

        isCreating = true;
        try {
            const response = await fetch(`${base}/models/${selectedModel}`);
            const modelData = await response.json();

            const now = new Date().toISOString();
            const newChecklist = {
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
            showCreateModal = false;
            checklistName = '';
            selectedModel = '';
            goto(`${base}/checklist/${newChecklist.checklistId}/`);
        } catch (error) {
            console.error('Erreur lors de la création de la checklist:', error);
        } finally {
            isCreating = false;
        }
    }

    function logout() {
        localStorage.removeItem('currentUserId');
        user = null;
        showLogoutModal = false;
        goto(`${base}/`);
    }

    return {
        get user() { return user; },
        set user(val) { user = val; },
        get showLogoutModal() { return showLogoutModal; },
        get showCreateModal() { return showCreateModal; },
        get checklistName() { return checklistName; },
        get selectedModel() { return selectedModel; },
        get availableModels() { return availableModels; },
        get nameError() { return nameError; },
        get isCreating() { return isCreating; },
        get checklistsCount() { return checklistsCount; },
        set checklistsCount(val: number) { checklistsCount = val; },
        get finishedChecklistsCount() { return finishedChecklistsCount; },
        set finishedChecklistsCount(val: number) { finishedChecklistsCount = val; },
        set checklistName(val: string) { handleNameChange(val); },
        set selectedModel(val: string) { selectedModel = val; },
        init,
        logout,
        toggleLogoutModal,
        toggleCreateModal,
        createChecklist
    };
}

export const layoutState = createLayoutState();
