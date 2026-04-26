import { liveQuery } from 'dexie';
import { db, type User } from '$lib/db';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { layoutState } from '$lib/layoutState.svelte.ts';

export function createPageState() {
  let users = liveQuery(() => db.users.orderBy('firstName').toArray());
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
    /^[a-zA-Z0-9 àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ'-]+$/.test(firstName) &&
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
      target.value = target.value.replace(/[^a-zA-Z0-9 àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ'-]/g, '');
      firstName = target.value;
      checkUserExists();
  }

  async function createUser() {
      if (!isValid) return;
      try {
          const user = await db.users.add({ firstName: firstName.trim() });
          localStorage.setItem('currentUserId', user.toString());
          await layoutState.init();
          goto(`${base}/accueil/`);
      } catch (e) {
          console.error(e);
      }
  }

  async function login(userId: number) {
      localStorage.setItem('currentUserId', userId.toString());
      await layoutState.init();
      goto(`${base}/accueil/`);
  }

  function promptDeleteUser(user: User, event: Event) {
      event.stopPropagation();
      userToDelete = user.id!;
      userToDeleteName = user.firstName;
      showDeleteModal = true;
  }

  async function confirmDeleteUser() {
      if (userToDelete !== null) {
          // Supprimer d'abord toutes les checklists de l'utilisateur
          await db.checklists.where('userId').equals(userToDelete).delete();
          // Supprimer aussi tous les modèles de l'utilisateur
          await db.models.where('userId').equals(userToDelete).delete();
          // Puis supprimer l'utilisateur
          await db.users.delete(userToDelete);
          userToDelete = null;
          userToDeleteName = '';
          showDeleteModal = false;
      }
  }
  return {
    get users() { return users; },
    get showModal() { return showModal; },
    set showModal(v) { showModal = v; },
    get firstName() { return firstName; },
    set firstName(v) { firstName = v; },
    get existingUserError() { return existingUserError; },
    set existingUserError(v) { existingUserError = v; },
    get userToDeleteName() { return userToDeleteName; },
    get showDeleteModal() { return showDeleteModal; },
    set showDeleteModal(v) { showDeleteModal = v; },
    get isValid() { return isValid; },
    handleInput,
    createUser,
    login,
    promptDeleteUser,
    confirmDeleteUser
  };
}
