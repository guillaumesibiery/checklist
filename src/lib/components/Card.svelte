<script lang="ts">
    import type { Snippet } from 'svelte';
    import { base } from '$app/paths';

    interface Props {
        title: string;
        href?: string;
        onclick?: () => void;
        children?: Snippet;
        info?: Snippet;
        actions?: Snippet;
        testId?: string;
    }

    let { 
        title, 
        href, 
        onclick, 
        children, 
        info, 
        actions,
        testId
    }: Props = $props();
</script>

<div class="group relative overflow-hidden bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-[2rem] hover:bg-primary/10 dark:hover:bg-primary/20 transition-all active:scale-[0.98]">
    {#if href}
        <a {href} class="home-checklist-name block px-6 pt-5 pb-3" data-testid={testId}>
            <h3 class="font-bold text-xl text-text-main dark:text-white mb-4">
                {title}
            </h3>
            {#if children}
                {@render children()}
            {/if}
        </a>
    {:else if onclick}
        <button class="w-full text-left cursor-pointer block px-6 pt-5 pb-3" {onclick} data-testid={testId}>
            <h3 class="font-bold text-xl text-text-main dark:text-white mb-4">
                {title}
            </h3>
            {#if children}
                {@render children()}
            {/if}
        </button>
    {:else}
        <div class="px-6 pt-5 pb-3">
            <h3 class="font-bold text-xl text-text-main dark:text-white mb-4">
                {title}
            </h3>
            {#if children}
                {@render children()}
            {/if}
        </div>
    {/if}

    <!-- Ligne du bas : Infos et Actions -->
    <div class="flex items-center justify-between px-6 pb-5 mt-0">
        <!-- Informations (Badges, etc.) -->
        <div class="flex flex-col gap-2">
            {#if info}
                {@render info()}
            {/if}
        </div>

        <!-- Actions (Boutons, etc.) -->
        <div class="flex items-center gap-2">
            {#if actions}
                {@render actions()}
            {/if}
        </div>
    </div>
</div>
