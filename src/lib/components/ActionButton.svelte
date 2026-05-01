<script lang="ts">
    interface Props {
        onclick: () => void;
        label: string;
        icon: string;
        disabled?: boolean;
        testId?: string;
        ariaLabel?: string;
    }

    let { onclick, label, icon, disabled = false, testId, ariaLabel }: Props = $props();
</script>

<button 
    class="flex flex-col items-center gap-1 text-text-inverse hover:scale-110 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
    {onclick} 
    {disabled}
    data-testid={testId}
    aria-label={ariaLabel || label}
>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
        {@html icon}
    </svg>
    <span class="text-[10px] font-bold uppercase tracking-wider">{label}</span>
</button>
