<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';

    interface Props {
        title: string;
        progress?: number;
        isExpanded: boolean;
        canDelete: boolean;
        showAddButton: boolean;
        ontoggle: () => void;
        ondelete: () => void;
        onadditem: () => void;
        oneditcategory?: () => void;
        children: any; // Snippet
    }

    let { 
        title, 
        progress, 
        isExpanded, 
        canDelete, 
        showAddButton, 
        ontoggle, 
        ondelete, 
        onadditem, 
        oneditcategory,
        children 
    }: Props = $props();

    let isMenuOpen = $state(false);

    function toggleMenu(e: Event) {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }
</script>

<section class="bg-white dark:bg-gray-800 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] rounded-2xl transition-colors relative">
    <!-- Header de la catégorie -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="w-full p-4 px-3 bg-transparent flex justify-between items-center hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors cursor-pointer rounded-t-2xl {isExpanded ? '' : 'rounded-b-2xl'}"
            role="button"
            tabindex="0"
            onclick={ontoggle}>
        <div class="flex items-center gap-2">
            {#if progress !== undefined}
                <span class="px-2.5 py-1 rounded-full text-xs font-bold {progress === 100 ? 'bg-[#699e4b]/10 text-[#699e4b]' : 'bg-primary/10 text-primary'}">
                    {progress}%
                </span>
            {/if}
            <h2 class="text-base font-bold text-text-main dark:text-white transition-colors">{title}</h2>
        </div>
        <div class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                 class="w-5 h-5 text-primary transition-transform duration-300"
                 class:rotate-180={!isExpanded}>
                {@html icons.chevronDown}
            </svg>

            {#if canDelete}
                <div class="relative">
                    <button class="p-2 text-text-main dark:text-gray-300 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                            onclick={toggleMenu}
                            aria-label="Options de la catégorie">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-primary">
                            {@html icons.ellipsisVertical}
                        </svg>
                    </button>

                    {#if isMenuOpen}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="fixed inset-0 z-40 cursor-default" onclick={(e) => { e.stopPropagation(); closeMenu(); }} aria-hidden="true"></div>
                        <div class="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 flex flex-col"
                             transition:scale={{ duration: 150, start: 0.95 }}>
                            {#if oneditcategory}
                                <button class="w-full px-4 py-3 text-sm text-left font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-text-main dark:text-gray-200"
                                        onclick={(e) => { e.stopPropagation(); closeMenu(); oneditcategory(); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-primary">
                                        {@html icons.pencil}
                                    </svg>
                                    Modifier
                                </button>
                            {/if}
                            <button class="w-full px-4 py-3 text-sm text-left font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer text-red-500"
                                    onclick={(e) => { e.stopPropagation(); closeMenu(); ondelete(); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                                    {@html icons.trash}
                                </svg>
                                Supprimer
                            </button>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
    
    {#if isExpanded}
        <div class="divide-y divide-secondary dark:divide-gray-700 transition-colors overflow-hidden rounded-b-2xl" transition:fade={{ duration: 200 }}>
            {#if showAddButton}
                <button class="w-full py-3 bg-secondary/30 dark:bg-gray-700/30 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onclick={onadditem}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                        {@html icons.plus}
                    </svg>
                    Ajouter un élément
                </button>
            {/if}

            {@render children()}
        </div>
    {/if}
</section>
