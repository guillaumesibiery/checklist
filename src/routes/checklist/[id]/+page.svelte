<script lang="ts">
    import { page } from '$app/state';
    import { createPageState } from './page.svelte.ts';
    import { filterInput } from '$lib/ts/modalInputFilter';
    import { fade, fly, scale } from 'svelte/transition';
    import { icons } from '$lib/ts/icons';
    import ActionButton from '$lib/components/ActionButton.svelte';
    import BottomActionMenu from '$lib/components/BottomActionMenu.svelte';
    import Category from '$lib/components/Category.svelte';
    import ChecklistItem from '$lib/components/ChecklistItem.svelte';
    import Modal from '$lib/components/Modal.svelte';
    import Button from '$lib/components/Button.svelte';
    import Input from '$lib/components/Input.svelte';
    import './page.css';

    const readOnly = page.url.searchParams.get('readOnly') === 'true';
    const state = createPageState(page.params.id as string, readOnly);

    function getIcon(name: keyof typeof icons) {
        return icons[name];
    }
</script>

<div class="min-h-screen bg-secondary dark:bg-[#05010d] pb-24 transition-colors duration-300">
    {#if state.loading}
        <div class="fixed top-0 left-0 right-0 h-24 bg-primary p-4 z-10 shadow-lg flex flex-col justify-end">
            <div class="animate-pulse h-6 bg-white/20 rounded w-1/2 mb-4"></div>
            <div class="animate-pulse h-2 bg-white/20 rounded w-full"></div>
        </div>
        <div class="pt-28 px-4 space-y-6">
            {#each Array(3) as _}
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-primary/10 dark:border-gray-700/50 animate-pulse transition-colors">
                    <div class="h-6 bg-secondary dark:bg-gray-700 rounded w-1/3 mb-4 transition-colors"></div>
                    {#each Array(4) as _}
                        <div class="h-12 bg-secondary dark:bg-gray-700 rounded w-full mt-2 transition-colors"></div>
                    {/each}
                </div>
            {/each}
        </div>
    {:else if state.checklist}
        <!-- Header -->
        <header class="fixed top-0 left-0 right-0 bg-primary text-text-inverse p-4 z-10 flex flex-col items-center pt-[calc(1rem+env(safe-area-inset-top))]" in:fly={{ y: -50 }}>
            <h1 class="text-lg font-bold truncate w-full text-center px-8 mb-2">{state.checklist.checklistName}</h1>
            
            <!-- Barre de progression avec % intégré -->
            <div class="w-full max-w-md h-6 bg-white/20 rounded-full relative overflow-hidden transition-colors">
                <!-- Barre de remplissage (blanche) -->
                <div 
                    class="h-full bg-white rounded-full transition-all duration-500 ease-out" 
                    style="width: {state.checklist.progress}%"
                ></div>
                
                <!-- Texte en blanc (par défaut sur le fond transparent) -->
                <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                    {state.checklist.progress}%
                </div>
                
                <!-- Texte en couleur primaire (révélé par la barre blanche via clip-path) -->
                <div 
                    class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary transition-all duration-500" 
                    style="clip-path: inset(0 {100 - Number(state.checklist.progress)}% 0 0)"
                >
                    {state.checklist.progress}%
                </div>
            </div>
        </header>

        <!-- Content -->
        <main class="pt-28 px-4 space-y-6">
            {#if !state.readOnly && state.isEditMode}
                <Button 
                    variant="ghost"
                    onclick={state.openAddCategoryModal}
                    class="w-full border-2 border-dashed border-primary/30 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        {@html icons.plus}
                    </svg>
                    Ajouter une catégorie
                </Button>
            {/if}

            {#each state.checklist.elements as element, catIndex}
                <Category 
                    title={element.category}
                    progress={element.progress}
                    isExpanded={state.expandedCategories.has(catIndex)}
                    canDelete={(element.addedByUser === "true" || element.addedByUser === true) && !state.readOnly && state.isEditMode}
                    showAddButton={!state.readOnly && state.isEditMode}
                    ontoggle={() => state.toggleCategory(catIndex)}
                    ondelete={() => state.deleteCategory(catIndex)}
                    onadditem={() => state.openAddItemModal(element.category)}
                >
                    {#each element.items as item, itemIndex}
                        <ChecklistItem 
                            {item}
                            readOnly={state.readOnly}
                            isEditMode={state.isEditMode}
                            ontoggleDisabled={() => state.toggleDisabled(catIndex, itemIndex)}
                            ontoggleItem={() => state.toggleItem(catIndex, itemIndex)}
                            onupdateQuantity={(delta) => state.updateQuantity(catIndex, itemIndex, delta)}
                            ondeleteItem={() => state.deleteItem(catIndex, itemIndex)}
                            oneditItem={() => state.openEditItemModal(element.category, itemIndex)}
                        />
                    {/each}
                </Category>
            {/each}
        </main>

        <!-- Footer Menu -->
        <BottomActionMenu>
            {#if !state.readOnly}
                <ActionButton 
                    onclick={state.shareNative} 
                    disabled={state.isEditMode}
                    icon={icons.share}
                    label="Partager"
                />
                <ActionButton 
                    onclick={state.toggleEditMode} 
                    testId="checklist-edit-mode"
                    icon={state.isEditMode ? icons.eye : icons.squaresPlus}
                    label={state.isEditMode ? 'Consulter' : 'Modifier'}
                    ariaLabel="Modifier"
                />
                <ActionButton 
                    onclick={state.openFinalizeModal} 
                    disabled={state.isEditMode}
                    icon={icons.archive}
                    label="Archiver"
                />
            {/if}
            <ActionButton 
                onclick={state.quit} 
                disabled={!state.readOnly && state.isEditMode}
                icon={icons.logout}
                label={state.readOnly ? 'Retour' : 'Quitter'}
            />
        </BottomActionMenu>

        <!-- Modal de confirmation de finalisation -->
        <Modal
            isOpen={state.isFinalizeModalOpen}
            onclose={state.closeFinalizeModal}
            title="Archiver la checklist ?"
        >
            <div class="flex flex-col items-center">
                <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary">
                        {@html icons.archive}
                    </svg>
                </div>
                
                {#if state.checklist.progress !== 100}
                    <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 text-center transition-colors">
                        Attention : votre checklist n'est pas encore terminée (<span class="text-primary font-bold">{state.checklist.progress}%</span>). Voulez-vous tout de même l'archiver ?
                    </p>
                {:else}
                    <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 text-center transition-colors">
                        Félicitations ! Votre checklist est terminée à <span class="text-primary font-bold">100%</span>. Voulez-vous la classer dans l'historique ?
                    </p>
                {/if}

                <div class="flex flex-col gap-3 w-full">
                    <Button onclick={state.finalize} fullWidth>
                        Valider
                    </Button>
                    <Button variant="secondary" onclick={state.closeFinalizeModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Modal de confirmation de partage -->
        <Modal
            isOpen={state.isShareModalOpen}
            onclose={state.closeShareModal}
            title="Partager la checklist ?"
        >
            <div class="flex flex-col items-center">
                <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary">
                        {@html icons.share}
                    </svg>
                </div>
                <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 text-center transition-colors">
                    Souhaitez-vous partager la checklist ?
                </p>

                <div class="flex flex-col gap-3 w-full">
                    <Button onclick={state.openShareOptionsModal} fullWidth>
                        Valider
                    </Button>
                    <Button variant="secondary" onclick={state.closeShareModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <Modal
            isOpen={state.isShareOptionsModalOpen}
            onclose={state.closeShareOptionsModal}
            title="Partager via..."
        >
            <div class="grid gap-4" class:grid-cols-2={!state.isMobile} class:grid-cols-3={state.isMobile}>
                <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                        onclick={state.shareViaCopy}>
                    <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            {@html icons.copy}
                        </svg>
                    </div>
                    <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">Copier</span>
                </button>

                {#if state.isMobile}
                    <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                            onclick={state.shareViaWhatsApp}>
                        <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                {@html icons.whatsapp}
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">WhatsApp</span>
                    </button>

                    <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                            onclick={state.shareViaSMS}>
                        <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                {@html icons.sms}
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">SMS</span>
                    </button>
                {/if}

                <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                        onclick={state.shareViaEmail}>
                    <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            {@html icons.email}
                        </svg>
                    </div>
                    <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">Email</span>
                </button>
            </div>

            <div class="mt-8">
                <Button variant="secondary" onclick={state.closeShareOptionsModal} fullWidth>
                    Fermer
                </Button>
            </div>
        </Modal>

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
                    autofocus
                />

                <div class="flex flex-col gap-3 mt-8">
                    <Button 
                        testId="add-checklist-category"
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
            title={state.isEditingItem ? "Modifier l'élément" : "Nouvel élément"}
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
                    autofocus
                />

                <div>
                    <label for="itemQuantity" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Quantité attendue</label>
                    <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-2xl p-1 w-fit transition-colors">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onclick={() => state.newItemQuantity = Math.max(1, state.newItemQuantity - 1)}
                            class="w-10 h-10 p-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                {@html icons.plus}
                            </svg>
                        </Button>
                    </div>
                </div>

                <div class="flex flex-col gap-3 mt-8">
                    <Button 
                        testId="add-checklist-item"
                        disabled={!state.newItemName.trim() || state.itemExists}
                        onclick={state.addItem}
                        fullWidth
                    >
                        {state.isEditingItem ? "Enregistrer" : "Ajouter"}
                    </Button>
                    <Button variant="secondary" onclick={state.closeAddItemModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>
    {:else}
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" in:fade>
            <h1 class="text-2xl font-bold text-red-500">Checklist non trouvée</h1>
            <p class="mt-2 text-text-main/60 dark:text-gray-400 transition-colors">Nous n'avons pas pu charger votre checklist.</p>
            <Button onclick={state.quit} class="mt-8">
                Retour à l'accueil
            </Button>
        </div>
    {/if}
</div>