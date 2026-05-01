<script lang="ts">
    import Modal from './Modal.svelte';
    import Button from './Button.svelte';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';

    interface Props {
        isOpen: boolean;
        onclose: () => void;
    }

    let { isOpen, onclose }: Props = $props();
</script>

<Modal {isOpen} {onclose} title="Se déconnecter ?">
    <div class="flex flex-col gap-3">
        <Button 
            onclick={layoutState.logout}
            fullWidth
        >
            Oui, me déconnecter
        </Button>
        <Button 
            variant="secondary"
            onclick={onclose}
            fullWidth
        >
            Annuler
        </Button>
    </div>
</Modal>
