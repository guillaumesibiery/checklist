<script lang="ts">
    import { fade } from 'svelte/transition';

    interface Props {
        id: string;
        label?: string;
        value: string | number;
        type?: string;
        placeholder?: string;
        maxlength?: number;
        error?: string;
        oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
        autofocus?: boolean;
        class?: string;
    }

    let { 
        id, 
        label, 
        value = $bindable(), 
        type = 'text', 
        placeholder = '', 
        maxlength, 
        error,
        oninput,
        autofocus = false,
        class: className = ''
    }: Props = $props();
</script>

<div class="flex flex-col gap-1 {className}">
    {#if label}
        <label for={id} class="block text-sm font-bold text-text-main/60 dark:text-gray-400 ml-1 uppercase tracking-wider">
            {label}
        </label>
    {/if}
    
    <input
        {id}
        {type}
        {placeholder}
        {maxlength}
        {autofocus}
        bind:value
        {oninput}
        class="w-full p-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium {error ? 'border-red-500' : ''}"
    />

    {#if error}
        <p class="text-red-500 text-xs mt-1 ml-1 font-medium" transition:fade>
            {error}
        </p>
    {/if}
</div>
