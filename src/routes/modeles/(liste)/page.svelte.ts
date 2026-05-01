import { type Model } from '$lib/ts/db';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import { ModelRepository } from '$lib/ts/repositories/ModelRepository';
import { toastState } from '$lib/ts/toastState.svelte';

export function createPageState() {
    let models = $state<Model[]>([]);
    let isLoadingModels = $state(true);
    let showDeleteModal = $state(false);
    let modelToDelete = $state<Model | null>(null);

    // État pour la création de modèle
    let showCreateModal = $state(false);
    let modelName = $state('');
    let nameError = $state('');
    let isCreating = $state(false);

    async function loadModels() {
        if (!layoutState.user?.id) return;
        isLoadingModels = true;
        try {
            models = await ModelRepository.getByUser(layoutState.user.id);
        } finally {
            isLoadingModels = false;
        }
    }

    function toggleCreateModal() {
        showCreateModal = !showCreateModal;
        if (!showCreateModal) {
            modelName = '';
            nameError = '';
        }
    }

    async function validateModelName() {
        const regex = /^[a-zA-Z0-9àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ\s\-_'.]+$/;
        if (!modelName.trim()) {
            nameError = 'Le nom est obligatoire';
            return false;
        }
        if (!regex.test(modelName)) {
            nameError = 'Caractères spéciaux non autorisés';
            return false;
        }

        if (await ModelRepository.existsByName(layoutState.user!.id!, modelName)) {
            nameError = 'Ce nom de modèle existe déjà';
            return false;
        }

        nameError = '';
        return true;
    }

    async function createModel() {
        if (!(await validateModelName())) return;
        
        isCreating = true;
        try {
            // Charger le modèle de base
            const response = await fetch(`${base}/models/model-custom.json`);
            const template = await response.json();
            
            const now = new Date().toISOString();
            const newModelId = crypto.randomUUID();
            const newModel: Model = {
                ...template,
                modelName: modelName.trim(),
                modelId: newModelId,
                userId: layoutState.user!.id!,
                modelCreationDate: now,
                modelLastModifiedDate: now,
                // On s'assure que les champs checklist restent vides
                checklistId: "",
                checklistName: "",
                creationDate: "",
                lastModifiedDate: ""
            };

            await ModelRepository.create(newModel);
            await layoutState.loadAvailableModels();
            
            toastState.success(`Modèle créé`);
            toggleCreateModal();
            // Redirection vers l'éditeur de modèle
            goto(`${base}/modeles/${newModelId}/`);
        } catch (error) {
            console.error('Erreur lors de la création du modèle:', error);
            toastState.error("Erreur lors de la création du modèle");
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
        
        const name = modelToDelete.modelName;
        await ModelRepository.delete(modelToDelete.id);
        
        await loadModels();
        await layoutState.loadAvailableModels();
        toastState.success(`Modèle "${name}" supprimé`);
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
