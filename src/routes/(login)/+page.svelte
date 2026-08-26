<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { base } from '$app/paths';
  import { createPageState } from './page.svelte.ts';
  import { layoutState } from '$lib/ts/layoutState.svelte.ts';
  import Modal from '$lib/components/Modal.svelte';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import { icons } from '$lib/ts/icons';
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
            </div>
        {/if}
    </div>

    <!-- Numéro de version et lien de mise à jour en bas de page -->
    <div class="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-1">
        <span class="text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-[0.2em] pointer-events-none">
            v{__PACKAGE_VERSION__}
        </span>
        <button
            onclick={state.handleCheckUpdate}
            class="text-[10px] text-primary font-medium underline underline-offset-2 transition-colors cursor-pointer"
        >
            Vérifier les mises à jour
        </button>
    </div>

</div>

<Modal 
    isOpen={state.showModal} 
    onclose={() => { state.showModal = false; state.firstName = ''; state.existingUserError = false; }}
    title="Créer un utilisateur"
>
    <div class="space-y-4">
        <Input 
            id="firstName"
            label="Prénom"
            bind:value={state.firstName}
            oninput={state.handleInput}
            maxlength={50}
            error={state.existingUserError ? 'Un utilisateur avec ce prénom existe déjà' : ''}
            placeholder="Votre prénom"
            autofocus
        />

        <div class="flex flex-col gap-3 pt-4">
            <Button
                testId="create-users"
                onclick={state.createUser}
                disabled={!state.isValid}
                fullWidth
            >
                Créer
            </Button>
            <Button
                variant="secondary"
                onclick={() => { state.showModal = false; state.firstName = ''; state.existingUserError = false; }}
                fullWidth
            >
                Annuler
            </Button>
        </div>
    </div>
</Modal>

<!-- Modal Suppression -->
<Modal 
    isOpen={state.showDeleteModal} 
    onclose={() => state.showDeleteModal = false}
    title="Supprimer l'utilisateur ?"
>
    <div class="flex flex-col items-center mb-6">
        <div class="p-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                {@html icons.trash}
            </svg>
        </div>
        <p class="text-text-main/60 dark:text-gray-400 mb-8 leading-relaxed text-center">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <span class="text-text-main dark:text-white font-bold italic">"{state.userToDeleteName}"</span> ? 
            <br><br>
            <span class="text-red-500 font-bold">Attention :</span> Cette action est irréversible et entraînera la perte définitive de toutes les checklists associées à cet utilisateur.
        </p>
    </div>
    <div class="flex flex-col gap-3">
        <Button
            variant="danger"
            onclick={state.confirmDeleteUser}
            fullWidth
        >
            Valider la suppression
        </Button>
        <Button
            variant="secondary"
            onclick={() => state.showDeleteModal = false}
            fullWidth
        >
            Annuler
        </Button>
    </div>
</Modal>

<!-- Modal Mise à jour -->
<Modal 
    isOpen={state.showUpdateModal} 
    onclose={() => state.showUpdateModal = false}
    title="Mise à jour"
>
    <div class="flex flex-col items-center">
        {#if state.updateChecking}
            <!-- État de chargement -->
            <div class="p-4 bg-primary/10 text-primary rounded-full mb-4" transition:scale>
                <svg class="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            <p class="text-text-main/60 dark:text-gray-400 text-center mb-6">Vérification en cours…</p>
        {:else if state.updateResult?.status === 'updated'}
            <!-- Mise à jour disponible -->
            <div class="p-4 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-full mb-4" transition:scale>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                </svg>
            </div>
            <p class="text-text-main dark:text-white font-bold text-center mb-2">Application mise à jour !</p>
            <p class="text-text-main/60 dark:text-gray-400 text-center mb-6">
                Nouvelle version : <span class="text-primary font-bold">v{state.updateResult.newVersion}</span>
            </p>
        {:else if state.updateResult?.status === 'up-to-date'}
            <!-- Aucune mise à jour -->
            <div class="p-4 bg-primary/10 text-primary rounded-full mb-4" transition:scale>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                </svg>
            </div>
            <p class="text-text-main dark:text-white font-bold text-center mb-2">Aucune mise à jour disponible</p>
            <p class="text-text-main/60 dark:text-gray-400 text-center mb-6">
                Vous utilisez déjà la dernière version <span class="text-primary font-bold">v{state.updateResult.version}</span>.
            </p>
        {:else if state.updateResult?.status === 'offline'}
            <!-- Hors-ligne -->
            <div class="p-4 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-full mb-4" transition:scale>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                    <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                </svg>
            </div>
            <p class="text-text-main dark:text-white font-bold text-center mb-2">Connexion requise</p>
            <p class="text-text-main/60 dark:text-gray-400 text-center mb-6">
                Veuillez vous connecter à internet pour vérifier les mises à jour de l'application.
            </p>
        {/if}
    </div>
    {#if !state.updateChecking}
        <div class="flex flex-col gap-3">
            <Button
                variant="secondary"
                onclick={() => state.showUpdateModal = false}
                fullWidth
            >
                Fermer
            </Button>
        </div>
    {/if}
</Modal>