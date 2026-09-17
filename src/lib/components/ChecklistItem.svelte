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
        oneditItem: () => void;
    }

    let { 
        item, 
        readOnly, 
        isEditMode, 
        ontoggleDisabled, 
        ontoggleItem, 
        onupdateQuantity, 
        ondeleteItem,
        oneditItem
    }: Props = $props();

    const isDisabled = $derived(item.disabled === 'true' || item.disabled === true);
    const wantedQty = $derived(parseInt(item['wanted-quantity'].toString()));
    const addedQty = $derived(parseInt(item['added-quantity'].toString()));
    const isAddedByUser = $derived(item.addedByUser === "true" || item.addedByUser === true);
</script>

<div class="p-4 px-3 flex items-center gap-2 transition-opacity duration-300"
     class:opacity-40={isDisabled}>
    
    <!-- Bouton toggle pour activer/désactiver en mode édition -->
    {#if isEditMode}
        <button class="w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer flex-shrink-0"
                class:bg-primary={!isDisabled}
                class:bg-secondary={isDisabled}
                class:dark:bg-gray-700={isDisabled}
                disabled={readOnly}
                onclick={ontoggleDisabled}
                aria-label="Activer/Désactiver l'élément">
            <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm"
                 class:translate-x-6={!isDisabled}>
            </div>
        </button>
    {/if}

    <!-- Item Name & Quantity Info -->
    <div class="flex-grow flex flex-col min-w-0 ">
        <div class="flex items-center gap-1">
            {#if addedQty >= wantedQty}
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#699e4b" 
                        class="w-5 h-5">
                        {@html icons.checkCircle}
                    </svg>
                </div>
            {/if}
            <div>
            <div class=" text-text-main dark:text-white text-sm transition-colors" 
                class:line-through={isDisabled}>
                {item.item}
            </div>
            {#if wantedQty > 1}
                <div class="text-xs text-text-main/50 dark:text-gray-400 transition-colors" class:line-through={isDisabled}>
                    Quantité : {wantedQty}
                </div>
            {/if}
            </div>
        </div>
    </div>

    <!-- Contrôles : checkbox animée ou compteur de quantité -->
    {#if !isDisabled && !readOnly && !isEditMode}
        <div class="flex items-center gap-2" in:scale>
            {#if wantedQty === 1}
                <!-- Checkbox animée avec check vert -->
                <button class="w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-300 flex-shrink-0"
                        class:border-[#699e4b]={addedQty >= wantedQty}
                        class:bg-[#699e4b]={addedQty >= wantedQty}
                        class:border-gray-300={addedQty < wantedQty}
                        class:dark:border-gray-500={addedQty < wantedQty}
                        onclick={ontoggleItem}
                        aria-label="Cocher l'élément">
                    {#if addedQty >= wantedQty}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
                             class="w-4 h-4 animate-checkbox-check"
                             in:scale={{ duration: 250, start: 0.5 }}>
                            {@html icons.check}
                        </svg>
                    {/if}
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

    <!-- Actions: Edit & Delete -->
    {#if !readOnly && isEditMode}
        <button class="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                onclick={oneditItem}
                aria-label="Modifier l'élément">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                {@html icons.pencil}
            </svg>
        </button>
        {#if isAddedByUser}
            <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                    onclick={ondeleteItem}
                    aria-label="Supprimer l'élément">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    {@html icons.trash}
                </svg>
            </button>
        {/if}
    {/if}
</div>
