<script lang="ts">
    import { createHistoriqueState } from './page.svelte.ts';
    import { fade, scale } from 'svelte/transition';
    import { goto } from '$app/navigation';
    const state = createHistoriqueState();

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

<div class="min-h-screen bg-white text-text-main flex flex-col relative">
    <!-- Header (Bandeau personnalisé) style maquette -->
    <div class="sticky top-0 z-20 bg-white">
        <header class="m-4 p-6 bg-primary text-text-inverse shadow-lg rounded-[2.5rem]">
            <div class="flex justify-between items-start">
                {#if state.user}
                    <div in:fade={{ duration: 300 }} class="flex flex-col gap-1">
                        <h1 class="text-2xl font-bold tracking-tight">Historique</h1>
                        <p class="text-text-inverse/90 font-medium">Vos checklists terminées</p>
                        {#if !state.isLoadingChecklists && state.checklistsCount > 0}
                            <div class="mt-1" transition:fade>
                                <span class="bg-white/20 text-text-inverse px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-sm inline-flex items-center">
                                    {state.checklistsCount} {state.checklistsCount > 1 ? 'checklists' : 'checklist'} terminée
                                </span>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="animate-pulse space-y-2">
                        <div class="h-8 bg-white/20 rounded w-40"></div>
                        <div class="h-4 bg-white/10 rounded w-56"></div>
                    </div>
                {/if}

                <button 
                    onclick={state.toggleLogoutModal}
                    class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-text-inverse mt-1"
                    aria-label="Déconnexion"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </header>
    </div>

    <!-- Contenu principal -->
    <main class="flex-1 p-6 pb-28">
        {#if state.user}
            <div in:fade={{ duration: 300 }}>
                <div class="mt-4">
                    <h2 class="text-lg font-bold text-text-main mb-4 uppercase tracking-wider text-sm opacity-60">Historique des checklists</h2>
                    
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
                                    <div class="block p-6 bg-white border-2 border-secondary rounded-[2rem] opacity-70">
                                        <div class="flex justify-between items-center pr-12">
                                            <div>
                                                <h3 class="font-bold text-lg text-text-main">{checklist.checklistName}</h3>
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
                                    </div>
                                    <!-- Bouton restaurer -->
                                    <button 
                                        onclick={() => state.confirmRestore(checklist)}
                                        class="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
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
                                onclick={() => goto('/accueil')}
                                class="mt-6 px-6 py-3 bg-primary text-text-inverse font-bold rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                                Retour à l'accueil
                            </button>
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="space-y-6 animate-pulse">
                <div class="h-6 bg-secondary rounded w-1/2"></div>
                <div class="h-48 bg-secondary rounded-[2rem]"></div>
            </div>
        {/if}
    </main>

    <!-- Menu fixe en bas -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary p-4 pb-6 flex justify-around items-center z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
        <button 
            onclick={() => goto('/accueil')}
            class="flex flex-col items-center gap-1 group cursor-pointer"
        >
            <div class="p-2 text-primary group-active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-1.06-1.06V18.3c0 .58-.45 1.06-1.03 1.06h-2.25c-.58 0-1.06-.48-1.06-1.06v-4.5c0-.58-.48-1.06-1.06-1.06h-1.5c-.58 0-1.06.48-1.06 1.06v4.5c0 .58-.48 1.06-1.06 1.06H6.75c-.58 0-1.06-.48-1.06-1.06v-5.75l-1.06 1.06a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" />
                </svg>
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Accueil</span>
        </button>

        <button 
            onclick={() => goto('/accueil')}
            class="flex flex-col items-center gap-1 group cursor-pointer"
        >
            <div class="p-2 text-primary group-active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" />
                </svg>
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Créer</span>
        </button>

        <button class="flex flex-col items-center gap-1 group cursor-pointer">
            <div class="p-2 bg-primary text-text-inverse rounded-2xl group-active:scale-95 transition-transform shadow-lg shadow-primary/30">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd" />
                </svg>
            </div>
            <span class="text-[10px] font-bold text-primary uppercase tracking-widest">Historique</span>
        </button>

        <button class="flex flex-col items-center gap-1 group cursor-pointer">
            <div class="p-2 text-primary group-active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    <path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.125 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.125-1.06l-1.72-1.72H21a.75.75 0 0 0 0-1.5h-5.094l1.72-1.72a.75.75 0 0 0 0-1.06Z" />
                </svg>
            </div>
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Modèles</span>
        </button>
    </nav>

    <!-- Modal de déconnexion -->
    {#if state.showLogoutModal}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            transition:fade={{ duration: 200 }}
            onclick={state.toggleLogoutModal}
        >
            <div 
                class="bg-white rounded-[2rem] p-8 w-full max-sm shadow-2xl"
                transition:scale={{ duration: 200, start: 0.9 }}
                onclick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                tabindex="-1"
            >
                <h2 class="text-2xl font-bold mb-2 text-center text-text-main">Se déconnecter ?</h2>
                <div class="flex flex-col gap-3">
                    <button 
                        onclick={state.logout}
                        class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
                    >
                        Oui, me déconnecter
                    </button>
                    <button 
                        onclick={state.toggleLogoutModal}
                        class="w-full py-4 px-4 bg-secondary text-text-main rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    {/if}

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
</div>
