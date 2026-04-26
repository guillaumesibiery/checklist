<script lang="ts">
    import { page } from '$app/state';
    import { createModelEditorState } from './page.svelte.ts';
    import { filterInput } from '$lib/modalInputFilter';
    import { fade, fly, scale } from 'svelte/transition';

    const state = createModelEditorState(page.params.id as string);

    // Icônes Heroicons Solid
    const icons = {
        logout: `<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a0 0 0 0 1 0 0H7.5a0 0 0 0 1 0 0V5.25a0 0 0 0 1 0 0h6a0 0 0 0 1 0 0V8.25a.75.75 0 0 0 1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />`,
        plus: `<path d="M10.75 4.75a.75.75 0 00-1.5 0v5.25H4a.75.75 0 000 1.5h5.25v5.25a.75.75 0 001.5 0v-5.25H16a.75.75 0 000-1.5h-5.25V4.75z" />`,
        minus: `<path d="M5.25 10.75a.75.75 0 0 1 0-1.5h13.5a.75.75 0 0 1 0 1.5H5.25Z" />`,
        chevronDown: `<path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />`,
        trash: `<path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Zm4.33.25a.75.75 0 0 0-1.5-.085l-.5 8.5a.75.75 0 0 0 1.5.085l.5-8.5Z" clip-rule="evenodd" />`
    };
</script>

<div class="min-h-screen bg-secondary dark:bg-gray-900 pb-24 transition-colors duration-300">
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
        <header class="fixed top-0 left-0 right-0 bg-primary text-text-inverse p-4 z-10 shadow-lg flex flex-col items-center min-h-20 justify-center" in:fly={{ y: -50 }}>
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
                {@const isExpanded = state.expandedCategories.has(catIndex)}
                <section class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors" in:fade={{ delay: catIndex * 100 }}>
                    <div class="w-full p-4 bg-white dark:bg-gray-800 flex justify-between items-center hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors">
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div class="flex items-center gap-2 flex-1 cursor-pointer" onclick={() => state.toggleCategory(catIndex)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                 class="w-5 h-5 text-primary transition-transform duration-300"
                                 class:rotate-180={!isExpanded}
                                 aria-hidden="true">
                                {@html icons.chevronDown}
                            </svg>
                            <h2 class="text-lg font-bold text-text-main dark:text-white transition-colors">{element.category}</h2>
                        </div>
                        <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                onclick={(e) => { e.stopPropagation(); state.deleteCategory(catIndex); }}
                                aria-label="Supprimer la catégorie"
                                title="Supprimer la catégorie">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                                {@html icons.trash}
                            </svg>
                        </button>
                    </div>
                    
                    {#if isExpanded}
                        <div class="divide-y divide-secondary dark:divide-gray-700 transition-colors" transition:fade={{ duration: 200 }}>
                            <button class="w-full py-3 bg-secondary/30 dark:bg-gray-700/30 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    onclick={() => state.openAddItemModal(element.category)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                                    {@html icons.plus}
                                </svg>
                                Ajouter un élément
                            </button>

                            {#each element.items as item, itemIndex}
                            <div class="p-4 flex items-center gap-3">
                                <div class="flex-grow flex flex-col min-w-0">
                                    <span class="text-text-main dark:text-white font-medium truncate transition-colors">
                                        {item.item}
                                    </span>
                                </div>

                                <!-- Controls -->
                                <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-lg p-1 transition-colors">
                                    <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                                            onclick={() => state.updateItemQuantity(catIndex, itemIndex, -1)}
                                            aria-label="Diminuer la quantité"
                                            title="Diminuer la quantité">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                                            {@html icons.minus}
                                        </svg>
                                    </button>
                                    <span class="w-8 text-center font-bold text-text-main dark:text-white transition-colors">
                                        {item['wanted-quantity']}
                                    </span>
                                    <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                                            onclick={() => state.updateItemQuantity(catIndex, itemIndex, 1)}
                                            aria-label="Augmenter la quantité"
                                            title="Augmenter la quantité">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                                            {@html icons.plus}
                                        </svg>
                                    </button>
                                </div>

                                <!-- Delete item button -->
                                <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                                        onclick={() => state.deleteItem(catIndex, itemIndex)}
                                        aria-label="Supprimer l'élément"
                                        title="Supprimer l'élément">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                                        {@html icons.trash}
                                    </svg>
                                </button>
                            </div>
                            {/each}
                        </div>
                    {/if}
                </section>
            {/each}
        </main>

        <!-- Footer Menu -->
        <footer class="fixed bottom-0 left-0 right-0 p-4 z-10 pointer-events-none" in:fly={{ y: 50 }}>
            <nav class="bg-primary h-16 flex justify-center items-center px-4 rounded-2xl shadow-xl pointer-events-auto">
                <button class="flex flex-col items-center gap-1 text-text-inverse hover:scale-110 transition-transform active:scale-95 cursor-pointer" 
                        onclick={state.quit} aria-label="Quitter">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7" aria-hidden="true">
                        {@html icons.logout}
                    </svg>
                    <span class="text-[10px] font-bold uppercase tracking-wider">Quitter</span>
                </button>
            </nav>
        </footer>

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

<style>
    :global(body) {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    :global(body::-webkit-scrollbar) {
        display: none;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>