import { db, type Model } from '$lib/db';
import { layoutState } from '$lib/layoutState.svelte.ts';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

export function createModelesState() {
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
            const data = await db.models
                .where('userId')
                .equals(layoutState.user.id)
                .toArray();
            
            models = data.sort((a, b) => 
                new Date(b.modelCreationDate).getTime() - new Date(a.modelCreationDate).getTime()
            );
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

        // Vérifier si le nom existe déjà (insensible à la casse)
        const existing = await db.models
            .where('modelName')
            .equalsIgnoreCase(modelName.trim())
            .first();
        
        if (existing) {
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

            await db.models.add(newModel);
            await layoutState.loadAvailableModels();
            
            toggleCreateModal();
            // Redirection vers l'éditeur de modèle
            goto(`${base}/modeles/${newModelId}/`);
        } catch (error) {
            console.error('Erreur lors de la création du modèle:', error);
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
        
        await db.models.delete(modelToDelete.id);
        
        await loadModels();
        await layoutState.loadAvailableModels();
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
