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

    function addToGoogleCalendar(checklist: any) {
        const title = encodeURIComponent(`Checklist: ${checklist.checklistName}`);
        const url = window.location.origin + base + '/checklist/' + checklist.checklistId;
        const details = encodeURIComponent(`Lien vers la checklist : ${url}`);
        
        // Date de début (maintenant)
        const now = new Date();
        const start = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
        
        // Date de fin (+1 heure)
        const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
        
        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
        
        window.open(googleUrl, '_blank');
    }
</script>

<div in:fade={{ duration: 300 }} class="p-6 transition-colors duration-300">
    <div class="mt-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-text-main dark:text-white uppercase tracking-wider text-sm opacity-60 transition-colors">Checklists en cours</h2>
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
                            <a href="{base}/checklist/{checklist.checklistId}" class="block">
                                <!-- Section Titre et Progression : Systématiquement au-dessus, wrap si trop long -->
                                <div class="flex items-center flex-wrap gap-2 mb-3">
                                    <h3 class="home-checklist-name font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">
                                        {checklist.checklistName}
                                    </h3>
                                    <span class="flex-shrink-0 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 transition-colors">
                                        {checklist.progress}%
                                    </span>
                                </div>
                                
                                <!-- Détails de la carte -->
                                <div class="flex flex-col gap-0.5">
                                    <p class="text-sm text-text-main/50 dark:text-gray-400 font-medium transition-colors">{checklist.modelName}</p>
                                    <div class="mt-1">
                                        <p class="text-[11px] text-text-main/40 dark:text-gray-500 font-medium transition-colors">Créée le {formatDate(checklist.creationDate)}</p>
                                        <p class="text-[11px] text-text-main/40 dark:text-gray-500 font-medium transition-colors">Modifiée le {formatDate(checklist.lastModifiedDate)}</p>
                                    </div>
                                </div>
                            </a>

                            <!-- Boutons d'action en dessous -->
                            <div class="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-secondary dark:border-gray-700 transition-colors">
                                <button 
                                    onclick={() => addToGoogleCalendar(checklist)}
                                    class="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer text-xs font-bold"
                                    title="Ajouter à Google Agenda"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                        <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
                                        <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9h-16.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd" />
                                    </svg>
                                    Agenda
                                </button>
                                <button 
                                    onclick={() => state.confirmDelete(checklist)}
                                    class="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-xs font-bold"
                                    title="Supprimer la checklist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 1 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
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
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0c0 .414-.336.75-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 font-medium text-center transition-colors">Aucune checklist en cours pour le moment.</p>
                <button 
                    onclick={layoutState.toggleCreateModal}
                    class="mt-6 px-6 py-3 bg-header-gradient text-text-inverse font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
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
            class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 1 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-center text-text-main dark:text-white transition-colors">Supprimer la checklist ?</h2>
                <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
                    Voulez-vous vraiment supprimer <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.checklistToDelete.checklistName}"</span> ? Cette action est irréversible.
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
                    class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}
