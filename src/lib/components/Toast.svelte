<script lang="ts">
    import { fly, fade } from 'svelte/transition';
    import { backOut } from 'svelte/easing';
    import { toastState, type Toast } from '$lib/ts/toastState.svelte';
    import { icons } from '$lib/ts/icons';

    interface Props {
        toast: Toast;
    }

    let { toast }: Props = $props();

    const typeStyles = {
        success: "bg-[#699e4b] text-white shadow-[#699e4b]/20",
        error: "bg-red-500 text-white shadow-red-500/20",
        info: "bg-[#3974aa] text-white shadow-[#3974aa]/20"
    };

    const typeIcons = {
        success: icons.check,
        error: icons.trash,
        info: icons.informationCircle
    };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
    class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl pointer-events-auto cursor-pointer {typeStyles[toast.type]}"
    in:fly={{ y: 20, duration: 400, easing: backOut }}
    out:fade={{ duration: 200 }}
    onclick={() => toastState.remove(toast.id)}
>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 flex-shrink-0">
        {@html typeIcons[toast.type]}
    </svg>
    <span class="text-sm font-bold leading-tight">{toast.message}</span>
</div>
