<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import type { Snippet } from 'svelte';

    interface Props {
        isOpen: boolean;
        onclose: () => void;
        title?: string;
        children: Snippet;
        maxWidth?: string;
    }

    let { isOpen, onclose, title, children, maxWidth = 'max-w-sm' }: Props = $props();
</script>

{#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={onclose}
    >
        <div 
            class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full {maxWidth} shadow-2xl transition-colors duration-300"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            {#if title}
                <h2 class="text-2xl font-bold mb-6 text-center text-text-main dark:text-white">{title}</h2>
            {/if}
            
            {@render children()}
        </div>
    </div>
{/if}
