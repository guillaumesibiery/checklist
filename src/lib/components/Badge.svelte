<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        variant?: 'primary' | 'secondary' | 'outline';
        class?: string;
    }

    let { 
        children, 
        variant = 'primary',
        class: className = ''
    }: Props = $props();

    const variants = {
        primary: "bg-primary/10 text-primary border-primary/10 dark:border-primary/20",
        secondary: "bg-secondary dark:bg-gray-700 text-text-main dark:text-white border-transparent",
        outline: "bg-transparent text-primary border-primary/30"
    };
</script>

<span class="px-3 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 transition-colors {variants[variant]} {className}">
    {@render children()}
</span>
