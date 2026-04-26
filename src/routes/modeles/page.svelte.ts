import { layoutState } from '$lib/layoutState.svelte.ts';

export interface Model {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export function createModelesState() {
    let models = $state<Model[]>([]);
    let isLoadingModels = $state(false);
    let showDeleteModal = $state(false);
    let modelToDelete = $state<Model | null>(null);

    // État pour la création de modèle
    let showCreateModal = $state(false);
    let modelName = $state('');
    let nameError = $state('');
    let isCreating = $state(false);

    async function loadModels() {
        if (!layoutState.user || !layoutState.user.id) return;
        isLoadingModels = true;
        
        // Simulation d'un chargement différé
        setTimeout(() => {
            models = []; 
            isLoadingModels = false;
        }, 500);
    }

    function toggleCreateModal() {
        showCreateModal = !showCreateModal;
        if (!showCreateModal) {
            modelName = '';
            nameError = '';
        }
    }

    function validateModelName() {
        const regex = /^[a-zA-Z0-9àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-_'.]+$/;
        if (!modelName.trim()) {
            nameError = 'Le nom est obligatoire';
            return false;
        }
        if (!regex.test(modelName)) {
            nameError = 'Caractères spéciaux non autorisés';
            return false;
        }
        nameError = '';
        return true;
    }

    async function createModel() {
        if (!validateModelName()) return;
        
        isCreating = true;
        try {
            // Sera implémenté avec Dexie.js plus tard
            console.log('Création du modèle:', modelName);
            
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            toggleCreateModal();
            await loadModels();
        } finally {
            isCreating = false;
        }
    }

    function confirmDelete(model: Model) {
        modelToDelete = model;
        showDeleteModal = true;
    }

    function cancelDelete() {
        modelToDelete = null;
        showDeleteModal = false;
    }

    async function executeDelete() {
        if (!modelToDelete || !modelToDelete.id) return;
        
        // Sera implémenté plus tard avec IndexedDB
        console.log('Suppression du modèle:', modelToDelete.id);
        
        await loadModels();
        cancelDelete();
    }

    return {
        get user() { return layoutState.user; },
        get models() { return models; },
        get modelsCount() { return models.length; },
        get isLoadingModels() { return isLoadingModels; },
        get showDeleteModal() { return showDeleteModal; },
        get modelToDelete() { return modelToDelete; },
        get showCreateModal() { return showCreateModal; },
        get modelName() { return modelName; },
        set modelName(value: string) { modelName = value; validateModelName(); },
        get nameError() { return nameError; },
        get isCreating() { return isCreating; },
        loadModels,
        toggleCreateModal,
        createModel,
        confirmDelete,
        cancelDelete,
        executeDelete
    };
}
