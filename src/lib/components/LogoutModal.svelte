<script lang="ts">
    import Modal from './Modal.svelte';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';

    interface Props {
        isOpen: boolean;
        onclose: () => void;
    }

    let { isOpen, onclose }: Props = $props();
</script>

<Modal {isOpen} {onclose} title="Se déconnecter ?">
    <div class="flex flex-col gap-3">
        <button 
            onclick={layoutState.logout}
            class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-primary/20"
        >
            Oui, me déconnecter
        </button>
        <button 
            onclick={onclose}
            class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
        >
            Annuler
        </button>
    </div>
</Modal>
