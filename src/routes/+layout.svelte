<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { pwaInfo } from 'virtual:pwa-info';
    import ReloadPrompt from '$lib/components/ReloadPrompt.svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import Header from '$lib/components/Header.svelte';
    import CreateChecklistModal from '$lib/components/CreateChecklistModal.svelte';
    import SettingsModal from '$lib/components/SettingsModal.svelte';
    import LogoutModal from '$lib/components/LogoutModal.svelte';
    import ToastContainer from '$lib/components/ToastContainer.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import Button from '$lib/components/Button.svelte';
    import { icons } from '$lib/ts/icons';

    let { children } = $props();

    onMount(async () => {
        await layoutState.init();
        
        // Gestion de la redirection via paramètre checklistId (ex: via Google Agenda)
        const urlParams = new URLSearchParams(window.location.search);
        const checklistId = urlParams.get('checklistId');
        if (checklistId) {
            // Nettoyer l'URL et rediriger
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('checklistId');
            window.history.replaceState({}, '', newUrl.href);
            goto(`${base}/checklist/${checklistId}`);
        }
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
    <div class="min-h-screen bg-white dark:bg-[#05010d] text-text-main dark:text-white flex flex-col relative transition-colors duration-300">
        <!-- Header simplifié -->
        {#if showHeader}
            <Header />
        {/if}

        <!-- Contenu principal -->
        <main class="flex-1 p-0 {showNav ? 'pb-28' : ''}">
            {@render children()}
        </main>

        {#if showNav}
            <Navbar />
        {/if}


        <CreateChecklistModal 
            isOpen={layoutState.showCreateModal} 
            onclose={layoutState.toggleCreateModal} 
        />

        <SettingsModal 
            isOpen={layoutState.showSettingsModal} 
            onclose={layoutState.toggleSettingsModal} 
        />

        <LogoutModal 
            isOpen={layoutState.showLogoutModal} 
            onclose={layoutState.toggleLogoutModal} 
        />

        <!-- Modal Import -->
        <Modal
            isOpen={layoutState.showImportModal}
            onclose={layoutState.cancelImport}
            title={layoutState.isUpdateImport ? "Mettre à jour la checklist ?" : "Importer une checklist ?"}
        >
            {#if layoutState.importData}
                <div class="flex flex-col items-center mb-6">
                    <div class="p-4 bg-primary/10 text-primary rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            {@html icons.share}
                        </svg>
                    </div>
                    {#if layoutState.isUpdateImport}
                        <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium">
                            Une version de la checklist <span class="text-text-main dark:text-white font-bold italic">"{layoutState.importData.checklistName}"</span> existe déjà. 
                            Voulez-vous la mettre à jour avec les nouveaux éléments tout en conservant votre progression actuelle ?
                        </p>
                    {:else}
                        <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium">
                            Voulez-vous importer la checklist <span class="text-text-main dark:text-white font-bold italic">"{layoutState.importData.checklistName}"</span> partagée par <span class="text-text-main dark:text-white font-bold">{layoutState.importData.userName}</span> ?
                        </p>
                    {/if}
                </div>
                
                <div class="flex flex-col gap-3">
                    <Button 
                        onclick={layoutState.confirmImport}
                        fullWidth
                    >
                        {layoutState.isUpdateImport ? "Mettre à jour" : "Valider l'import"}
                    </Button>
                    <Button 
                        variant="secondary"
                        onclick={layoutState.cancelImport}
                        fullWidth
                    >
                        Annuler
                    </Button>
                </div>
            {/if}
        </Modal>

    </div>
{:else}
    {@render children()}

    <!-- Modal Import (Hors layout pour la page de login) -->
    <Modal
        isOpen={layoutState.showImportModal}
        onclose={layoutState.cancelImport}
        title="Importer une checklist ?"
    >
        {#if layoutState.importData}
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-primary/10 text-primary rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        {@html icons.share}
                    </svg>
                </div>
                <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium">
                    Voulez-vous importer la checklist <span class="text-text-main dark:text-white font-bold italic">"{layoutState.importData.checklistName}"</span> partagée par <span class="text-text-main dark:text-white font-bold">{layoutState.importData.userName}</span> ?
                </p>
            </div>
            
            <div class="flex flex-col gap-3">
                <Button 
                    onclick={layoutState.confirmImport}
                    fullWidth
                >
                    Valider l'import
                </Button>
                <Button 
                    variant="secondary"
                    onclick={layoutState.cancelImport}
                    fullWidth
                >
                    Annuler
                </Button>
            </div>
        {/if}
    </Modal>
{/if}

<ReloadPrompt />
<ToastContainer />
