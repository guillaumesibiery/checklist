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

<div in:fade={{ duration: 300 }} class="p-6">
    <div class="mt-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-main uppercase tracking-wider text-sm opacity-60">Historique des checklists</h2>
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
                        <button 
                            class="w-full text-left p-6 bg-white border-2 border-secondary rounded-[2rem] hover:border-primary/30 transition-all active:scale-[0.98] cursor-pointer"
                            onclick={() => goto(`${base}/checklist/${checklist.checklistId}/?readOnly=true`)}
                        >
                            <div class="flex justify-between items-center pr-12">
                                <div>
                                    <h3 class="font-bold text-lg text-text-main group-hover:text-primary transition-colors">{checklist.checklistName}</h3>
                                    <div class="flex flex-col">
                                        <p class="text-sm text-text-main/50 font-medium">{checklist.modelName}</p>
                                        <p class="text-[11px] text-text-main/40 font-medium">Terminée le {formatDate(checklist.lastModifiedDate)}</p>
                                    </div>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    <span class="text-primary font-bold">{checklist.progress}%</span>
                                    <div class="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div class="h-full bg-primary" style="width: {checklist.progress}%"></div>
                                    </div>
                                </div>
                            </div>
                        </button>
                        <!-- Bouton restaurer -->
                        <button 
                            onclick={(e) => { e.stopPropagation(); state.confirmRestore(checklist); }}
                            class="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-primary/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer z-10"
                            aria-label="Restaurer la checklist"
                            title="Restaurer la checklist"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-secondary rounded-3xl">
                <div class="p-4 bg-secondary rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-primary opacity-40">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                </div>
                <p class="text-gray-500 font-medium text-center">Aucune checklist dans l'historique.</p>
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
            class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-primary/10 text-primary rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-center text-text-main">Restaurer la checklist ?</h2>
                <p class="text-text-main/60 text-center mt-2 font-medium">
                    Souhaitez-vous restaurer la checklist <span class="text-text-main font-bold italic">"{state.checklistToRestore.checklistName}"</span> ?<br />Elle sera à nouveau visible depuis l'écran d'accueil.
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
                    class="w-full py-4 px-4 bg-secondary text-text-main rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}
