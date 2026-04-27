<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { layoutState } from '$lib/layoutState.svelte.ts';
    import { filterInput } from '$lib/modalInputFilter';
    import { page } from '$app/state';
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { pwaInfo } from 'virtual:pwa-info';
    import ReloadPrompt from '$lib/components/ReloadPrompt.svelte';

    let { children } = $props();

    onMount(async () => {
        await layoutState.init();
    });

    const isLoginPage = $derived(page.url.pathname === base || page.url.pathname === `${base}/`);
    const isChecklistEditPage = $derived(!!page.params.id && page.url.pathname.includes('/checklist/'));
    const isModelEditPage = $derived(!!page.params.id && page.url.pathname.includes('/modeles/'));
    const showLayout = $derived(!isLoginPage && !!layoutState.user);
    const showHeader = $derived(!isChecklistEditPage && !isModelEditPage);
    const showNav = $derived(!isChecklistEditPage && !isModelEditPage);
</script>

<svelte:head>
    <title>Checklist</title>
    <link rel="icon" href={favicon} />
    <meta name="theme-color" content="#9d50f8" />
    {@html pwaInfo?.webManifest.linkTag}
</svelte:head>

{#if showLayout}
    <div class="min-h-screen bg-white dark:bg-gray-900 text-text-main dark:text-white flex flex-col relative transition-colors duration-300">
        <!-- Header (Bandeau personnalisé) style maquette -->
        {#if showHeader}
            <div class="sticky top-0 z-20 bg-white dark:bg-gray-900" transition:fade>

                <header class="m-2 sm:m-4 p-4 sm:p-6 bg-primary text-text-inverse shadow-lg rounded-[2rem] sm:rounded-[2.5rem]">
                    <div class="flex justify-between items-start">
                        {#if layoutState.user}
                            <div in:fade={{ duration: 300 }} class="flex flex-col gap-1">
                                {#if page.url.pathname === `${base}/accueil`}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Bonjour, {layoutState.user.firstName}</h1>
                                    <p class="text-text-inverse/90 text-sm sm:text-base font-medium">Comment allez vous aujourd'hui ?</p>
                                    {#if layoutState.checklistsCount > 0}
                                        <div class="mt-1" transition:fade>
                                            <span class="bg-white/20 text-text-inverse px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-sm inline-flex items-center">
                                                {layoutState.checklistsCount} {layoutState.checklistsCount > 1 ? 'checklists' : 'checklist'} en cours
                                            </span>
                                        </div>
                                    {/if}
                                {:else if page.url.pathname === `${base}/historique`}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Historique</h1>
                                    <p class="text-text-inverse/90 text-sm sm:text-base font-medium">Vos checklists terminées</p>
                                    {#if layoutState.finishedChecklistsCount > 0}
                                        <div class="mt-1" transition:fade>
                                            <span class="bg-white/20 text-text-inverse px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-sm inline-flex items-center">
                                                {layoutState.finishedChecklistsCount} {layoutState.finishedChecklistsCount > 1 ? 'checklists' : 'checklist'} terminée{layoutState.finishedChecklistsCount > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    {/if}
                                {:else if page.url.pathname === `${base}/modeles`}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">Modèles</h1>
                                    <p class="text-text-inverse/90 text-sm sm:text-base font-medium">Gérez vos propres modèles</p>
                                    {#if layoutState.createdModelsCount > 0}
                                        <div class="mt-1" transition:fade>
                                            <span class="bg-white/20 text-text-inverse px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 backdrop-blur-sm inline-flex items-center">
                                                {layoutState.createdModelsCount} {layoutState.createdModelsCount > 1 ? 'modèles créés' : 'modèle créé'}
                                            </span>
                                        </div>
                                    {/if}
                                {:else}
                                    <h1 class="text-xl sm:text-2xl font-bold tracking-tight">{layoutState.user.firstName}</h1>
                                {/if}
                            </div>
                        {/if}

                        <div class="flex gap-1 items-center mt-1">
                            <button 
                                onclick={layoutState.toggleLogoutModal}
                                class="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-text-inverse"
                                aria-label="Déconnexion"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 sm:w-8 sm:h-8">
                                    <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>

                    </div>
                </header>
            </div>
        {/if}

        <!-- Contenu principal -->
        <main class="flex-1 p-0 {showNav ? 'pb-28' : ''}">
            {@render children()}
        </main>

        {#if showNav}
            <nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-secondary dark:border-gray-800 pb-5 pt-2 grid grid-cols-5 items-end z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300" transition:fade>
                <!-- Accueil -->
                <div class="flex justify-center">
                    <button 
                        onclick={() => goto(`${base}/accueil`)}
                        class="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                        <div class="p-2 {page.url.pathname === `${base}/accueil` ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-1.06-1.06V18.3c0 .58-.45 1.06-1.03 1.06h-2.25c-.58 0-1.06-.48-1.06-1.06v-4.5c0-.58-.48-1.06-1.06-1.06h-1.5c-.58 0-1.06.48-1.06 1.06v4.5c0 .58-.48 1.06-1.06 1.06H6.75c-.58 0-1.06-.48-1.06-1.06v-5.75l-1.06 1.06a.75.75 0 0 1-1.06-1.06l8.69-8.69Z" />
                            </svg>
                        </div>
                        <span class="text-[8px] sm:text-[10px] font-bold {page.url.pathname === `${base}/accueil` ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Accueil</span>
                    </button>
                </div>

                <!-- Modèles -->
                <div class="flex justify-center">
                    <button 
                        onclick={() => goto(`${base}/modeles`)}
                        class="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                        <div class="p-2 {page.url.pathname === `${base}/modeles` ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                                <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
                            </svg>
                        </div>
                        <span class="text-[8px] sm:text-[10px] font-bold {page.url.pathname === `${base}/modeles` ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Modèles</span>
                    </button>
                </div>

                <!-- Créer -->
                <div class="flex justify-center">
                    <button 
                        onclick={layoutState.toggleCreateModal}
                        class="flex flex-col items-center group cursor-pointer"
                    >
                        <div class="flex flex-col items-center gap-0.5 px-4 py-2.5 bg-primary text-text-inverse rounded-2xl group-active:scale-95 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-[8px] sm:text-[10px] font-bold uppercase text-center">Créer</span>
                        </div>
                    </button>
                </div>

                <!-- Historique -->
                <div class="flex justify-center">
                    <button 
                        onclick={() => goto(`${base}/historique`)}
                        class="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                        <div class="p-2 {page.url.pathname === `${base}/historique` ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                                <path fill-rule="evenodd" d="m3.087 9 .54 9.17c.108 1.837 1.631 3.255 3.473 3.255h9.799c1.844 0 3.367-1.42 3.473-3.255l.54-9.17H3.087ZM10 12.25a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="text-[8px] sm:text-[10px] font-bold {page.url.pathname === `${base}/historique` ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Historique</span>
                    </button>
                </div>

                <!-- Paramètres -->
                <div class="flex justify-center">
                    <button 
                        onclick={layoutState.toggleSettingsModal}
                        class="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                        <div class="p-2 {layoutState.showSettingsModal ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                                <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                            </svg>
                        </div>
                        <span class="text-[8px] sm:text-[10px] font-bold {layoutState.showSettingsModal ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Paramètres</span>
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
                    class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
                    transition:scale={{ duration: 200, start: 0.9 }}
                    onclick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                >
                    <h2 class="text-2xl font-bold mb-6 text-center text-text-main dark:text-white">Nouvelle checklist</h2>
                    
                    <div class="space-y-4">
                        <div>
                            <label for="checklistName" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">
                                Nom de la checklist
                            </label>
                            <input 
                                type="text" 
                                id="checklistName"
                                value={layoutState.checklistName}
                                oninput={(e) => {
                                    const input = e.currentTarget;
                                    const filtered = filterInput(input.value);
                                    layoutState.checklistName = filtered;
                                    input.value = filtered;
                                }}
                                placeholder="Ex: Vacances d'été"
                                class="w-full p-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                                maxlength="50"
                            />
                            {#if layoutState.nameError}
                                <p class="text-red-500 text-xs mt-1 ml-1 font-medium" transition:fade>{layoutState.nameError}</p>
                            {/if}
                        </div>

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
                                class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Modal de paramètres -->
        {#if layoutState.showSettingsModal}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                transition:fade={{ duration: 200 }}
                onclick={layoutState.toggleSettingsModal}
            >
                <div 
                    class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
                    transition:scale={{ duration: 200, start: 0.9 }}
                    onclick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                >
                    <h2 class="text-2xl font-bold mb-6 text-center text-text-main dark:text-white">Paramètres</h2>
                    
                    <div class="space-y-4">
                        <!-- Mode sombre -->
                        <div class="flex items-center justify-between p-4 bg-secondary dark:bg-gray-700/50 rounded-2xl transition-colors">
                            <div class="flex flex-col">
                                <span class="font-bold text-text-main dark:text-gray-200">Mode sombre</span>
                                <span class="text-xs text-text-main/50 dark:text-gray-400">Activer le thème noir</span>
                            </div>
                            <button 
                                onclick={layoutState.toggleDarkMode}
                                class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none {layoutState.isDarkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}"
                                aria-label="Basculer le mode sombre"
                            >
                                <span class="sr-only">Mode sombre</span>
                                <span 
                                    class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform {layoutState.isDarkMode ? 'translate-x-6' : 'translate-x-1'}"
                                ></span>
                            </button>
                        </div>

                        <!-- Informations de version -->
                        <div class="p-4 bg-secondary dark:bg-gray-700/50 rounded-2xl transition-colors">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-primary uppercase tracking-wider mb-1">Version</span>
                                <span class="text-xs font-bold text-text-main dark:text-white transition-colors">
                                    v{__PACKAGE_VERSION__}
                                </span>
                            </div>
                            
                            <div class="my-3 border-t border-gray-300 dark:border-gray-600 opacity-50"></div>
                            
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-primary uppercase tracking-wider mb-1">Numéro de build</span>
                                <span class="text-xs font-bold text-text-main dark:text-white break-all transition-colors">
                                    {__APP_VERSION__}
                                </span>
                            </div>
                        </div>





                        <div class="pt-4">
                            <button 
                                onclick={layoutState.toggleSettingsModal}
                                class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                Fermer
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
                    class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
                    transition:scale={{ duration: 200, start: 0.9 }}
                    onclick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                >
                    <h2 class="text-2xl font-bold mb-2 text-center text-text-main dark:text-white">Se déconnecter ?</h2>
                    <div class="flex flex-col gap-3">
                        <button 
                            onclick={layoutState.logout}
                            class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
                        >
                            Oui, me déconnecter
                        </button>
                        <button 
                            onclick={layoutState.toggleLogoutModal}
                            class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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

<ReloadPrompt />
