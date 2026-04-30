<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { base } from '$app/paths';
  import { createPageState } from './page.svelte.ts';
  import { layoutState } from '$lib/ts/layoutState.svelte.ts';
  import './page.css';

  const state = createPageState();
  let users = state.users;
</script>

<div class="min-h-screen bg-white dark:bg-[#111828] flex flex-col items-center justify-center transition-colors duration-300">
    <div class="w-full max-w-4xl" transition:fade>
        <div class="flex justify-center mb-12">
            {#if layoutState.isDarkMode}
                <img 
                    src="{base}/img/CHECKLIST-png-black.png" 
                    alt="Checklist Logo" 
                    class="h-64 w-auto object-contain" 
                />
            {:else}
                <img 
                    src="{base}/img/CHECKLIST-png.png" 
                    alt="Checklist Logo" 
                    class="h-64 w-auto object-contain" 
                />
            {/if}
        </div>

        {#if $users === undefined}
            <!-- Skeleton Loader -->
            <div class="flex justify-center items-center gap-6 overflow-x-auto pb-4">
                <div class="animate-pulse w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div class="animate-pulse w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        {:else if $users.length === 0}
            <!-- No users: Centered button -->
            <div class="flex justify-center" transition:scale>
                <button
                    onclick={() => state.showModal = true}
                    class="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 bg-white dark:bg-transparent rounded-2xl transition-all text-primary hover:bg-primary hover:text-text-inverse group snap-center cursor-pointer"
                >
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <span class="font-medium text-center px-2 leading-tight">Créer un<br/>utilisateur</span>
                </button>
            </div>
        {:else}
            <!-- Existing users: Horizontal scroll -->
            <div class="flex items-center gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar" style="padding-left: calc(50% - 4.5rem); padding-right: calc(50% - 4.5rem);" transition:fade>
                {#each $users as user (user.id)}
                    <div class="relative flex-shrink-0 snap-center" in:scale>
                        <button
                            onclick={() => state.login(user.id!)}
                            class="flex flex-col items-center justify-center w-36 h-36 bg-white dark:bg-transparent rounded-2xl transition-all text-primary hover:bg-primary hover:text-text-inverse group cursor-pointer"
                        >
                            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <span class="font-medium truncate w-full px-4 text-center dark:group-hover:text-white transition-colors">{user.firstName}</span>
                        </button>
                        <button
                            onclick={(e) => state.promptDeleteUser(user, e)}
                            class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shadow-sm cursor-pointer z-10"
                            aria-label="Supprimer {user.firstName}"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                        </button>
                    </div>
                {/each}

                <button
                    onclick={() => state.showModal = true}
                    class="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 bg-white dark:bg-transparent rounded-2xl transition-all text-primary hover:bg-primary hover:text-text-inverse group snap-center cursor-pointer"
                >
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <span class="font-medium text-center px-2 leading-tight">Créer un<br/>utilisateur</span>
                </button>
            </div>
        {/if}
    </div>

    <!-- Numéro de version en bas de page -->
    <div class="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <span class="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-[0.2em]">
            v{__PACKAGE_VERSION__}
        </span>
    </div>

</div>

<!-- Modal Creation -->
{#if state.showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" transition:fade onclick={() => state.showModal = false}>
        <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 overflow-hidden transition-colors" transition:scale={{ duration: 200, start: 0.9 }} onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h2 class="text-2xl font-bold mb-6 text-center text-text-main dark:text-white">Créer un utilisateur</h2>
            
            <div class="space-y-4">
                <div>
                    <label for="firstName" class="block text-sm font-bold text-text-main/60 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Prénom</label>
                    <input
                        type="text"
                        id="firstName"
                        maxlength="50"
                        oninput={state.handleInput}
                        bind:value={state.firstName}
                        class="w-full p-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl border-2 border-transparent focus:border-primary outline-none transition-all font-medium {state.existingUserError ? 'border-red-500' : ''}"
                        placeholder="Votre prénom"
                        autofocus
                    />
                    {#if state.existingUserError}
                        <p class="mt-1 ml-1 text-xs text-red-500 font-medium" transition:fade>Un utilisateur avec ce prénom existe déjà</p>
                    {/if}
                </div>

                <div class="flex flex-col gap-3 pt-4">
                    <button
                        data-testid="create-users"
                        onclick={state.createUser}
                        disabled={!state.isValid}
                        class="w-full py-4 px-4 bg-primary text-text-inverse rounded-2xl font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        Créer
                    </button>
                    <button
                        onclick={() => { state.showModal = false; state.firstName = ''; state.existingUserError = false; }}
                        class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal Suppression -->
{#if state.showDeleteModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" transition:fade onclick={() => state.showDeleteModal = false}>
        <div class="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 overflow-hidden transition-colors" transition:scale={{ duration: 200, start: 0.9 }} onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div class="flex flex-col items-center mb-6">
                <div class="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5 0l.5 8.5a.75.75 0 1 0 1.5 0l-.5-8.5Zm4.33.75a.75.75 0 0 0-1.5 0l.5 8.5a.75.75 0 0 0 1.5 0l-.5-8.5Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-center text-text-main dark:text-white mb-4">Supprimer l'utilisateur ?</h2>
                <p class="text-text-main/60 dark:text-gray-400 mb-8 leading-relaxed text-center">
                    Êtes-vous sûr de vouloir supprimer l'utilisateur <span class="text-text-main dark:text-white font-bold italic">"{state.userToDeleteName}"</span> ? 
                    <br><br>
                    <span class="text-red-500 font-bold">Attention :</span> Cette action est irréversible et entraînera la perte définitive de toutes les checklists associées à cet utilisateur.
                </p>
            </div>
            <div class="flex flex-col gap-3">
                <button
                    onclick={state.confirmDeleteUser}
                    class="w-full py-4 px-4 bg-red-500 text-white rounded-2xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-red-500/20"
                >
                    Valider la suppression
                </button>
                <button
                    onclick={() => state.showDeleteModal = false}
                    class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                    Annuler
                </button>
            </div>
        </div>
    </div>
{/if}