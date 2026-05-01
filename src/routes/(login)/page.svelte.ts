import { liveQuery } from 'dexie';
import { type User } from '$lib/ts/db';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';
import { UserRepository } from '$lib/ts/repositories/UserRepository';
import { toastState } from '$lib/ts/toastState.svelte';

export function createPageState() {
  let users = liveQuery(() => UserRepository.getAll());
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
      existingUserError = await UserRepository.exists(firstName);
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
          const userCount = await UserRepository.count();
          if (userCount >= 1) {
              toastState.error('Un seul utilisateur est autorisé sur cette instance.');
              showModal = false;
              return;
          }
          const userId = await UserRepository.create(firstName);
          await login(userId);
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
          const name = userToDeleteName;
          await UserRepository.deleteCascading(userToDelete);
          layoutState.reset();
          toastState.success(`Utilisateur "${name}" supprimé`);
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
