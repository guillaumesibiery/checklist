import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { type User, type Checklist } from '$lib/ts/db';
import { UserRepository } from './repositories/UserRepository';
import { ChecklistRepository } from './repositories/ChecklistRepository';
import { ModelRepository } from './repositories/ModelRepository';
import { toastState } from './toastState.svelte';
import { decodeChecklist, expandChecklist } from './share';

export function createLayoutState() {
    let user = $state<User | null>(null);
    let showLogoutModal = $state(false);
    let showCreateModal = $state(false);
    let showSettingsModal = $state(false);
    let isDarkMode = $state(false);
    
    let checklistName = $state('');

    let selectedModel = $state('');
    let availableModels = $state<{ name: string, file?: string, id?: number }[]>([]);
    let nameError = $state('');
    let isCreating = $state(false);
    let checklistsCount = $state(0);
    let finishedChecklistsCount = $state(0);

    let importData = $state<Checklist | null>(null);
    let showImportModal = $state(false);

    async function loadAvailableModels() {
        if (!user) {
            availableModels = [
                { name: 'Modèle vide', file: 'model-vide.json' },
                { name: 'Bébé pack', file: 'model-bebepack.json' }
            ];
            return;
        }
        const customModels = await ModelRepository.getByUser(user.uuid);
        availableModels = [
            { name: 'Modèle vide', file: 'model-vide.json' },
            { name: 'Bébé pack', file: 'model-bebepack.json' },
            ...customModels.map(m => ({ name: m.modelName, id: m.id }))
        ];
    }

    async function init() {
        // Charger la préférence de mode sombre globale
        const savedDarkMode = localStorage.getItem('darkMode');
        isDarkMode = savedDarkMode === 'true';
        applyDarkMode(isDarkMode);

        // Vérifier s'il y a une checklist à importer dans l'URL
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const base64 = urlParams.get('import');
            if (base64) {
                try {
                    const decoded = decodeChecklist(base64);
                    const data = expandChecklist(decoded);
                    
                    // Validation basique
                    if (data.checklistId && data.checklistName && data.elements) {
                        importData = data as Checklist;
                        showImportModal = true;
                    }
                } catch (e) {
                    console.error("Erreur lors du décodage de l'import:", e);
                    toastState.error("Le lien de partage est invalide");
                }
            }
        }

        const idStr = localStorage.getItem('currentUserId');
        if (!idStr) {
            user = null;
            await loadAvailableModels();
            return null;
        }
        const u = await UserRepository.getById(parseInt(idStr));
        if (u) {
            // Migration à la volée pour les anciens utilisateurs sans UUID
            if (!u.uuid) {
                u.uuid = crypto.randomUUID();
                await UserRepository.save(u);
            }
            user = u;
        } else {
            user = null;
        }
        
        await loadAvailableModels();
        return user;
    }

    function applyDarkMode(enabled: boolean) {
        if (typeof document !== 'undefined') {
            if (enabled) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    function toggleSettingsModal() {
        showSettingsModal = !showSettingsModal;
    }

    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', String(isDarkMode));
        applyDarkMode(isDarkMode);
    }

    async function checkNameExists(name: string) {
        if (!user) return false;
        return await ChecklistRepository.existsByName(user.uuid, name);
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
                modelData = await ModelRepository.getById(modelOption.id);
            }

            if (!modelData) throw new Error('Modèle non trouvé');

            const now = new Date().toISOString();
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: modelId, modelCreationDate, modelLastModifiedDate, userId: mUserId, ...rest } = modelData;

            const newChecklist: Checklist = {
                ...rest,
                checklistId: crypto.randomUUID(),
                checklistName: checklistName,
                userId: user.uuid,
                userName: user.firstName,
                creationDate: now,
                lastModifiedDate: now,
                progress: 0,
                status: "IN_PROGRESS",
                modelName: rest.modelName || ""
            };

            await ChecklistRepository.create(newChecklist);
            toastState.success(`Checklist créée`);
            showCreateModal = false;
            checklistName = '';
            selectedModel = '';
            goto(`${base}/checklist/${newChecklist.checklistId}/`);
        } catch (error) {
            console.error('Erreur lors de la création de la checklist:', error);
            toastState.error("Erreur lors de la création de la checklist");
        } finally {
            isCreating = false;
        }
    }

    function logout() {
        localStorage.removeItem('currentUserId');
        user = null;
        showLogoutModal = false;
        showSettingsModal = false;
        goto(`${base}/`);
    }

    function reset() {
        isDarkMode = false;
        applyDarkMode(false);
        localStorage.removeItem('darkMode');
        user = null;
        showLogoutModal = false;
        showSettingsModal = false;
        showCreateModal = false;
    }

    async function confirmImport() {
        if (!importData || !user) return;
        try {
            const now = new Date().toISOString();
            // On complète les données manquantes pour l'import
            importData.userId = user.uuid;
            importData.creationDate = now;
            importData.lastModifiedDate = now;
            importData.status = 'IN_PROGRESS';
            importData.modelName = importData.modelName || 'Checklist importée';
            
            // On s'assure que addedByUser est vrai pour les éléments importés
            importData.elements.forEach(el => {
                el.addedByUser = true;
                el.items.forEach(item => item.addedByUser = true);
            });
            
            await ChecklistRepository.create(importData);
            toastState.success(`Checklist de ${importData.userName} importée`);
            const targetId = importData.checklistId;
            importData = null;
            showImportModal = false;
            
            // Nettoyer l'URL
            const url = new URL(window.location.href);
            url.searchParams.delete('import');
            window.history.replaceState({}, '', url.toString());

            goto(`${base}/checklist/${targetId}/`);
        } catch (e) {
            console.error("Erreur lors de l'import:", e);
            toastState.error("Erreur lors de l'importation");
        }
    }

    function cancelImport() {
        if (importData) {
            toastState.info(`La checklist de ${importData.userName} n'a pas été importée`);
        }
        importData = null;
        showImportModal = false;
        // Nettoyer l'URL
        const url = new URL(window.location.href);
        url.searchParams.delete('import');
        window.history.replaceState({}, '', url.toString());
        goto(`${base}/accueil/`);
    }

    return {
        get user() { return user; },
        set user(val) { user = val; },
        get showLogoutModal() { return showLogoutModal; },
        get showCreateModal() { return showCreateModal; },
        get showSettingsModal() { return showSettingsModal; },
        get isDarkMode() { return isDarkMode; },
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
        get importData() { return importData; },
        get showImportModal() { return showImportModal; },
        init,
        logout,
        reset,
        toggleLogoutModal,
        toggleCreateModal,
        toggleSettingsModal,
        toggleDarkMode,
        createChecklist,
        loadAvailableModels,
        confirmImport,
        cancelImport
    };
}


export const layoutState = createLayoutState();
