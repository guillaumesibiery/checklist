<script lang="ts">
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';
    import { fade } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';
    import logoLight from '$lib/assets/CHECKLIST-png-small.png';
    import logoDark from '$lib/assets/CHECKLIST-png-small-black.png';

    // Les icônes sont centralisées dans $lib/ts/icons
</script>

<header class="w-full p-4 sm:p-6 flex justify-between items-center bg-white dark:bg-[#111828] border-b border-secondary dark:border-gray-800" transition:fade>
    <div class="flex items-center">
        <img 
            src={layoutState.isDarkMode ? logoDark : logoLight} 
            alt="Logo Checklist" 
            class="h-8 sm:h-10 w-auto object-contain"
        />
    </div>

    <div class="flex gap-1 items-center">
        <button
            onclick={layoutState.toggleLogoutModal}
            class="p-2 hover:bg-primary/10 rounded-full transition-colors cursor-pointer text-primary"
            aria-label="Déconnexion"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 sm:w-8 sm:h-8">
                {@html icons.logout}
            </svg>
        </button>
    </div>
</header>
