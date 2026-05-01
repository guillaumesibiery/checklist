<script lang="ts">
    import { page } from '$app/state';
    import { createModelEditorState } from './page.svelte.ts';
    import { filterInput } from '$lib/ts/modalInputFilter';
    import { fade, fly, scale } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';
    import ActionButton from '$lib/components/ActionButton.svelte';
    import BottomActionMenu from '$lib/components/BottomActionMenu.svelte';
    import Category from '$lib/components/Category.svelte';
    import ModelItem from '$lib/components/ModelItem.svelte';
    import './page.css';

    const state = createModelEditorState(page.params.id as string);
</script>

<div class="min-h-screen bg-secondary dark:bg-[#05010d] pb-24 transition-colors duration-300">
    {#if state.loading}
        <div class="fixed top-0 left-0 right-0 h-20 bg-primary p-4 z-10 shadow-lg flex flex-col justify-end">
            <div class="animate-pulse h-6 bg-white/20 rounded w-1/2 mb-4"></div>
        </div>
        <div class="pt-28 px-4 space-y-6">
            {#each Array(3) as _}
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm animate-pulse transition-colors">
                    <div class="h-6 bg-secondary dark:bg-gray-700 rounded w-1/3 mb-4 transition-colors"></div>
                    {#each Array(4) as _}
                        <div class="h-12 bg-secondary dark:bg-gray-700 rounded w-full mt-2 transition-colors"></div>
                    {/each}
                </div>
            {/each}
        </div>
    {:else if state.model}
        <!-- Header Style Checklist -->
        <header class="fixed top-0 left-0 right-0 bg-primary text-text-inverse p-4 z-10 flex flex-col items-center min-h-20 justify-center pt-[calc(1rem+env(safe-area-inset-top))]" in:fly={{ y: -50 }}>
            <h1 class="text-xl font-bold truncate w-full text-center px-8">Modèle "{state.model.modelName}"</h1>
        </header>

        <!-- Content -->
        <main class="pt-28 px-4 space-y-6">
            <button class="w-full py-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors active:scale-95 cursor-pointer"
                    onclick={state.openAddCategoryModal}
                    in:fade>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                    {@html icons.plus}
                </svg>
                Ajouter une catégorie
            </button>

            {#each state.model.elements as element, catIndex}
                <Category 
                    title={element.category}
                    isExpanded={state.expandedCategories.has(catIndex)}
                    canDelete={true}
                    showAddButton={true}
                    ontoggle={() => state.toggleCategory(catIndex)}
                    ondelete={() => state.deleteCategory(catIndex)}
                    onadditem={() => state.openAddItemModal(element.category)}
                >
                    {#each element.items as item, itemIndex}
                        <ModelItem 
                            {item}
                            onupdateQuantity={(delta) => state.updateItemQuantity(catIndex, itemIndex, delta)}
                            ondeleteItem={() => state.deleteItem(catIndex, itemIndex)}
                        />
                    {/each}
                </Category>
            {/each}
        </main>

        <!-- Footer Menu -->
        <BottomActionMenu justify="justify-center">
            <ActionButton 
                onclick={state.quit} 
                icon={icons.logout}
                label="Quitter"
            />
        </BottomActionMenu>

        <!-- Modal d'ajout de catégorie -->
        {#if state.isAddCategoryModalOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}
                 onclick={state.closeAddCategoryModal}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     onclick={(e) => e.stopPropagation()}
                     role="dialog"
                     aria-modal="true"
                     tabindex="-1">
                    <div class="p-8">
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-6 text-center transition-colors">Nouvelle catégorie</h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="categoryName" class="block text-sm font-medium text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider transition-colors">Nom de la catégorie</label>
                                <input type="text" 
                                       id="categoryName"
                                       value={state.newCategoryName}
                                       oninput={(e) => {
                                           const input = e.currentTarget;
                                           const filtered = filterInput(input.value);
                                           state.newCategoryName = filtered;
                                           input.value = filtered;
                                       }}
                                       placeholder="Ex: Bagages, Accessoires..."
                                       class="w-full px-4 py-3 bg-secondary dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-primary text-text-main dark:text-white placeholder:text-text-main/30 dark:placeholder:text-gray-500 transition-colors"
                                       onkeydown={(e) => e.key === 'Enter' && state.newCategoryName.trim() && !state.categoryExists && state.addCategory()}>
                                {#if state.categoryExists}
                                    <p class="mt-2 text-xs text-red-500 ml-1 font-medium" transition:fade>
                                        Une catégorie avec ce nom existe déjà
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 mt-8">
                            <button data-testid="add-model-category" class="w-full py-4 bg-primary text-text-inverse rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
                                    disabled={!state.newCategoryName.trim() || state.categoryExists}
                                    onclick={state.addCategory}>
                                Ajouter
                            </button>
                            <button class="w-full py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform cursor-pointer transition-colors"
                                    onclick={state.closeAddCategoryModal}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Modal d'ajout d'élément -->
        {#if state.isAddItemModalOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}
                 onclick={state.closeAddItemModal}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     onclick={(e) => e.stopPropagation()}
                     role="dialog"
                     aria-modal="true"
                     tabindex="-1">
                    <div class="p-8">
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-6 text-center transition-colors">Nouvel élément</h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="itemName" class="block text-sm font-medium text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider transition-colors">Nom de l'élément</label>
                                <input type="text" 
                                       id="itemName"
                                       value={state.newItemName}
                                       oninput={(e) => {
                                           const input = e.currentTarget;
                                           const filtered = filterInput(input.value);
                                           state.newItemName = filtered;
                                           input.value = filtered;
                                       }}
                                       placeholder="Ex: T-shirts, Couches..."
                                       class="w-full px-4 py-3 bg-secondary dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-primary text-text-main dark:text-white placeholder:text-text-main/30 dark:placeholder:text-gray-500 transition-colors"
                                       onkeydown={(e) => e.key === 'Enter' && state.newItemName.trim() && !state.itemExists && state.addItem()}>
                                {#if state.itemExists}
                                    <p class="mt-2 text-xs text-red-500 ml-1 font-medium" transition:fade>
                                        Un élément avec ce nom existe déjà
                                    </p>
                                {/if}
                            </div>

                            <div>
                                <label for="itemQuantity" class="block text-sm font-medium text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider transition-colors">Quantité par défaut</label>
                                <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-xl p-1 w-fit transition-colors">
                                    <button class="w-10 h-10 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                                            onclick={() => state.newItemQuantity = Math.max(1, state.newItemQuantity - 1)}
                                            aria-label="Diminuer la quantité"
                                            title="Diminuer la quantité">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                                            {@html icons.minus}
                                        </svg>
                                    </button>
                                    <input type="number" 
                                           id="itemQuantity"
                                           bind:value={state.newItemQuantity}
                                           min="1"
                                           class="w-12 text-center bg-transparent border-none focus:ring-0 font-bold text-text-main dark:text-white transition-colors">
                                    <button class="w-10 h-10 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                                            onclick={() => state.newItemQuantity = state.newItemQuantity + 1}
                                            aria-label="Augmenter la quantité"
                                            title="Augmenter la quantité">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                                            {@html icons.plus}
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 mt-8">
                            <button data-testid="add-model-item" class="w-full py-4 bg-primary text-text-inverse rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
                                    disabled={!state.newItemName.trim() || state.itemExists}
                                    onclick={state.addItem}>
                                Ajouter
                            </button>
                            <button class="w-full py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform cursor-pointer transition-colors"
                                    onclick={state.closeAddItemModal}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {:else}
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" in:fade>
            <h1 class="text-2xl font-bold text-red-500">Modèle non trouvé</h1>
            <p class="mt-2 text-text-main/60 dark:text-gray-400 transition-colors">Nous n'avons pas pu charger votre modèle.</p>
            <button onclick={state.quit} class="mt-8 px-6 py-3 bg-primary text-text-inverse rounded-xl font-bold shadow-lg active:scale-95 transition-transform cursor-pointer">
                Retour aux modèles
            </button>
        </div>
    {/if}
</div>