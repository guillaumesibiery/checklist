<script lang="ts">
    import { page } from '$app/state';
    import { createPageState } from './page.svelte.ts';
    import { filterInput } from '$lib/ts/modalInputFilter';
    import { fade, fly, scale } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';
    import ActionButton from '$lib/components/ActionButton.svelte';
    import BottomActionMenu from '$lib/components/BottomActionMenu.svelte';
    import Category from '$lib/components/Category.svelte';
    import ModelItem from '$lib/components/ModelItem.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import Button from '$lib/components/Button.svelte';
    import Input from '$lib/components/Input.svelte';
    import './page.css';

    const state = createPageState(page.params.id as string);
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
            <Button 
                variant="ghost"
                onclick={state.openAddCategoryModal}
                class="w-full border-2 border-dashed border-primary/30 active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                    {@html icons.plus}
                </svg>
                Ajouter une catégorie
            </Button>

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
        <Modal
            isOpen={state.isAddCategoryModalOpen}
            onclose={state.closeAddCategoryModal}
            title="Nouvelle catégorie"
        >
            <div class="space-y-4">
                <Input 
                    id="categoryName"
                    label="Nom de la catégorie"
                    bind:value={state.newCategoryName}
                    oninput={(e) => {
                        const input = e.currentTarget;
                        const filtered = filterInput(input.value);
                        state.newCategoryName = filtered;
                        input.value = filtered;
                    }}
                    placeholder="Ex: Bagages, Accessoires..."
                    error={state.categoryExists ? 'Une catégorie avec ce nom existe déjà' : ''}
                />

                <div class="flex flex-col gap-3 mt-8">
                    <Button 
                        testId="add-model-category"
                        disabled={!state.newCategoryName.trim() || state.categoryExists}
                        onclick={state.addCategory}
                        fullWidth
                    >
                        Ajouter
                    </Button>
                    <Button variant="secondary" onclick={state.closeAddCategoryModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Modal d'ajout d'élément -->
        <Modal
            isOpen={state.isAddItemModalOpen}
            onclose={state.closeAddItemModal}
            title="Nouvel élément"
        >
            <div class="space-y-6">
                <Input 
                    id="itemName"
                    label="Nom de l'élément"
                    bind:value={state.newItemName}
                    oninput={(e) => {
                        const input = e.currentTarget;
                        const filtered = filterInput(input.value);
                        state.newItemName = filtered;
                        input.value = filtered;
                    }}
                    placeholder="Ex: T-shirts, Couches..."
                    error={state.itemExists ? 'Un élément avec ce nom existe déjà' : ''}
                />

                <div>
                    <label for="itemQuantity" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider transition-colors">Quantité par défaut</label>
                    <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-2xl p-1 w-fit transition-colors">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onclick={() => state.newItemQuantity = Math.max(1, state.newItemQuantity - 1)}
                            class="w-10 h-10 p-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                                {@html icons.minus}
                            </svg>
                        </Button>
                        <input type="number" 
                                id="itemQuantity"
                                bind:value={state.newItemQuantity}
                                min="1"
                                class="w-12 text-center bg-transparent border-none focus:ring-0 font-bold text-text-main dark:text-white transition-colors">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onclick={() => state.newItemQuantity = state.newItemQuantity + 1}
                            class="w-10 h-10 p-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                                {@html icons.plus}
                            </svg>
                        </Button>
                    </div>
                </div>

                <div class="flex flex-col gap-3 mt-8">
                    <Button 
                        testId="add-model-item"
                        disabled={!state.newItemName.trim() || state.itemExists}
                        onclick={state.addItem}
                        fullWidth
                    >
                        Ajouter
                    </Button>
                    <Button variant="secondary" onclick={state.closeAddItemModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>
    {:else}
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" in:fade>
            <h1 class="text-2xl font-bold text-red-500">Modèle non trouvé</h1>
            <p class="mt-2 text-text-main/60 dark:text-gray-400 transition-colors">Nous n'avons pas pu charger votre modèle.</p>
            <Button onclick={state.quit} class="mt-8">
                Retour aux modèles
            </Button>
        </div>
    {/if}
</div>