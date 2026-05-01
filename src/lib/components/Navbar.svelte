<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';
    import { fade } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';

    const isPath = (path: string) => page.url.pathname === `${base}/${path}`;
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#05010d] border-t border-secondary dark:border-gray-800 pb-5 pt-2 grid grid-cols-5 items-end z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300" transition:fade>
    <!-- Accueil -->
    <div class="flex justify-center">
        <button 
            onclick={() => goto(`${base}/accueil`)}
            class="flex flex-col items-center gap-1 group cursor-pointer"
        >
            <div class="p-2 {isPath('accueil') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    {@html icons.accueil}
                </svg>
            </div>
            <span class="text-[8px] sm:text-[10px] font-bold {isPath('accueil') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Accueil</span>
        </button>
    </div>

    <!-- Modèles -->
    <div class="flex justify-center">
        <button 
            onclick={() => goto(`${base}/modeles`)}
            class="flex flex-col items-center gap-1 group cursor-pointer"
        >
            <div class="p-2 {isPath('modeles') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    {@html icons.modeles}
                </svg>
            </div>
            <span class="text-[8px] sm:text-[10px] font-bold {isPath('modeles') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Modèles</span>
        </button>
    </div>

    <!-- Créer -->
    <div class="flex justify-center">
        <button 
            onclick={layoutState.toggleCreateModal}
            class="flex flex-col items-center group cursor-pointer"
        >
            <div class="flex flex-col items-center px-4 py-4 bg-header-gradient text-text-inverse rounded-2xl group-active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    {@html icons.plus}
                </svg>
            </div>
        </button>
    </div>

    <!-- Historique -->
    <div class="flex justify-center">
        <button 
            onclick={() => goto(`${base}/historique`)}
            class="flex flex-col items-center gap-1 group cursor-pointer"
        >
            <div class="p-2 {isPath('historique') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} group-active:scale-95 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                    {@html icons.historique}
                </svg>
            </div>
            <span class="text-[8px] sm:text-[10px] font-bold {isPath('historique') ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Historique</span>
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
                    {@html icons.parametres}
                </svg>
            </div>
            <span class="text-[8px] sm:text-[10px] font-bold {layoutState.showSettingsModal ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} uppercase text-center">Paramètres</span>
        </button>
    </div>
</nav>
