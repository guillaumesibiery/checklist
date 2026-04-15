<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { layoutState } from '$lib/layoutState.svelte.ts';
    import { page } from '$app/state';
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let { children } = $props();

    onMount(async () => {
        await layoutState.init();
    });

    const isLoginPage = $derived(page.url.pathname === '/');
    const isChecklistEditPage = $derived(page.url.pathname.startsWith('/checklist/'));
    const showLayout = $derived(!isLoginPage && !!layoutState.user);
    const showHeader = $derived(!isChecklistEditPage);
    const showNav = $derived(!isChecklistEditPage);
</script>

<svelte:head>
    <title>Checklist</title>
    <link rel="icon" href={favicon} />
</svelte:head>

{#if showLayout}
    <div class="min-h-screen bg-white text-text-main flex flex-col relative">
        <!-- Header (Bandeau personnalisé) style maquette -->
        {#if showHeader}
            <div class="sticky top-0 z-20 bg-white" transition:fade>
                <header class="m-2 sm:m-4 p-4 sm:p-6 bg-primary text-text-inverse shadow-lg rounded-[2rem] sm:rounded-[2.5rem]">
                    <div class="flex justify-between items-start">
                        {#if layoutState.user}
                            <div in:fade={{ duration: 300 }} class="flex flex-col gap-1">
                                {#if page.url.pathname === '/accueil'}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Bonjour, {layoutState.user.firstName}</h1>
                                    <p class="text-text-inverse/90 text-sm sm:text-base font-medium">Comment allez vous aujourd'hui ?</p>
                                    {#if layoutState.checklistsCount > 0}
                                        <div class="mt-1" transition:fade>
                                            <span class="bg-white/20 text-text-inverse px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-sm inline-flex items-center">
                                                {layoutState.checklistsCount} {layoutState.checklistsCount > 1 ? 'checklists' : 'checklist'} en cours
                                            </span>
                                        </div>
                                    {/if}
                                {:else if page.url.pathname === '/historique'}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Historique</h1>
                                    <p class="text-text-inverse/90 text-sm sm:text-base font-medium">Vos checklists terminées</p>
                                    {#if layoutState.finishedChecklistsCount > 0}
                                        <div class="mt-1" transition:fade>
                                            <span class="bg-white/20 text-text-inverse px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-sm inline-flex items-center">
                                                {layoutState.finishedChecklistsCount} {layoutState.finishedChecklistsCount > 1 ? 'checklists' : 'checklist'} terminée{layoutState.finishedChecklistsCount > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    {/if}
                                {:else}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">{layoutState.user.firstName}</h1>
                                {/if}
                            </div>
                        {:else}
                            <div class="animate-pulse space-y-2">
                                <div class="h-8 bg-white/20 rounded w-40"></div>
                                <div class="h-4 bg-white/10 rounded w-56"></div>
                            </div>
                        {/if}

                        <button 
                            onclick={layoutState.toggleLogoutModal}
                            class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-text-inverse mt-1"
                            aria-label="Déconnexion"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 sm:w-8 sm:h-8">
                                <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </header>
            </div>
        {/if}

        <!-- Contenu principal -->
        <main class="flex-1 p-0 {showNav ? 'pb-28' : ''}">
            {@render children()}
        </main>

        <!-- Menu fixe en bas -->
        {#if showNav}
            <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary pb-6 pt-2 grid grid-cols-3 items-end z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]" transition:fade>
                <!-- Accueil -->
                <div class="flex justify-center">
                    <button 
                        onclick={() => goto('/accueil')}
                        class="flex flex-col items-center gap-1 group cursor-pointer pb-1"
                    >
                        <div class="p-2 {page.url.pathname === '/accueil' ? 'text-primary' : 'text-gray-400'} group-active:scale-95 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-1.06-1.06V18.3c0 .58-.45 1.06-1.03 1.06h-2.25c-.58 0-1.06-.48-1.06-1.06v-4.5c0-.58-.48-1.06-1.06-1.06h-1.5c-.58 0-1.06.48-1.06 1.06v4.5c0 .58-.48 1.06-1.06 1.06H6.75c-.58 0-1.06-.48-1.06-1.06v-5.75l-1.06 1.06a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" />
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold {page.url.pathname === '/accueil' ? 'text-primary' : 'text-gray-400'} uppercase tracking-widest">Accueil</span>
                    </button>
                </div>

                <div class="flex justify-center">
                    <button 
                        onclick={layoutState.toggleCreateModal}
                        class="flex flex-col items-center gap-1 group cursor-pointer pb-1"
                    >
                        <div class="p-2 bg-primary text-text-inverse rounded-2xl group-active:scale-95 transition-transform shadow-lg shadow-primary/20">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path d="M10.75 4.75a.75.75 0 0 1 1.5 0v5.25h5.25a.75.75 0 0 1 0 1.5h-5.25v5.25a.75.75 0 0 1-1.5 0v-5.25H5.25a.75.75 0 0 1 0-1.5h5.25V4.75Z" />
                            </svg>
                        </div>
                        <span class="text-[10px] font-black text-primary uppercase tracking-widest text-center leading-tight">Creer<br/>une checklist</span>
                    </button>
                </div>

                <!-- Historique -->
                <div class="flex justify-center">
                    <button 
                        onclick={() => goto('/historique')}
                        class="flex flex-col items-center gap-1 group cursor-pointer pb-1"
                    >
                        <div class="p-2 {page.url.pathname === '/historique' ? 'text-primary' : 'text-gray-400'} group-active:scale-95 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold {page.url.pathname === '/historique' ? 'text-primary' : 'text-gray-400'} uppercase tracking-widest">Historique</span>
                    </button>
                </div>
            </nav>
        {/if}

        <!-- Modals Globaux -->
        <!-- Modal de création de checklist -->
        {#if layoutState.showCreateModal}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                transition:fade={{ duration: 200 }}
                onclick={layoutState.toggleCreateModal}
            >
                <div 
                    class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
                    transition:scale={{ duration: 200, start: 0.9 }}
                    onclick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                >
                    <h2 class="text-2xl font-bold mb-6 text-center text-text-main">Nouvelle checklist</h2>
                    
                    <div class="space-y-4">
                        <div>
                            <label for="checklistName" class="block text-sm font-bold text-text-main/60 mb-1 ml-1 uppercase tracking-wider">
                                Nom de la checklist
                            </label>
                            <input 
                                type="text" 
                                id="checklistName"
                                bind:value={layoutState.checklistName}
                                placeholder="Ex: Vacances d'été"
                                class="w-full p-4 bg-secondary rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                                maxlength="50"
                            />
                            {#if layoutState.nameError}
                                <p class="text-red-500 text-xs mt-1 ml-1 font-medium" transition:fade>{layoutState.nameError}</p>
                            {/if}
                        </div>

                        <div>
                            <label for="model" class="block text-sm font-bold text-text-main/60 mb-1 ml-1 uppercase tracking-wider">
                                Modèle
                            </label>
                            <select 
                                id="model"
                                bind:value={layoutState.selectedModel}
                                class="w-full p-4 bg-secondary rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium appearance-none"
                            >
                                <option value="" disabled selected>Choisir un modèle</option>
                                {#each layoutState.availableModels as model}
                                    <option value={model.file}>{model.name}</option>
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
                                onclick={layoutState.toggleCreateModal}
                                class="w-full py-4 px-4 bg-secondary text-text-main rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Modal de déconnexion -->
        {#if layoutState.showLogoutModal}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                transition:fade={{ duration: 200 }}
                onclick={layoutState.toggleLogoutModal}
            >
                <div 
                    class="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
                    transition:scale={{ duration: 200, start: 0.9 }}
                    onclick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                >
                    <h2 class="text-2xl font-bold mb-2 text-center text-text-main">Se déconnecter ?</h2>
                    <div class="flex flex-col gap-3">
                        <button 
                            onclick={layoutState.logout}
                            class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
                        >
                            Oui, me déconnecter
                        </button>
                        <button 
                            onclick={layoutState.toggleLogoutModal}
                            class="w-full py-4 px-4 bg-secondary text-text-main rounded-2xl font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
{:else}
    {@render children()}
{/if}
