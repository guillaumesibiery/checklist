<script lang="ts">
    /**
     * Composant Dropdown générique avec icône ellipsis vertical.
     * S'ouvre au clic sur l'icône et se ferme au clic extérieur.
     * Utilise stopPropagation pour ne pas déclencher le clic sur la card parente.
     */
    import type { Snippet } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';

    interface Props {
        /** Contenu du menu déroulant */
        children: Snippet;
    }

    let { children }: Props = $props();

    /** État d'ouverture du menu */
    let isOpen = $state(false);

    /** Référence du conteneur pour la détection du clic extérieur */
    let containerRef: HTMLDivElement | undefined = $state(undefined);

    /** Basculer l'état d'ouverture */
    function toggle(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        isOpen = !isOpen;
    }

    /** Fermer le menu */
    function close() {
        isOpen = false;
    }

    /** Fermer le menu au clic extérieur */
    function handleClickOutside(event: MouseEvent) {
        if (containerRef && !containerRef.contains(event.target as Node)) {
            close();
        }
    }

    /** Gestion du clic global pour fermeture */
    $effect(() => {
        if (isOpen) {
            document.addEventListener('click', handleClickOutside, true);
            return () => {
                document.removeEventListener('click', handleClickOutside, true);
            };
        }
    });
</script>

<!-- Conteneur relatif pour le positionnement du menu -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative" bind:this={containerRef} onclick={(e) => e.stopPropagation()}>
    <!-- Bouton déclencheur avec icône ellipsis -->
    <button
        type="button"
        class="p-2 rounded-xl text-primary hover:bg-primary/10 transition-colors cursor-pointer"
        onclick={toggle}
        aria-label="Options"
        aria-expanded={isOpen}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            {@html icons.ellipsisVertical}
        </svg>
    </button>

    <!-- Menu déroulant -->
    {#if isOpen}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="absolute right-0 bottom-full mb-2 min-w-[180px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50"
            transition:scale={{ duration: 150, start: 0.95 }}
            onclick={close}
        >
            {@render children()}
        </div>
    {/if}
</div>
