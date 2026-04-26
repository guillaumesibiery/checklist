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

    async function loadModels() {
        if (!layoutState.user || !layoutState.user.id) return;
        isLoadingModels = true;
        
        // Simulation d'un chargement différé
        // Pour l'instant, on n'a pas de table IndexedDB pour les modèles
        setTimeout(() => {
            models = []; // Liste vide pour le moment
            isLoadingModels = false;
        }, 500);
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
        loadModels,
        confirmDelete,
        cancelDelete,
        executeDelete
    };
}
