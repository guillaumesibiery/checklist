<script lang="ts">
    import { createAccueilState } from './page.svelte.ts';
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import { layoutState } from '$lib/layoutState.svelte';

    const state = createAccueilState();

    onMount(async () => {
        await state.loadChecklists();
    });

    // Formate la date en français (ex: 15/04/2026 à 17:00)
    function formatDate(isoString: string) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date).replace(',', ' à');
    }
</script>

<div in:fade={{ duration: 300 }} class="p-6">
    <div class="mt-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-main uppercase tracking-wider text-sm opacity-60">Checklists en cours</h2>
        </div>
        
        {#if state.isLoadingChecklists}
            <div class="space-y-4">
                {#each Array(3) as _}
                    <div class="h-24 bg-secondary rounded-[2rem] animate-pulse"></div>
                {/each}
            </div>
        {:else if state.checklists.length > 0}
            <div class="grid gap-4">
                {#each state.checklists as checklist}
                    <div class="relative group">
                        <a 
                            href="{base}/checklist/{checklist.checklistId}"
                            class="block p-6 bg-white border-2 border-secondary rounded-[2rem] hover:border-primary/30 transition-all active:scale-[0.98]"
                        >
                            <div class="flex justify-between items-center pr-10">
                                <div>
                                    <h3 class="font-bold text-lg text-text-main group-hover:text-primary transition-colors">{checklist.checklistName}</h3>
                                    <div class="flex flex-col">
                                        <p class="text-sm text-text-main/50 font-medium">{checklist.modelName}</p>
                                        <p class="text-[11px] text-text-main/40 font-medium">Modifiée le {formatDate(checklist.lastModifiedDate)}</p>
                                    </div>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    <span class="text-primary font-bold">{checklist.progress}%</span>
                                    <div class="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div class="h-full bg-primary" style="width: {checklist.progress}%"></div>
                                    </div>
                                </div>
                            </div>
                        </a>
                        <button 
                            onclick={() => state.confirmDelete(checklist)}
                            class="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-red-500/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            aria-label="Supprimer la checklist"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 1 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-secondary rounded-3xl">
                <div class="p-4 bg-secondary rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-primary opacity-40">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0c0 .414-.336.75-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                </div>
                <p class="text-gray-500 font-medium text-center">Aucune checklist en cours pour le moment.</p>
                <button 
                    onclick={layoutState.toggleCreateModal}
                    class="mt-6 px-6 py-3 bg-primary text-text-inverse font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                    Créer une checklist
                </button>
            </div>
        {/if}
    </div>
</div>

<!-- Modal de confirmation de suppression (Local à la page car spécifique à la liste) -->
{#if state.showDeleteModal && state.checklistToDelete}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={state.cancelDelete}
    >
        <div 
            class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 1 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-center text-text-main">Supprimer la checklist ?</h2>
                <p class="text-text-main/60 text-center mt-2 font-medium">
                    Voulez-vous vraiment supprimer <span class="text-text-main font-bold italic">"{state.checklistToDelete.checklistName}"</span> ? Cette action est irréversible.
                </p>
            </div>
            
            <div class="flex flex-col gap-3">
                <button 
                    onclick={state.deleteChecklist}
                    class="w-full py-4 px-4 bg-red-500 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-red-500/20"
                >
                    Valider la suppression
                </button>
                <button 
                    onclick={state.cancelDelete}
                    class="w-full py-4 px-4 bg-secondary text-text-main rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}
