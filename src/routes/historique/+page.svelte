<script lang="ts">
    import { createHistoriqueState } from './page.svelte.ts';
    import { fade, scale } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';

    const state = createHistoriqueState();

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

<div in:fade={{ duration: 300 }} class="p-6 transition-colors duration-300">
    <div class="mt-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-main dark:text-white uppercase tracking-wider text-sm opacity-60 transition-colors">Historique des checklists</h2>
        </div>
        
        {#if state.isLoadingChecklists}
            <div class="space-y-4">
                {#each Array(3) as _}
                    <div class="h-24 bg-secondary dark:bg-gray-800 rounded-[2rem] animate-pulse transition-colors"></div>
                {/each}
            </div>
        {:else if state.checklists.length > 0}
            <div class="grid gap-4">
                {#each state.checklists as checklist}
                    <div class="group">
                        <div class="block p-6 bg-white dark:bg-gray-800 border-2 border-secondary dark:border-gray-700 rounded-[2rem] hover:border-primary/30 dark:hover:border-primary/50 transition-all active:scale-[0.98]">
                            <button 
                                class="w-full text-left cursor-pointer"
                                onclick={() => goto(`${base}/checklist/${checklist.checklistId}/?readOnly=true`)}
                            >
                                <!-- Section Titre et Progression : Systématiquement au-dessus, wrap si trop long -->
                                <div class="flex items-center flex-wrap gap-2 mb-3">
                                    <h3 class="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">
                                        {checklist.checklistName}
                                    </h3>
                                    <span class="flex-shrink-0 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 transition-colors">
                                        {checklist.progress}%
                                    </span>
                                </div>
                                
                                <!-- Détails de la carte -->
                                <div class="flex flex-col gap-0.5">
                                    <p class="text-sm text-text-main/50 dark:text-gray-400 font-medium transition-colors">{checklist.modelName}</p>
                                    <p class="text-[11px] text-text-main/40 dark:text-gray-500 font-medium transition-colors mt-1">Terminée le {formatDate(checklist.lastModifiedDate)}</p>
                                </div>
                            </button>

                            <!-- Boutons d'action centrés en dessous -->
                            <div class="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-secondary dark:border-gray-700 transition-colors">
                                <button 
                                    onclick={() => state.confirmRestore(checklist)}
                                    class="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer text-xs font-bold"
                                    title="Restaurer la checklist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                        <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
                                    </svg>
                                    Restaurer
                                </button>
                                <button 
                                    onclick={() => state.confirmDelete(checklist)}
                                    class="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-xs font-bold"
                                    title="Supprimer la checklist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
                                    </svg>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-secondary dark:border-gray-700 rounded-3xl transition-colors">
                <div class="p-4 bg-secondary dark:bg-gray-800 rounded-full mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-primary opacity-40">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 font-medium text-center transition-colors">Aucune checklist dans l'historique.</p>
                <button 
                    onclick={() => goto(`${base}/accueil/`)}
                    class="mt-6 px-6 py-3 bg-primary text-text-inverse font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                    Retour à l'accueil
                </button>
            </div>
        {/if}
    </div>
</div>

<!-- Modal de confirmation de restauration -->
{#if state.showRestoreModal && state.checklistToRestore}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={state.cancelRestore}
    >
        <div 
            class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-primary/10 text-primary rounded-full mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-center text-text-main dark:text-white transition-colors">Restaurer la checklist ?</h2>
                <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
                    Souhaitez-vous restaurer la checklist <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.checklistToRestore.checklistName}"</span> ?<br />Elle sera à nouveau visible depuis l'écran d'accueil.
                </p>
            </div>
            
            <div class="flex flex-col gap-3">
                <button 
                    onclick={state.executeRestore}
                    class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
                >
                    Valider
                </button>
                <button 
                    onclick={state.cancelRestore}
                    class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Modal de confirmation de suppression -->
{#if state.showDeleteModal && state.checklistToDelete}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={state.cancelDelete}
    >
        <div 
            class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-red-500/10 text-red-500 rounded-full mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Zm4.33.25a.75.75 0 0 0-1.5-.085l-.5 8.5a.75.75 0 0 0 1.5.085l.5-8.5Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-center text-text-main dark:text-white transition-colors">Supprimer la checklist ?</h2>
                <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
                    Attention : la suppression de la checklist <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.checklistToDelete.checklistName}"</span> est définitive.
                </p>
            </div>
            
            <div class="flex flex-col gap-3">
                <button 
                    onclick={state.executeDelete}
                    class="w-full py-4 px-4 bg-red-500 text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-red-500/20"
                >
                    Supprimer
                </button>
                <button 
                    onclick={state.cancelDelete}
                    class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}
