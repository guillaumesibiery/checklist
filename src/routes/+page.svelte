<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type User } from '$lib/db';
  import { fade, scale, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  let users = liveQuery(() => db.users.toArray());
  let showModal = $state(false);
  let firstName = $state('');
  let existingUserError = $state(false);

  let userToDelete = $state<number | null>(null);
  let userToDeleteName = $state('');
  let showDeleteModal = $state(false);

  // Validation
  let isValid = $derived(
    firstName.trim().length > 0 &&
    firstName.length <= 50 &&
    /^[a-zA-Z0-9]+$/.test(firstName) &&
    !existingUserError
  );

  async function checkUserExists() {
      if (!firstName.trim()) {
          existingUserError = false;
          return;
      }
      const existing = await db.users.where('firstName').equalsIgnoreCase(firstName.trim()).first();
      existingUserError = !!existing;
  }

  function handleInput(e: Event) {
      const target = e.target as HTMLInputElement;
      target.value = target.value.replace(/[^a-zA-Z0-9]/g, '');
      firstName = target.value;
      checkUserExists();
  }

  async function createUser() {
      if (!isValid) return;
      try {
          const user = await db.users.add({ firstName: firstName.trim() });
          localStorage.setItem('currentUserId', user.toString());
          goto('/accueil');
      } catch (e) {
          console.error(e);
      }
  }

  function login(userId: number) {
      localStorage.setItem('currentUserId', userId.toString());
      goto('/accueil');
  }

  function promptDeleteUser(user: User, event: Event) {
      event.stopPropagation();
      userToDelete = user.id!;
      userToDeleteName = user.firstName;
      showDeleteModal = true;
  }

  async function confirmDeleteUser() {
      if (userToDelete !== null) {
          await db.users.delete(userToDelete);
          userToDelete = null;
          userToDeleteName = '';
          showDeleteModal = false;
      }
  }
</script>

<div class="min-h-screen bg-white flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-4xl" transition:fade>
        <div class="flex justify-center mb-12">
            <img src="/img/CHECKLIST-png.png" alt="Checklist Logo" class="h-64 w-auto object-contain" />
        </div>

        {#if $users === undefined}
            <!-- Skeleton Loader -->
            <div class="flex justify-center items-center gap-6 overflow-x-auto pb-4">
                <div class="animate-pulse w-32 h-32 bg-gray-300 rounded-xl"></div>
                <div class="animate-pulse w-32 h-32 bg-gray-300 rounded-xl"></div>
            </div>
        {:else if $users.length === 0}
            <!-- No users: Centered button -->
            <div class="flex justify-center" transition:scale>
                <button
                    onclick={() => showModal = true}
                    class="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 bg-white rounded-2xl transition-shadow text-primary hover:bg-primary hover:text-text-inverse group snap-center cursor-pointer"
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
                <button
                    onclick={() => showModal = true}
                    class="flex-shrink-0 flex flex-col items-center justify-center w-36 h-36 bg-white rounded-2xl transition-shadow text-primary hover:bg-primary hover:text-text-inverse group snap-center cursor-pointer"
                >
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                            <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <span class="font-medium text-center px-2 leading-tight">Créer un<br/>utilisateur</span>
                </button>

                {#each $users as user (user.id)}
                    <div class="relative flex-shrink-0 snap-center" in:scale>
                        <button
                            onclick={() => login(user.id!)}
                            class="flex flex-col items-center justify-center w-36 h-36 bg-white rounded-2xl transition-shadow text-primary hover:bg-primary hover:text-text-inverse group cursor-pointer"
                        >
                            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <span class="font-medium truncate w-full px-4 text-center">{user.firstName}</span>
                        </button>
                        <button
                            onclick={(e) => promptDeleteUser(user, e)}
                            class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm cursor-pointer z-10"
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
</div>

<!-- Modal Creation -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" transition:fade onclick={() => showModal = false}>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" transition:fly={{ y: 50 }} onclick={(e) => e.stopPropagation()}>
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-6 text-text-main">Créer un utilisateur</h2>
                
                <div class="mb-6">
                    <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                        type="text"
                        id="firstName"
                        maxlength="50"
                        oninput={handleInput}
                        bind:value={firstName}
                        class="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all {existingUserError ? 'border-red-500 bg-red-50' : 'border-gray-300'}"
                        placeholder="Votre prénom"
                        autofocus
                    />
                    {#if existingUserError}
                        <p class="mt-2 text-sm text-red-600" transition:fade>Un utilisateur avec ce prénom existe déjà</p>
                    {/if}
                </div>

                <div class="flex gap-4 justify-end">
                    <button
                        onclick={() => { showModal = false; firstName = ''; existingUserError = false; }}
                        class="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>
                    <button
                        onclick={createUser}
                        disabled={!isValid}
                        class="px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer {isValid ? 'bg-primary text-text-inverse hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}"
                    >
                        Créer
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal Suppression -->
{#if showDeleteModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" transition:fade onclick={() => showDeleteModal = false}>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" transition:fly={{ y: 50 }} onclick={(e) => e.stopPropagation()}>
            <div class="p-6">
                <h2 class="text-2xl font-bold mb-4 text-text-main">Supprimer l'utilisateur</h2>
                <p class="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer l'utilisateur <span class="font-bold text-text-main">{userToDeleteName}</span> ?
                </p>
                <div class="flex gap-4 justify-end">
                    <button
                        onclick={() => showDeleteModal = false}
                        class="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        Annuler
                    </button>
                    <button
                        onclick={confirmDeleteUser}
                        class="px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer bg-red-600 text-white hover:bg-red-700"
                    >
                        Valider
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>