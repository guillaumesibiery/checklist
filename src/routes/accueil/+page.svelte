<script lang="ts">
    import { createPageState } from './page.svelte.ts';
    import { fade, scale, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { layoutState } from '$lib/ts/layoutState.svelte';
    import { formatDate } from '$lib/ts/date';
    import { addToGoogleCalendar } from '$lib/ts/calendar';
    import Badge from '$lib/components/Badge.svelte';
    import Button from '$lib/components/Button.svelte';
    import Card from '$lib/components/Card.svelte';
    import ListSkeleton from '$lib/components/ListSkeleton.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import { icons } from '$lib/ts/icons';

    const state = createPageState();

    onMount(async () => {
        await state.loadChecklists();
    });
</script>

<div in:fade={{ duration: 300 }} class="px-6 pt-6 pb-6 transition-colors duration-300">
    <!-- Bloc de bienvenue utilisateur -->
    {#if layoutState.user}
        <div class="flex items-center gap-4 mb-6" in:fly={{ y: -20, duration: 400 }}>
            <div class="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-9 h-9">
                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="flex flex-col">
                <h1 class="text-xl font-bold text-text-main dark:text-white">Bonjour {layoutState.user.firstName}</h1>
                <div>
                    <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-primary/10 dark:border-primary/20">
                        {layoutState.checklistsCount} Checklist{layoutState.checklistsCount > 1 ? 's' : ''} en cours
                    </span>
                </div>
            </div>
        </div>
    {/if}

    <div class="mt-4">
        
        {#if state.isLoadingChecklists}
            <ListSkeleton count={3} />
        {:else if state.checklists.length > 0}
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-text-main dark:text-white uppercase tracking-wider text-sm opacity-60 transition-colors">Checklists en cours</h2>
            </div>

            <div class="grid gap-4">
                {#each state.checklists as checklist}
                    <Card
                        title={checklist.checklistName}
                        href="{base}/checklist/{checklist.checklistId}"
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
                                    style="clip-path: inset(0 {100 - checklist.progress}% 0 0)"
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
                                {checklist.lastModifiedDate ? formatDate(checklist.lastModifiedDate) : formatDate(checklist.creationDate)}
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
                                onclick={() => addToGoogleCalendar(checklist)}
                                class="p-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                    <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                                    <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9h-16.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-primary opacity-40">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0c0 .414-.336.75-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 font-medium text-center transition-colors">Aucune checklist en cours pour le moment.</p>
                <Button 
                    onclick={layoutState.toggleCreateModal}
                    class="mt-6"
                >
                    Créer une checklist
                </Button>
            </div>
        {/if}
    </div>
</div>

<!-- Modal de confirmation de suppression -->
<Modal
    isOpen={state.showDeleteModal}
    onclose={state.cancelDelete}
    title="Supprimer la checklist ?"
>
    <div class="flex flex-col items-center mb-6">
        <div class="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                {@html icons.trash}
            </svg>
        </div>
        <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
            Voulez-vous vraiment supprimer <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.checklistToDelete?.checklistName}"</span> ? Cette action est irréversible.
        </p>
    </div>
    
    <div class="flex flex-col gap-3">
        <Button 
            variant="danger"
            onclick={state.deleteChecklist}
            fullWidth
        >
            Valider la suppression
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