<script lang="ts">
    import { icons } from '$lib/ts/icons';

    interface Props {
        item: any;
        onupdateQuantity: (delta: number) => void;
        ondeleteItem: () => void;
    }

    let { item, onupdateQuantity, ondeleteItem }: Props = $props();

    const wantedQty = $derived(item['wanted-quantity']);
</script>

<div class="p-4 flex items-center gap-3">
    <div class="flex-grow flex flex-col min-w-0">
        <span class="text-text-main dark:text-white font-medium truncate transition-colors">
            {item.item}
        </span>
    </div>

    <!-- Controls -->
    <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-lg p-1 transition-colors">
        <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                onclick={() => onupdateQuantity(-1)}
                aria-label="Diminuer la quantité"
                title="Diminuer la quantité">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                {@html icons.minus}
            </svg>
        </button>
        <span class="w-8 text-center font-bold text-text-main dark:text-white transition-colors">
            {wantedQty}
        </span>
        <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                onclick={() => onupdateQuantity(1)}
                aria-label="Augmenter la quantité"
                title="Augmenter la quantité">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                {@html icons.plus}
            </svg>
        </button>
    </div>

    <!-- Delete item button -->
    <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
            onclick={ondeleteItem}
            aria-label="Supprimer l'élément"
            title="Supprimer l'élément">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
            {@html icons.trash}
        </svg>
    </button>
</div>
