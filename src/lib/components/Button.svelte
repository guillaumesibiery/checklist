<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        type?: 'button' | 'submit';
        variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
        loading?: boolean;
        onclick?: (e: MouseEvent) => void;
        children: Snippet;
        class?: string;
        fullWidth?: boolean;
        testId?: string;
    }

    let { 
        type = 'button', 
        variant = 'primary', 
        size = 'md',
        disabled = false, 
        loading = false, 
        onclick, 
        children,
        class: className = '',
        fullWidth = false,
        testId
    }: Props = $props();

    const baseStyles = "font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
    
    const variants = {
        primary: "bg-primary text-text-inverse hover:opacity-90 shadow-lg shadow-primary/20",
        secondary: "bg-secondary dark:bg-gray-700 text-text-main dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600",
        danger: "bg-red-500 text-white hover:opacity-90 shadow-lg shadow-red-500/20",
        ghost: "bg-transparent text-primary hover:bg-primary/10"
    };

    const sizes = {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-4 text-base",
        lg: "px-6 py-5 text-lg"
    };
</script>

<button 
    {type}
    {disabled}
    {onclick}
    data-testid={testId}
    class="{baseStyles} {variants[variant]} {sizes[size]} {fullWidth ? 'w-full' : ''} {className}"
>
    {#if loading}
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    {/if}
    {@render children()}
</button>
