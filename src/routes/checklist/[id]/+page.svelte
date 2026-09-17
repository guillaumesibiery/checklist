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
    const pageState = createPageState(page.params.id as string, readOnly);

    let previousProgress = $state<number | undefined>(undefined);

    $effect(() => {
        if (pageState.checklist) {
            const currentProgress = pageState.checklist.progress;
            if (currentProgress === 100 && previousProgress !== undefined && previousProgress !== 100) {
                // Délai pour laisser les animations visuelles se terminer
                setTimeout(() => {
                    if (!pageState.isFinalizeModalOpen) {
                        pageState.openFinalizeModal();
                    }
                }, 800);
            }
            previousProgress = currentProgress;
        }
    });

    function getIcon(name: keyof typeof icons) {
        return icons[name];
    }
</script>

<div class="min-h-screen bg-secondary dark:bg-[#05010d] pb-24 transition-colors duration-300">
    {#if pageState.loading}
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
    {:else if pageState.checklist}
        <!-- Header -->
        <header class="fixed top-0 left-0 right-0 bg-primary text-text-inverse p-4 z-10 flex flex-col items-center pt-[calc(1rem+env(safe-area-inset-top))]" in:fly={{ y: -50 }}>
            <h1 class="text-lg font-bold truncate w-full text-center px-8 mb-2">{pageState.checklist.checklistName}</h1>
            
            <!-- Barre de progression avec % intégré -->
            <div class="w-full max-w-md h-6 bg-white/20 rounded-full relative overflow-hidden transition-colors">
                <!-- Barre de remplissage (blanche) -->
                <div 
                    class="h-full bg-white rounded-full transition-all duration-500 ease-out" 
                    style="width: {pageState.checklist.progress}%"
                ></div>
                
                <!-- Texte en blanc (par défaut sur le fond transparent) -->
                <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                    {pageState.checklist.progress}%
                </div>
                
                <!-- Texte en couleur primaire (révélé par la barre blanche via clip-path) -->
                <div 
                    class="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary transition-all duration-500" 
                    style="clip-path: inset(0 {100 - Number(pageState.checklist.progress)}% 0 0)"
                >
                    {pageState.checklist.progress}%
                </div>
            </div>
        </header>

        <!-- Content -->
        <main class="pt-28 px-4 space-y-6">
            {#if !pageState.readOnly && pageState.isEditMode}
                <Button 
                    variant="ghost"
                    onclick={pageState.openAddCategoryModal}
                    class="w-full border-2 border-dashed border-primary/30 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        {@html icons.plus}
                    </svg>
                    Ajouter une catégorie
                </Button>
            {/if}

            {#each pageState.checklist.elements as element, catIndex}
                <Category 
                    title={element.category}
                    progress={element.progress}
                    isExpanded={pageState.expandedCategories.has(catIndex)}
                    canDelete={!pageState.readOnly && pageState.isEditMode}
                    showAddButton={!pageState.readOnly && pageState.isEditMode}
                    ontoggle={() => pageState.toggleCategory(catIndex)}
                    ondelete={() => pageState.deleteCategory(catIndex)}
                    onadditem={() => pageState.openAddItemModal(element.category)}
                    oneditcategory={() => pageState.openEditCategoryModal(catIndex)}
                >
                    {#each element.items as item, itemIndex}
                        <ChecklistItem 
                            {item}
                            readOnly={pageState.readOnly}
                            isEditMode={pageState.isEditMode}
                            ontoggleDisabled={() => pageState.toggleDisabled(catIndex, itemIndex)}
                            ontoggleItem={() => pageState.toggleItem(catIndex, itemIndex)}
                            onupdateQuantity={(delta) => pageState.updateQuantity(catIndex, itemIndex, delta)}
                            ondeleteItem={() => pageState.deleteItem(catIndex, itemIndex)}
                            oneditItem={() => pageState.openEditItemModal(element.category, itemIndex)}
                        />
                    {/each}
                </Category>
            {/each}
        </main>

        <!-- Footer Menu -->
        <BottomActionMenu>
            {#if !pageState.readOnly}
                <ActionButton 
                    onclick={pageState.openShareModal} 
                    disabled={pageState.isEditMode}
                    icon={icons.share}
                    label="Partager"
                />
                <ActionButton 
                    onclick={pageState.toggleEditMode} 
                    testId="checklist-edit-mode"
                    icon={pageState.isEditMode ? icons.eye : icons.squaresPlus}
                    label={pageState.isEditMode ? 'Consulter' : 'Modifier'}
                    ariaLabel="Modifier"
                />
                <ActionButton 
                    onclick={pageState.openFinalizeModal} 
                    disabled={pageState.isEditMode}
                    icon={icons.archive}
                    label="Archiver"
                />
            {/if}
            <ActionButton 
                onclick={pageState.quit} 
                disabled={!pageState.readOnly && pageState.isEditMode}
                icon={icons.logout}
                label={pageState.readOnly ? 'Retour' : 'Quitter'}
            />
        </BottomActionMenu>

        <!-- Modal de confirmation de finalisation -->
        <Modal
            isOpen={pageState.isFinalizeModalOpen}
            onclose={pageState.closeFinalizeModal}
            title="Archiver la checklist ?"
        >
            <div class="flex flex-col items-center">
                <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary">
                        {@html icons.archive}
                    </svg>
                </div>
                
                {#if pageState.checklist.progress !== 100}
                    <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 text-center transition-colors">
                        Attention : votre checklist n'est pas encore terminée (<span class="text-primary font-bold">{pageState.checklist.progress}%</span>). Voulez-vous tout de même l'archiver ?
                    </p>
                {:else}
                    <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 text-center transition-colors">
                        Félicitations ! Votre checklist est terminée à <span class="text-primary font-bold">100%</span>. Voulez-vous la classer dans l'historique ?
                    </p>
                {/if}

                <div class="flex flex-col gap-3 w-full">
                    <Button onclick={pageState.finalize} fullWidth>
                        Valider
                    </Button>
                    <Button variant="secondary" onclick={pageState.closeFinalizeModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Modal de choix de partage -->
        <Modal
            isOpen={pageState.isShareModalOpen}
            onclose={pageState.closeShareModal}
            title="Comment partager ?"
        >
            <div class="flex flex-col gap-4">
                <button class="flex items-center gap-4 p-4 bg-secondary dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl transition-colors group cursor-pointer text-left"
                        onclick={() => { pageState.closeShareModal(); pageState.shareNative(); }}>
                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 group-active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                            {@html icons.share}
                        </svg>
                    </div>
                    <div>
                        <div class="font-bold text-text-main dark:text-white">Vers une autre application Checklist</div>
                        <div class="text-xs text-text-main/60 dark:text-gray-400 mt-1">Génère un lien d'importation pour une application Checklist</div>
                    </div>
                </button>

                <button class="flex items-center gap-4 p-4 bg-secondary dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl transition-colors group cursor-pointer text-left"
                        onclick={pageState.shareViaEmail}>
                    <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 group-active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                            {@html icons.email}
                        </svg>
                    </div>
                    <div>
                        <div class="font-bold text-text-main dark:text-white">En clair via Email</div>
                        <div class="text-xs text-text-main/60 dark:text-gray-400 mt-1">Envoie le contenu au format texte</div>
                    </div>
                </button>

                {#if pageState.isMobile}
                    <button class="flex items-center gap-4 p-4 bg-secondary dark:bg-gray-700 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl transition-colors group cursor-pointer text-left"
                            onclick={pageState.shareViaSMS}>
                        <div class="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 group-active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                {@html icons.sms}
                            </svg>
                        </div>
                        <div>
                            <div class="font-bold text-text-main dark:text-white">En clair via SMS</div>
                            <div class="text-xs text-text-main/60 dark:text-gray-400 mt-1">Envoie le contenu au format texte</div>
                        </div>
                    </button>
                {/if}

                <div class="mt-4">
                    <Button variant="secondary" onclick={pageState.closeShareModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <Modal
            isOpen={pageState.isShareOptionsModalOpen}
            onclose={pageState.closeShareOptionsModal}
            title="Partager via..."
        >
            <div class="grid gap-4" class:grid-cols-2={!pageState.isMobile} class:grid-cols-3={pageState.isMobile}>
                <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                        onclick={pageState.shareViaCopy}>
                    <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            {@html icons.copy}
                        </svg>
                    </div>
                    <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">Copier</span>
                </button>

                {#if pageState.isMobile}
                    <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                            onclick={pageState.shareViaWhatsApp}>
                        <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                {@html icons.whatsapp}
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">WhatsApp</span>
                    </button>

                    <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                            onclick={pageState.shareViaSMS}>
                        <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                {@html icons.sms}
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">SMS</span>
                    </button>
                {/if}

                <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group cursor-pointer"
                        onclick={pageState.shareViaEmail}>
                    <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            {@html icons.email}
                        </svg>
                    </div>
                    <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">Email</span>
                </button>
            </div>

            <div class="mt-8">
                <Button variant="secondary" onclick={pageState.closeShareOptionsModal} fullWidth>
                    Fermer
                </Button>
            </div>
        </Modal>

        <!-- Modal d'ajout de catégorie -->
        <Modal
            isOpen={pageState.isAddCategoryModalOpen}
            onclose={pageState.closeAddCategoryModal}
            title="Nouvelle catégorie"
        >
            <div class="space-y-4">
                <Input 
                    id="categoryName"
                    label="Nom de la catégorie"
                    bind:value={pageState.newCategoryName}
                    oninput={(e) => {
                        const input = e.currentTarget;
                        const filtered = filterInput(input.value);
                        pageState.newCategoryName = filtered;
                        input.value = filtered;
                    }}
                    placeholder="Ex: Bagages, Accessoires..."
                    error={pageState.categoryExists ? 'Une catégorie avec ce nom existe déjà' : ''}
                    autofocus
                />

                <div class="flex flex-col gap-3 mt-8">
                    <Button 
                        testId="add-checklist-category"
                        disabled={!pageState.newCategoryName.trim() || pageState.categoryExists}
                        onclick={pageState.addCategory}
                        fullWidth
                    >
                        Ajouter
                    </Button>
                    <Button variant="secondary" onclick={pageState.closeAddCategoryModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Modal de renommage de catégorie -->
        <Modal
            isOpen={pageState.isEditCategoryModalOpen}
            onclose={pageState.closeEditCategoryModal}
            title="Renommer la catégorie"
        >
            <div class="space-y-4">
                <Input 
                    id="editCategoryName"
                    label="Nouveau nom"
                    bind:value={pageState.editCategoryName}
                    oninput={(e) => {
                        const input = e.currentTarget;
                        const filtered = filterInput(input.value);
                        pageState.editCategoryName = filtered;
                        input.value = filtered;
                    }}
                    placeholder="Ex: Bagages, Accessoires..."
                    error={pageState.editCategoryExists ? 'Une catégorie avec ce nom existe déjà' : ''}
                    autofocus
                />

                <div class="flex flex-col gap-3 mt-8">
                    <Button 
                        testId="rename-checklist-category"
                        disabled={!pageState.editCategoryName.trim() || pageState.editCategoryExists || pageState.editCategoryUnchanged}
                        onclick={pageState.renameCategory}
                        fullWidth
                    >
                        Renommer
                    </Button>
                    <Button variant="secondary" onclick={pageState.closeEditCategoryModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- Modal d'ajout d'élément -->
        <Modal
            isOpen={pageState.isAddItemModalOpen}
            onclose={pageState.closeAddItemModal}
            title={pageState.isEditingItem ? "Modifier l'élément" : "Nouvel élément"}
        >
            <div class="space-y-6">
                <Input 
                    id="itemName"
                    label="Nom de l'élément"
                    bind:value={pageState.newItemName}
                    oninput={(e) => {
                        const input = e.currentTarget;
                        const filtered = filterInput(input.value);
                        pageState.newItemName = filtered;
                        input.value = filtered;
                    }}
                    placeholder="Ex: T-shirts, Couches..."
                    error={pageState.itemExists ? 'Un élément avec ce nom existe déjà' : ''}
                    autofocus
                />

                <div>
                    <label for="itemQuantity" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Quantité attendue</label>
                    <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-2xl p-1 w-fit transition-colors">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onclick={() => pageState.newItemQuantity = Math.max(1, pageState.newItemQuantity - 1)}
                            class="w-10 h-10 p-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                {@html icons.minus}
                            </svg>
                        </Button>
                        <input type="number" 
                                id="itemQuantity"
                                bind:value={pageState.newItemQuantity}
                                min="1"
                                class="w-12 text-center bg-transparent border-none focus:ring-0 font-bold text-text-main dark:text-white transition-colors">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onclick={() => pageState.newItemQuantity = pageState.newItemQuantity + 1}
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
                        disabled={!pageState.newItemName.trim() || pageState.itemExists}
                        onclick={pageState.addItem}
                        fullWidth
                    >
                        {pageState.isEditingItem ? "Enregistrer" : "Ajouter"}
                    </Button>
                    <Button variant="secondary" onclick={pageState.closeAddItemModal} fullWidth>
                        Annuler
                    </Button>
                </div>
            </div>
        </Modal>
    {:else}
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" in:fade>
            <h1 class="text-2xl font-bold text-red-500">Checklist non trouvée</h1>
            <p class="mt-2 text-text-main/60 dark:text-gray-400 transition-colors">Nous n'avons pas pu charger votre checklist.</p>
            <Button onclick={pageState.quit} class="mt-8">
                Retour à l'accueil
            </Button>
        </div>
    {/if}
</div>