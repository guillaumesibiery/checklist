<script lang="ts">
    import { createPageState } from './page.svelte.ts';
    import { fade, scale } from 'svelte/transition';
    import { filterInput } from '$lib/ts/modalInputFilter';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { formatDate } from '$lib/ts/date';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';
    import Badge from '$lib/components/Badge.svelte';
    import Button from '$lib/components/Button.svelte';
    import Card from '$lib/components/Card.svelte';
    import Input from '$lib/components/Input.svelte';
    import ListSkeleton from '$lib/components/ListSkeleton.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import { icons } from '$lib/ts/icons';

    const state = createPageState();

    onMount(async () => {
        await state.loadModels();
    });
</script>

<div in:fade={{ duration: 300 }} class="px-4 pt-6 pb-6 transition-colors duration-300">
    {#if state.models.length > 0}
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-main dark:text-white uppercase tracking-wider text-sm opacity-60 transition-colors">Modèles de checklist</h2>
            <Button 
                size="sm"
                onclick={state.toggleCreateModal}
            >
                Nouveau modèle
            </Button>
        </div>
    {/if}
    
    {#if state.isLoadingModels}
        <ListSkeleton count={2} />
    {:else if state.models.length > 0}
        <div class="grid gap-4">
            {#each state.models as model}
                <Card
                    title={model.modelName}
                    href="{base}/modeles/{model.modelId}/"
                >
                    {#snippet info()}
                        <Badge>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V8.75c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                            </svg>
                            Créé le {formatDate(model.modelCreationDate)}
                        </Badge>
                        <Badge>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-5.038a7 7 0 0 0-11.712 3.138.75.75 0 0 0 1.449.39 5.5 5.5 0 0 1 9.201-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .75-.75V3.367a.75.75 0 0 0-1.5 0v2.431l-.31-.31Z" clip-rule="evenodd" />
                            </svg>
                            Modifié le {formatDate(model.modelLastModifiedDate)}
                        </Badge>
                    {/snippet}

                    {#snippet actions()}
                        <Button 
                            variant="ghost"
                            size="sm"
                            onclick={() => state.confirmDelete(model)}
                            class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                {@html icons.trash}
                            </svg>
                        </Button>
                    {/snippet}
                </Card>
            {/each}
        </div>
    {:else}
        <div class="flex flex-col items-center justify-center py-12 px-4 rounded-[2rem] transition-colors">
            <div class="p-4 bg-primary/10 dark:bg-primary/20 rounded-full mb-4 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-primary opacity-40">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium text-center transition-colors">Aucun modèle personnalisé pour le moment.</p>
            <Button 
                onclick={state.toggleCreateModal}
                class="mt-6"
            >
                Créer mon premier modèle
            </Button>
        </div>
    {/if}
</div>

<!-- Modal Création -->
<Modal
    isOpen={state.showCreateModal}
    onclose={state.toggleCreateModal}
    title="Nouveau modèle"
>
    <div class="space-y-4">
        <Input 
            id="modelName"
            label="Nom du modèle"
            bind:value={state.modelName}
            error={state.nameError}
            placeholder="Ex: Ma valise été"
            autofocus
        />

        <div class="flex flex-col gap-3 pt-4">
            <Button 
                onclick={state.createModel}
                disabled={!state.modelName || !!state.nameError || state.isCreating}
                loading={state.isCreating}
                fullWidth
            >
                Créer et éditer
            </Button>
            <Button 
                variant="secondary"
                onclick={state.toggleCreateModal}
                fullWidth
            >
                Annuler
            </Button>
        </div>
    </div>
</Modal>

<!-- Modal Suppression -->
<Modal
    isOpen={state.showDeleteModal}
    onclose={state.cancelDelete}
    title="Supprimer le modèle ?"
>
    <div class="flex flex-col items-center mb-6">
        <div class="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                {@html icons.trash}
            </svg>
        </div>
        <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
            Voulez-vous vraiment supprimer le modèle <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.modelToDelete?.modelName}"</span> ?
        </p>
    </div>
    
    <div class="flex flex-col gap-3">
        <Button 
            variant="danger"
            onclick={state.executeDelete}
            fullWidth
        >
            Supprimer définitivement
        </Button>
        <Button 
            variant="secondary"
            onclick={state.cancelDelete}
            fullWidth
        >
            Annuler
        </Button>
    </div>
</Modal>
