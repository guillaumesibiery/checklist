<script lang="ts">
    import { fly } from 'svelte/transition';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        justify?: 'justify-around' | 'justify-center' | 'justify-between';
    }

    let { children, justify = 'justify-around' }: Props = $props();
</script>

<footer class="fixed bottom-0 left-0 right-0 p-4 z-10 pointer-events-none" in:fly={{ y: 50 }}>
    <nav class="bg-primary h-16 flex {justify} items-center px-4 rounded-2xl shadow-xl pointer-events-auto">
        {@render children()}
    </nav>
</footer>
