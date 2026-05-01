<script lang="ts">
    import { createPageState } from './page.svelte.ts';
    import { fade, scale } from 'svelte/transition';
    import { filterInput } from '$lib/ts/modalInputFilter';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { formatDate } from '$lib/ts/date';

    const state = createPageState();

    onMount(async () => {
        await state.loadModels();
    });

</script>

<div in:fade={{ duration: 300 }} class="p-6 transition-colors duration-300">
    <div class="mb-4">
        <h2 class="text-lg font-bold text-text-main dark:text-white uppercase tracking-wider text-sm opacity-60 transition-colors">Modèles de checklist</h2>
        
        {#if !state.isLoadingModels && state.models.length > 0}
            <button class="w-full py-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors active:scale-95 cursor-pointer"
                    onclick={state.toggleCreateModal}
                    in:fade>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v5.25H4a.75.75 0 000 1.5h5.25v5.25a.75.75 0 001.5 0v-5.25H16a.75.75 0 000-1.5h-5.25V4.75z" />
                </svg>
                Créer un modèle
            </button>
        {/if}
    </div>
    
    {#if state.isLoadingModels}
        <div class="space-y-4">
            {#each Array(3) as _}
                <div class="h-24 bg-secondary dark:bg-gray-800 rounded-[2rem] animate-pulse transition-colors"></div>
            {/each}
        </div>
    {:else if state.models.length > 0}
        <div class="grid gap-4">
            {#each state.models as model}
                <div class="group relative overflow-hidden bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-[2rem] hover:bg-primary/10 dark:hover:bg-primary/20 transition-all active:scale-[0.98]">
                    <a href="{base}/modeles/{model.modelId}/" class="block px-6 pt-5 pb-1">
                        <!-- Nom du modèle -->
                        <h3 class="font-bold text-xl text-text-main dark:text-white mb-1 transition-colors">
                            {model.modelName}
                        </h3>
                    </a>

                    <!-- Ligne du bas : Dates et Boutons d'action -->
                    <div class="flex items-center justify-between px-6 pb-6 mt-0">                        <!-- Dates (style badge) -->
                        <div class="flex flex-col gap-1.5">
                            <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-primary/10 dark:border-primary/20 inline-flex items-center gap-1.5 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                    <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.75c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V8.75c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
                                </svg>
                                Créé le {formatDate(model.modelCreationDate)}
                            </span>
                            <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold border border-primary/10 dark:border-primary/20 inline-flex items-center gap-1.5 w-fit">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                                    <path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-5.038a7 7 0 0 0-11.712 3.138.75.75 0 0 0 1.449.39 5.5 5.5 0 0 1 9.201-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .75-.75V3.367a.75.75 0 0 0-1.5 0v2.431l-.31-.31Z" clip-rule="evenodd" />
                                </svg>
                                Modifié le {formatDate(model.modelLastModifiedDate)}
                            </span>
                        </div>

                        <!-- Boutons d'action -->
                        <div class="flex items-center gap-2">
                            <button 
                                onclick={(e) => { e.preventDefault(); state.confirmDelete(model); }}
                                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all cursor-pointer"
                                title="Supprimer le modèle"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                    <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <div class="flex flex-col items-center justify-center py-12 px-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-[2rem] transition-colors">
            <div class="p-4 bg-primary/10 dark:bg-primary/20 rounded-full mb-4 transition-colors">                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-primary opacity-40">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium text-center transition-colors">Aucun modèle de checklist pour le moment.</p>
            <button 
                onclick={state.toggleCreateModal}
                class="mt-6 px-6 py-3 bg-primary text-text-inverse font-bold rounded-2xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
                Créer un modèle
            </button>
        </div>
    {/if}
</div>

<!-- Modal de création de modèle -->
{#if state.showCreateModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={state.toggleCreateModal}
    >
        <div 
            class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <h2 class="text-2xl font-bold mb-6 text-center text-text-main dark:text-white transition-colors">Nouveau modèle</h2>
            
            <div class="space-y-4">
                <div>
                    <label for="modelName" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider transition-colors">
                        Nom du modèle
                    </label>
                    <input 
                        type="text" 
                        id="modelName"
                        value={state.modelName}
                        oninput={(e) => {
                            const input = e.currentTarget;
                            const filtered = filterInput(input.value);
                            state.modelName = filtered;
                            input.value = filtered;
                        }}
                        placeholder="Ex: Voyage Pro"
                        class="w-full p-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium"
                        maxlength="50"
                        onkeydown={(e) => e.key === 'Enter' && state.createModel()}
                    />
                    {#if state.nameError}
                        <p class="text-red-500 text-xs mt-1 ml-1 font-medium" transition:fade>{state.nameError}</p>
                    {/if}
                </div>

                <div class="flex flex-col gap-3 pt-4">
                    <button 
                        onclick={state.createModel}
                        disabled={!state.modelName || !!state.nameError || state.isCreating}
                        class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {#if state.isCreating}
                            <span class="flex items-center justify-center gap-2">
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Création...
                            </span>
                        {:else}
                            Créer
                        {/if}
                    </button>
                    <button 
                        onclick={state.toggleCreateModal}
                        class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal de confirmation de suppression -->
{#if state.showDeleteModal && state.modelToDelete}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        transition:fade={{ duration: 200 }}
        onclick={state.cancelDelete}
    >
        <div 
            class="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl transition-colors duration-300"
            transition:scale={{ duration: 200, start: 0.9 }}
            onclick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
        >
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-red-500/10 text-red-500 rounded-full mb-4 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Zm4.33.25a.75.75 0 0 0-1.5-.085l-.5 8.5a.75.75 0 0 0 1.5.085l.5-8.5Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold text-center text-text-main dark:text-white transition-colors">Supprimer le modèle ?</h2>
                <p class="text-text-main/60 dark:text-gray-400 text-center mt-2 font-medium transition-colors">
                    Attention : la suppression du modèle <span class="text-text-main dark:text-white font-bold italic transition-colors">"{state.modelToDelete.modelName}"</span> est définitive.
                </p>
            </div>
            
            <div class="flex flex-col gap-3">
                <button 
                    onclick={state.executeDelete}
                    class="w-full py-4 px-4 bg-red-500 text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-red-500/20"
                >
                    Supprimer
                </button>
                <button 
                    onclick={state.cancelDelete}
                    class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}
