<script lang="ts">
    import Modal from './Modal.svelte';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';
    import { filterInput } from '$lib/ts/modalInputFilter';
    import { fade } from 'svelte/transition';

    interface Props {
        isOpen: boolean;
        onclose: () => void;
    }

    let { isOpen, onclose }: Props = $props();
</script>

<Modal {isOpen} {onclose} title="Nouvelle checklist">
    <div class="space-y-4">
        <div>
            <label for="checklistName" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">
                Nom de la checklist
            </label>
            <input 
                type="text" 
                id="checklistName"
                value={layoutState.checklistName}
                oninput={(e) => {
                    const input = e.currentTarget;
                    const filtered = filterInput(input.value);
                    layoutState.checklistName = filtered;
                    input.value = filtered;
                }}
                placeholder="Ex: Vacances d'été"
                class="w-full p-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                maxlength="50"
            />
            {#if layoutState.nameError}
                <p class="text-red-500 text-xs mt-1 ml-1 font-medium" transition:fade>{layoutState.nameError}</p>
            {/if}
        </div>

        <div>
            <label for="model" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">
                Modèle
            </label>
            <select 
                id="model"
                bind:value={layoutState.selectedModel}
                class="w-full p-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium appearance-none"
            >
                <option value="" disabled selected>Choisir un modèle</option>
                {#each layoutState.availableModels as model}
                    <option value={model.file || model.id}>{model.name}</option>
                {/each}
            </select>
        </div>

        <div class="flex flex-col gap-3 pt-4">
            <button 
                onclick={layoutState.createChecklist}
                disabled={!layoutState.checklistName || !layoutState.selectedModel || !!layoutState.nameError || layoutState.isCreating}
                class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {#if layoutState.isCreating}
                    <span class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                    </span>
                {:else}
                    Créer
                {/if}
            </button>
            <button 
                onclick={onclose}
                class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
                Annuler
            </button>
        </div>
    </div>
</Modal>
