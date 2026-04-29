<script lang="ts">
    import { page } from '$app/state';
    import { createChecklistState } from './page.svelte.ts';
    import { filterInput } from '$lib/modalInputFilter';
    import { fade, fly, scale } from 'svelte/transition';

    const readOnly = page.url.searchParams.get('readOnly') === 'true';
    const state = createChecklistState(page.params.id as string, readOnly);

    // Icônes Heroicons Solid
    const icons = {
        share: `<path fill-rule="evenodd" d="M15.75 4.5a3.75 3.75 0 1 1 .731 2.25l-6.45 3.518a3.75 3.75 0 0 1 0 3.464l6.45 3.518a3.75 3.75 0 1 1-.731 2.25c0-.188.014-.37.04-.548l-6.45-3.518a3.75 3.75 0 1 1 0-4.932l6.45-3.518a3.75 3.75 0 0 1-.04-.548Z" clip-rule="evenodd" />`,
        check: `<path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" /><path fill-rule="evenodd" d="m3.087 9 .54 9.17c.108 1.837 1.631 3.255 3.473 3.255h9.799c1.844 0 3.367-1.42 3.473-3.255l.54-9.17H3.087ZM10 12.25a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" clip-rule="evenodd" />`,
        logout: `<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a0 0 0 0 1 0 0H7.5a0 0 0 0 1 0 0V5.25a0 0 0 0 1 0 0h6a0 0 0 0 1 0 0V8.25a.75.75 0 0 0 1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />`,
        plus: `<path d="M10.75 4.75a.75.75 0 00-1.5 0v5.25H4a.75.75 0 000 1.5h5.25v5.25a.75.75 0 001.5 0v-5.25H16a.75.75 0 000-1.5h-5.25V4.75z" />`,
        minus: `<path d="M5.25 10.75a.75.75 0 0 1 0-1.5h13.5a.75.75 0 0 1 0 1.5H5.25Z" />`,
        chevronDown: `<path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />`,
        whatsapp: `<path d="M17.472 14.382c-.301-.15-1.767-.872-2.04-.971-.272-.1-.47-.15-.665.15-.197.3-.761.97-.933 1.163-.173.193-.346.216-.646.067-.3-.15-1.267-.467-2.414-1.492-.893-.795-1.495-1.777-1.67-2.078-.174-.3-.019-.463.13-.613.136-.134.3-.347.451-.52.15-.174.198-.298.299-.497.101-.199.05-.373-.025-.523-.075-.15-.665-1.603-.91-2.193-.24-.576-.48-.497-.665-.506-.172-.008-.37-.01-.568-.01-.198 0-.522.074-.795.373-.272.3-1.04 1.016-1.04 2.479 0 1.463 1.066 2.875 1.214 3.075.149.199 2.098 3.203 5.084 4.493.71.307 1.264.49 1.695.627.712.226 1.36.194 1.872.118.571-.085 1.767-.721 2.016-1.418.247-.697.247-1.294.173-1.418-.074-.124-.272-.198-.57-.348k.005 6.032m-2.924 1.782h-.011c-1.84 0-3.644-.496-5.216-1.434l-.373-.222-3.877 1.016 1.034-3.778-.244-.388a9.412 9.412 0 0 1-1.442-5.02c0-5.195 4.227-9.423 9.426-9.423 2.517 0 4.883.98 6.66 2.76a9.358 9.358 0 0 1 2.756 6.66c0 5.197-4.225 9.426-9.422 9.426m6.669-16.082A11.282 11.282 0 0 0 12.748 3.1c-6.248 0-11.335 5.087-11.335 11.335 0 2.0.521 3.951 1.512 5.672L1.25 24l4.004-1.05a11.246 11.246 0 0 0 5.49 1.428h.005c6.246 0 11.332-5.088 11.332-11.336a11.24 11.24 0 0 0-3.189-8.017" />`,
        sms: `<path d="M1.5 4.5a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3v-15ZM9 11.25a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM12 11.25a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM15 11.25a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" />`,
        email: `<path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" /><path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />`,
        trash: `<path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Zm4.33.25a.75.75 0 0 0-1.5-.085l-.5 8.5a.75.75 0 0 0 1.5.085l.5-8.5Z" clip-rule="evenodd" />`,
        squaresPlus: `<path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />`,
        eye: `<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clip-rule="evenodd" />`
    };

    function getIcon(name: keyof typeof icons) {
        return icons[name];
    }
