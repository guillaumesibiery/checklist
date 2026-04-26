import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { db, type User } from '$lib/db';

export function createLayoutState() {
    let user = $state<User | null>(null);
    let showLogoutModal = $state(false);
    let showCreateModal = $state(false);
    
    let checklistName = $state('');
    let selectedModel = $state('');
    let availableModels = $state<{ name: string, file?: string, id?: number }[]>([]);
    let nameError = $state('');
    let isCreating = $state(false);
    let checklistsCount = $state(0);
    let finishedChecklistsCount = $state(0);

    async function loadAvailableModels() {
        if (!user) {
            availableModels = [{ name: 'Bébé pack', file: 'model-bebepack.json' }];
            return;
        }
        const customModels = await db.models.where('userId').equals(user.id!).toArray();
        availableModels = [
            { name: 'Bébé pack', file: 'model-bebepack.json' },
            ...customModels.map(m => ({ name: m.modelName, id: m.id }))
        ];
    }

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
        
        await loadAvailableModels();
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
        if (showCreateModal) {
            // Recharger les modèles au cas où un nouveau a été créé
            loadAvailableModels();
        } else {
            checklistName = '';
            selectedModel = '';
            nameError = '';
        }
    }

    async function createChecklist() {
        if (!user || !checklistName || !selectedModel || nameError || isCreating) return;

        isCreating = true;
        try {
            let modelData;
            const modelOption = availableModels.find(m => 
                (m.file && m.file === selectedModel) || (m.id && String(m.id) === String(selectedModel))
            );

            if (modelOption?.file) {
                const response = await fetch(`${base}/models/${modelOption.file}`);
                modelData = await response.json();
            } else if (modelOption?.id) {
                modelData = await db.models.get(modelOption.id);
            }

            if (!modelData) throw new Error('Modèle non trouvé');

            const now = new Date().toISOString();
            // On retire les champs spécifiques au modèle pour la checklist
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: modelId, modelCreationDate, modelLastModifiedDate, ...rest } = modelData;

            const newChecklist = {
                ...rest,
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
        get createdModelsCount() { return availableModels.filter(m => m.id).length; },
        set checklistName(val: string) { handleNameChange(val); },
        set selectedModel(val: string) { selectedModel = val; },
        init,
        logout,
        toggleLogoutModal,
        toggleCreateModal,
        createChecklist,
        loadAvailableModels
    };
}

export const layoutState = createLayoutState();
