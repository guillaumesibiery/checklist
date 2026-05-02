<script lang="ts">
    import { createPageState } from './page.svelte.ts';
    import { fade, scale } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { formatDate } from '$lib/ts/date';
    import Badge from '$lib/components/Badge.svelte';
    import Button from '$lib/components/Button.svelte';
    import Card from '$lib/components/Card.svelte';
    import ListSkeleton from '$lib/components/ListSkeleton.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import { icons } from '$lib/ts/icons';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';

    const state = createPageState();

    onMount(async () => {
        await state.loadChecklists();
    });

</script>

<div in:fade={{ duration: 300 }} class="px-4 pt-6 pb-6 transition-colors duration-300">

    {#if state.isLoadingChecklists}
        <ListSkeleton count={3} />
    {:else if state.checklists.length > 0}
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-main dark:text-white uppercase tracking-wider text-sm opacity-60 transition-colors">Historique des checklists</h2>
        </div>

        <div class="grid gap-4">
            {#each state.checklists as checklist}
                <Card
                    title={checklist.checklistName}
                    onclick={() => goto(`${base}/checklist/${checklist.checklistId}/?readOnly=true`)}
                >
                    {#snippet children()}
                        <!-- Barre de progression pleine largeur avec % à l'intérieur -->
                        <div class="w-full h-6 bg-primary/10 dark:bg-primary/20 rounded-full relative overflow-hidden">
                            <!-- Barre de remplissage -->
                            <div 
                                class="h-full bg-primary rounded-full transition-all duration-500" 
                                style="width: {checklist.progress}%"
                            ></div>

                            <!-- Texte en couleur primaire (par défaut) -->
                            <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary">
                                {checklist.progress}%
                            </div>

                            <!-- Texte en blanc (révélé par la barre via clip-path) -->
                            <div 
                                class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white transition-all duration-500" 
                                style="clip-path: inset(0 {100 - Number(checklist.progress)}% 0 0)"
                            >
                                {checklist.progress}%
                            </div>
                        </div>
                    {/snippet}

                    {#snippet info()}
                        <Badge>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V8.75c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                            </svg>
                            {formatDate(checklist.lastModifiedDate)}
                        </Badge>

                        {#if layoutState.user && checklist.userId !== layoutState.user.uuid}
                            <Badge variant="secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1a1.23 1.23 0 0 0 .41-1.412A7.012 7.012 0 0 0 10 10a7.012 7.012 0 0 0-6.535 4.493Z" />
                                </svg>
                                {checklist.userName}
                            </Badge>
                        {/if}
                    {/snippet}

                    {#snippet actions()}
                        <Button 
                            variant="ghost"
                            size="sm"
                            onclick={() => state.confirmRestore(checklist)}
                            class="p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                {@html icons.restore}
                            </svg>
                        </Button>
                        <Button 
                            variant="ghost"
                            size="sm"
                            onclick={() => state.confirmDelete(checklist)}
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary opacity-40">
                    {@html icons.historique}
                </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium text-center transition-colors">Aucune checklist dans l'historique.</p>
            <Button 
                onclick={() => goto(`${base}/accueil/`)}
                class="mt-6"
            >
                Retour à l'accueil
            </Button>
        </div>
    {/if}
</div>

<!-- Modal de confirmation de restauration -->
<Modal
    isOpen={state.showRestoreModal}
    onclose={state.cancelRestore}
    title="Restaurer la checklist ?"
>
    <div class="flex flex-col items-center mb-6">
        <div class="p-4 bg-primary/10 text-primary rounded-full mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                {@html icons.restore}
            </svg>
        </div>        <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
            Souhaitez-vous restaurer la checklist <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.checklistToRestore?.checklistName}"</span> ?<br />Elle sera à nouveau visible depuis l'écran d'accueil.
        </p>
    </div>
    
    <div class="flex flex-col gap-3">
        <Button 
            onclick={state.executeRestore}
            fullWidth
        >
            Valider
        </Button>
        <Button 
            variant="secondary"
            onclick={state.cancelRestore}
            fullWidth
        >
            Annuler
        </Button>
    </div>
</Modal>

<!-- Modal de confirmation de suppression -->
<Modal
    isOpen={state.showDeleteModal}
    onclose={state.cancelDelete}
    title="Supprimer la checklist ?"
>
    <div class="flex flex-col items-center mb-6">
        <div class="p-4 bg-red-500/10 text-red-500 rounded-full mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                {@html icons.trash}
            </svg>
        </div>
        <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
            Attention : la suppression de la checklist <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.checklistToDelete?.checklistName}"</span> est définitive.
        </p>
    </div>
    
    <div class="flex flex-col gap-3">
        <Button 
            variant="danger"
            onclick={state.executeDelete}
            fullWidth
        >
            Supprimer
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