</script>

<div class="min-h-screen bg-secondary dark:bg-gray-900 pb-24 transition-colors duration-300">
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
        <header class="fixed top-0 left-0 right-0 bg-header-gradient text-text-inverse p-4 z-10 border-b border-white/20 flex flex-col items-center pt-[calc(1rem+env(safe-area-inset-top))]" in:fly={{ y: -50 }}>
            <h1 class="text-lg font-bold truncate w-full text-center px-8 mb-2">{state.checklist.checklistName}</h1>
            
            <!-- Barre de progression avec % intégré -->
            <div class="w-full max-w-md h-6 bg-white/20 rounded-full relative overflow-hidden transition-colors">
                <!-- Barre de remplissage (blanche) -->
                <div 
                    class="h-full bg-white transition-all duration-500 ease-out" 
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
                <button class="w-full py-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors active:scale-95"
                        onclick={state.openAddCategoryModal}
                        in:fade>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        {@html icons.plus}
                    </svg>
                    Ajouter une catégorie
                </button>
            {/if}

            {#each state.checklist.elements as element, catIndex}
                {@const isExpanded = state.expandedCategories.has(catIndex)}
                <section class="bg-white dark:bg-gray-800 rounded-2xl border border-primary/10 dark:border-gray-700/50 overflow-hidden transition-colors" in:fade={{ delay: catIndex * 100 }}>
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div class="w-full p-4 bg-white dark:bg-gray-800 flex justify-between items-center hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            role="button"
                            tabindex="0"
                            onclick={() => state.toggleCategory(catIndex)}>
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                                 class="w-5 h-5 text-primary transition-transform duration-300"
                                 class:rotate-180={!isExpanded}>
                                {@html icons.chevronDown}
                            </svg>
                            <h2 class="text-lg font-bold text-text-main dark:text-white transition-colors">{element.category}</h2>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {element.progress}%
                            </span>
                            {#if (element.addedByUser === "true" || element.addedByUser === true) && !state.readOnly && state.isEditMode}
                                <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                        onclick={(e) => { e.stopPropagation(); state.deleteCategory(catIndex); }}
                                        aria-label="Supprimer la catégorie">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                        {@html icons.trash}
                                    </svg>
                                </button>
                            {/if}
                        </div>
                    </div>
                    
                    {#if isExpanded}
                        <div class="divide-y divide-secondary dark:divide-gray-700 transition-colors" transition:fade={{ duration: 200 }}>
                            {#if (element.addedByUser === "true" || element.addedByUser === true) && !state.readOnly && state.isEditMode}
                                <button class="w-full py-3 bg-secondary/30 dark:bg-gray-700/30 text-primary text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary/50 dark:hover:bg-gray-700/50 transition-colors"
                                        onclick={() => state.openAddItemModal(element.category)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                                        {@html icons.plus}
                                    </svg>
                                    Ajouter un élément
                                </button>
                            {/if}

                            {#each element.items as item, itemIndex}
                                {@const isDisabled = item.disabled === 'true' || item.disabled === true}
                            <div class="p-4 flex items-center gap-3 transition-opacity duration-300"
                                 class:opacity-40={isDisabled}>
                                
                                <!-- Enable/Disable checkbox -->
                                <input type="checkbox" 
                                       class="w-6 h-6 rounded border-2 border-primary text-primary accent-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all duration-200 disabled:opacity-50" 
                                       checked={!isDisabled}
                                       disabled={state.readOnly}
                                       onchange={() => state.toggleDisabled(catIndex, itemIndex)}>

                                <!-- Item Name & Quantity Info -->
                                <div class="flex-grow flex flex-col min-w-0">
                                    <span class="text-text-main dark:text-white font-medium truncate transition-colors" 
                                          class:line-through={isDisabled}>
                                        {item.item}
                                    </span>
                                    {#if parseInt(item['wanted-quantity'].toString()) > 1}
                                        <span class="text-xs text-text-main/50 dark:text-gray-400 transition-colors" class:line-through={isDisabled}>
                                            Quantité : {item['wanted-quantity']}
                                        </span>
                                    {/if}
                                </div>

                                <!-- Controls -->
                                {#if !isDisabled && !state.readOnly}
                                    <div class="flex items-center gap-2" in:scale>
                                        {#if parseInt(item['wanted-quantity'].toString()) === 1}
                                            <button class="w-12 h-6 rounded-full relative transition-colors duration-300 cursor-pointer"
                                                    class:bg-primary={parseInt(item['added-quantity'].toString()) === 1}
                                                    class:bg-secondary={parseInt(item['added-quantity'].toString()) === 0}
                                                    class:dark:bg-gray-700={parseInt(item['added-quantity'].toString()) === 0}
                                                    onclick={() => state.toggleItem(catIndex, itemIndex)}
                                                    aria-label="Cocher l'élément">
                                                <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm"
                                                     class:translate-x-6={parseInt(item['added-quantity'].toString()) === 1}>
                                                </div>
                                            </button>
                                        {:else}
                                            <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-lg p-1 transition-colors">
                                                <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                                                        onclick={() => state.updateQuantity(catIndex, itemIndex, -1)}
                                                        aria-label="Diminuer la quantité">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
                                                        {@html icons.minus}
                                                    </svg>
                                                </button>
                                                <span class="w-8 text-center font-bold text-text-main dark:text-white transition-colors">
                                                    {item['added-quantity']}
                                                </span>
                                                <button class="w-8 h-8 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all cursor-pointer"
                                                        onclick={() => state.updateQuantity(catIndex, itemIndex, 1)}
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
                                {#if (item.addedByUser === "true" || item.addedByUser === true) && !state.readOnly && state.isEditMode}
                                    <button class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                                            onclick={() => state.deleteItem(catIndex, itemIndex)}
                                            aria-label="Supprimer l'élément">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                                            {@html icons.trash}
                                        </svg>
                                    </button>
                                {/if}
                            </div>
                            {/each}
                        </div>
                    {/if}
                </section>
            {/each}
        </main>

        <!-- Footer Menu -->
        <footer class="fixed bottom-0 left-0 right-0 p-4 z-10 pointer-events-none" in:fly={{ y: 50 }}>
            <nav class="bg-primary h-16 flex justify-around items-center px-4 rounded-2xl shadow-xl pointer-events-auto">
                {#if !state.readOnly}
                    <button class="flex flex-col items-center gap-1 text-text-inverse hover:scale-110 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                            onclick={state.openShareModal} 
                            disabled={state.isEditMode}
                            aria-label="Partager">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                            {@html icons.share}
                        </svg>
                        <span class="text-[10px] font-bold uppercase tracking-wider">Partager</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 text-text-inverse hover:scale-110 transition-transform active:scale-95 cursor-pointer" 
                            onclick={state.toggleEditMode} 
                            data-testid="checklist-edit-mode"
                            aria-label="Modifier">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                            {@html state.isEditMode ? icons.eye : icons.squaresPlus}
                        </svg>
                        <span class="text-[10px] font-bold uppercase tracking-wider">{state.isEditMode ? 'Consulter' : 'Modifier'}</span>
                    </button>
                    <button class="flex flex-col items-center gap-1 text-text-inverse hover:scale-110 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                            onclick={state.openFinalizeModal} 
                            disabled={state.isEditMode}
                            aria-label="Archiver">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                            {@html icons.check}
                        </svg>
                        <span class="text-[10px] font-bold uppercase tracking-wider">Archiver</span>
                    </button>
                {/if}
                <button class="flex flex-col items-center gap-1 text-text-inverse hover:scale-110 transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                        onclick={state.quit} 
                        disabled={!state.readOnly && state.isEditMode}
                        aria-label="Quitter">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                        {@html icons.logout}
                    </svg>
                    <span class="text-[10px] font-bold uppercase tracking-wider">{state.readOnly ? 'Retour' : 'Quitter'}</span>
                </button>
            </nav>
        </footer>

        <!-- Modal de confirmation de finalisation -->
        {#if state.isFinalizeModalOpen}
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     role="dialog"
                     aria-modal="true">
                    <div class="p-8 text-center">
                        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary">
                                {@html icons.check}
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-4 transition-colors">Archiver la checklist ?</h2>
                        
                        {#if state.checklist.progress !== '100'}
                            <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 transition-colors">
                                Attention : votre checklist n'est pas encore terminée (<span class="text-primary font-bold">{state.checklist.progress}%</span>). Voulez-vous tout de même l'archiver ?
                            </p>
                        {:else}
                            <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 transition-colors">
                                Félicitations ! Votre checklist est terminée à <span class="text-primary font-bold">100%</span>. Voulez-vous la classer dans l'historique ?
                            </p>
                        {/if}

                        <div class="flex flex-col gap-3">
                            <button class="w-full py-4 bg-primary text-text-inverse rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                                    onclick={state.finalize}>
                                Valider
                            </button>
                            <button class="w-full py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform transition-colors"
                                    onclick={state.closeFinalizeModal}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Modal de confirmation de partage -->
        {#if state.isShareModalOpen}
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     role="dialog"
                     aria-modal="true">
                    <div class="p-8 text-center">
                        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-primary">
                                {@html icons.share}
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-4 transition-colors">Partager les éléments manquants ?</h2>
                        <p class="text-text-main/60 dark:text-gray-400 mb-8 px-4 transition-colors">
                            Souhaitez-vous partager la liste des éléments dont la quantité n'est pas encore atteinte ?
                        </p>

                        <div class="flex flex-col gap-3">
                            <button class="w-full py-4 bg-primary text-text-inverse rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                                    onclick={state.openShareOptionsModal}>
                                Valider
                            </button>
                            <button class="w-full py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform transition-colors"
                                    onclick={state.closeShareModal}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Modal d'options de partage -->
        {#if state.isShareOptionsModalOpen}
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     role="dialog"
                     aria-modal="true">
                    <div class="p-8">
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-6 text-center transition-colors">Partager via...</h2>
                        
                        <div class="grid gap-4" class:grid-cols-1={!state.isMobile} class:grid-cols-3={state.isMobile}>
                            {#if state.isMobile}
                                <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group"
                                        onclick={state.shareViaWhatsApp}>
                                    <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                            {@html icons.whatsapp}
                                        </svg>
                                    </div>
                                    <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">WhatsApp</span>
                                </button>

                                <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group"
                                        onclick={state.shareViaSMS}>
                                    <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                            {@html icons.sms}
                                        </svg>
                                    </div>
                                    <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">SMS</span>
                                </button>
                            {/if}

                            <button class="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary dark:hover:bg-gray-700 transition-colors group"
                                    onclick={state.shareViaEmail}>
                                <div class="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center group-active:scale-90 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                        {@html icons.email}
                                    </svg>
                                </div>
                                <span class="text-[10px] font-bold text-text-main dark:text-gray-300 uppercase tracking-tighter transition-colors">Email</span>
                            </button>
                        </div>

                        <button class="w-full mt-8 py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform transition-colors"
                                onclick={state.closeShareOptionsModal}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Modal d'ajout de catégorie -->
        {#if state.isAddCategoryModalOpen}
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     role="dialog"
                     aria-modal="true">
                    <div class="p-8">
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-6 text-center transition-colors">Nouvelle catégorie</h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="categoryName" class="block text-sm font-medium text-text-main/60 dark:text-gray-400 mb-1 ml-1 transition-colors">Nom de la catégorie</label>
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
                                       onkeydown={(e) => e.key === 'Enter' && state.newCategoryName.trim() && !state.categoryExists && state.addCategory()}
                                       autofocus>
                                {#if state.categoryExists}
                                    <p class="mt-2 text-xs text-red-500 ml-1" transition:fade>
                                        Une catégorie avec ce nom existe déjà
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 mt-8">
                            <button data-testid="add-checklist-category" class="w-full py-4 bg-primary text-text-inverse rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50"
                                    disabled={!state.newCategoryName.trim() || state.categoryExists}
                                    onclick={state.addCategory}>
                                Ajouter
                            </button>
                            <button class="w-full py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform transition-colors"
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
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                 transition:fade={{ duration: 200 }}>
                <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-300"
                     transition:scale={{ duration: 300, start: 0.9 }}
                     role="dialog"
                     aria-modal="true">
                    <div class="p-8">
                        <h2 class="text-2xl font-bold text-text-main dark:text-white mb-6 text-center transition-colors">Nouvel élément</h2>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="itemName" class="block text-sm font-medium text-text-main/60 dark:text-gray-400 mb-1 ml-1 transition-colors">Nom de l'élément</label>
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
                                       onkeydown={(e) => e.key === 'Enter' && state.newItemName.trim() && !state.itemExists && state.addItem()}
                                       autofocus>
                                {#if state.itemExists}
                                    <p class="mt-2 text-xs text-red-500 ml-1" transition:fade>
                                        Un élément avec ce nom existe déjà
                                    </p>
                                {/if}
                            </div>

                            <div>
                                <label for="itemQuantity" class="block text-sm font-medium text-text-main/60 dark:text-gray-400 mb-1 ml-1 transition-colors">Quantité attendue</label>
                                <div class="flex items-center bg-secondary dark:bg-gray-700 rounded-xl p-1 w-fit transition-colors">
                                    <button class="w-10 h-10 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all"
                                            onclick={() => state.newItemQuantity = Math.max(1, state.newItemQuantity - 1)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                            {@html icons.minus}
                                        </svg>
                                    </button>
                                    <input type="number" 
                                           id="itemQuantity"
                                           bind:value={state.newItemQuantity}
                                           min="1"
                                           class="w-12 text-center bg-transparent border-none focus:ring-0 font-bold text-text-main dark:text-white transition-colors">
                                    <button class="w-10 h-10 flex items-center justify-center text-text-main dark:text-white hover:text-primary active:scale-95 transition-all"
                                            onclick={() => state.newItemQuantity = state.newItemQuantity + 1}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                            {@html icons.plus}
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 mt-8">
                            <button data-testid="add-checklist-item" class="w-full py-4 bg-primary text-text-inverse rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50"
                                    disabled={!state.newItemName.trim() || state.itemExists}
                                    onclick={state.addItem}>
                                Ajouter
                            </button>
                            <button class="w-full py-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform transition-colors"
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
            <h1 class="text-2xl font-bold text-red-500">Checklist non trouvée</h1>
            <p class="mt-2 text-text-main/60 dark:text-gray-400 transition-colors">Nous n'avons pas pu charger votre checklist.</p>
            <button onclick={state.quit} class="mt-8 px-6 py-3 bg-header-gradient text-text-inverse rounded-xl font-bold active:scale-95 transition-transform">
                Retour à l'accueil
            </button>
        </div>
    {/if}
</div>

<style>
    /* Optionnel: masquer la scrollbar mais garder le scroll */
    :global(body) {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    :global(body::-webkit-scrollbar) {
        display: none;
    }

    /* Supprimer les flèches par défaut des champs nombre */
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