<script lang="ts">
    import { scale } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';

    interface Props {
        item: any;
        readOnly: boolean;
        isEditMode: boolean;
        ontoggleDisabled: () => void;
        ontoggleItem: () => void;
        onupdateQuantity: (delta: number) => void;
        ondeleteItem: () => void;
    }

    let { 
        item, 
        readOnly, 
        isEditMode, 
        ontoggleDisabled, 
        ontoggleItem, 
        onupdateQuantity, 
        ondeleteItem 
    }: Props = $props();

    const isDisabled = $derived(item.disabled === 'true' || item.disabled === true);
    const wantedQty = $derived(parseInt(item['wanted-quantity'].toString()));
    const addedQty = $derived(parseInt(item['added-quantity'].toString()));
    const isAddedByUser = $derived(item.addedByUser === "true" || item.addedByUser === true);
</script>

<div class="p-4 px-3 flex items-center gap-2 transition-opacity duration-300"
     class:opacity-40={isDisabled}>
    
    <!-- Enable/Disable checkbox -->
    {#if isEditMode}
        <input type="checkbox" 
            class="w-5 h-5 rounded border-2 border-primary text-primary accent-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all duration-200 disabled:opacity-50" 
            checked={!isDisabled}
            disabled={readOnly}
            onchange={ontoggleDisabled}>
    {/if}

    <!-- Item Name & Quantity Info -->
    <div class="flex-grow flex flex-col min-w-0">
        <span class="text-text-main dark:text-white text-sm truncate transition-colors" 
              class:line-through={isDisabled}>
            {item.item}
        </span>
        {#if wantedQty > 1}
            <span class="text-xs text-text-main/50 dark:text-gray-400 transition-colors" class:line-through={isDisabled}>
                Quantité : {wantedQty}
            </span>
        {/if}
    </div>

    <!-- Controls -->
    {#if !isDisabled && !readOnly && !isEditMode}
        <div class="flex items-center gap-2" in:scale>
            {#if wantedQty === 1}
                <button class="w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer"
                        class:bg-primary={addedQty === 1}
                        class:bg-secondary={addedQty === 0}
                        class:dark:bg-gray-700={addedQty === 0}
                        onclick={ontoggleItem}
                        aria-label="Cocher l'élément">
                    <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm"
                         class:translate-x-6={addedQty === 1}>
                    </div>
                </button>
            {:else}
                <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-lg transition-colors">
                    <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                            onclick={() => onupdateQuantity(-1)}
                            aria-label="Diminuer la quantité">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                            {@html icons.minus}
                        </svg>
                    </button>
                    <span class="w-8 text-center font-bold text-text-main dark:text-white transition-colors">
                        {addedQty}
                    </span>
                    <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                            onclick={() => onupdateQuantity(1)}
                            aria-label="Augmenter la quantité">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                            {@html icons.plus}
                        </svg>
                    </button>
                </div>
            {/if}
        </div>
    {/if}

    <!-- Delete item button -->
    {#if isAddedByUser && !readOnly && isEditMode}
        <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                onclick={ondeleteItem}
                aria-label="Supprimer l'élément">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                {@html icons.trash}
            </svg>
        </button>
    {/if}
</div>
