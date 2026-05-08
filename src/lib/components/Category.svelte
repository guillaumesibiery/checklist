<script lang="ts">
    import { fade } from 'svelte/transition';
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
        children 
    }: Props = $props();
</script>

<section class="bg-white dark:bg-gray-800 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden transition-colors">
    <!-- Header de la catégorie -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="w-full p-4 px-3 bg-white dark:bg-gray-800 flex justify-between items-center hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            role="button"
            tabindex="0"
            onclick={ontoggle}>
        <div class="flex items-center gap-1">
            {#if progress !== undefined && progress == 100}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#699e4b" 
                 class="w-5 h-5">
                    {@html icons.checkCircle}
                </svg>
            {/if}
            <h2 class="text-base font-bold text-text-main dark:text-white transition-colors">{title}</h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                 class="w-5 h-5 text-primary transition-transform duration-300"
                 class:rotate-180={!isExpanded}>
                {@html icons.chevronDown}
            </svg>
        </div>
        <div class="flex items-center gap-1">
            {#if progress !== undefined}
                <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {progress}%
                </span>
            {/if}
            {#if canDelete}
                <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        onclick={(e) => { e.stopPropagation(); ondelete(); }}
                        aria-label="Supprimer la catégorie">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                        {@html icons.trash}
                    </svg>
                </button>
            {/if}
        </div>
    </div>
    
    {#if isExpanded}
        <div class="divide-y divide-secondary dark:divide-gray-700 transition-colors" transition:fade={{ duration: 200 }}>
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
