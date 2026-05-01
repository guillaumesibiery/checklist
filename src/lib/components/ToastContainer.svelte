<script lang="ts">
    import { toastState } from '$lib/ts/toastState.svelte';
    import Toast from './Toast.svelte';
</script>

<div class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 pointer-events-none w-full max-w-[90%] sm:max-w-md">
    {#each toastState.toasts as toast (toast.id)}
        <Toast {toast} />
    {/each}
</div>
