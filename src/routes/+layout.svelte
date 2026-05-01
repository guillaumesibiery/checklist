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

    </div>
{:else}
    {@render children()}
{/if}

<ReloadPrompt />
<ToastContainer />
