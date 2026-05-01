<script lang="ts">
    import Modal from './Modal.svelte';
    import Button from './Button.svelte';
    import Input from './Input.svelte';
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
        <Input 
            id="checklistName"
            label="Nom de la checklist"
            bind:value={layoutState.checklistName}
            oninput={(e) => {
                const input = e.currentTarget;
                const filtered = filterInput(input.value);
                layoutState.checklistName = filtered;
                input.value = filtered;
            }}
            placeholder="Ex: Vacances d'été"
            maxlength={50}
            error={layoutState.nameError}
        />

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
            <Button 
                onclick={layoutState.createChecklist}
                disabled={!layoutState.checklistName || !layoutState.selectedModel || !!layoutState.nameError || layoutState.isCreating}
                loading={layoutState.isCreating}
                fullWidth
            >
                Créer
            </Button>
            <Button 
                variant="secondary"
                onclick={onclose}
                fullWidth
            >
                Annuler
            </Button>
        </div>
    </div>
</Modal>
