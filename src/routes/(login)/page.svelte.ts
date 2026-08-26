import { liveQuery } from 'dexie';
import { type User } from '$lib/ts/db';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { layoutState } from '$lib/ts/layoutState.svelte.ts';
import { UserRepository } from '$lib/ts/repositories/UserRepository';
import { toastState } from '$lib/ts/toastState.svelte';
import { checkForUpdate, type UpdateCheckResult } from '$lib/ts/updateService';

export function createPageState() {
  let users = liveQuery(() => UserRepository.getAll());
  let showModal = $state(false);
  let firstName = $state('');
  let existingUserError = $state(false);

  let userToDelete = $state<number | null>(null);
  let userToDeleteName = $state('');
  let showDeleteModal = $state(false);

  // État de la vérification de mise à jour
  let showUpdateModal = $state(false);
  let updateChecking = $state(false);
  let updateResult = $state<UpdateCheckResult | null>(null);

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

  /**
   * Vérifie les mises à jour depuis GitHub et rafraîchit le service worker.
   * Affiche une modal avec le résultat de la vérification.
   */
  async function handleCheckUpdate() {
      updateChecking = true;
      updateResult = null;
      showUpdateModal = true;

      // Rafraîchissement du service worker (ignoré si hors-ligne)
      try {
          if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.getRegistration();
              if (registration) {
                  await registration.update();
              }
          }
      } catch {
          // Erreur réseau ignorée : la vérification de version gère le cas hors-ligne
      }

      // Vérification de la version sur GitHub
      updateResult = await checkForUpdate();
      updateChecking = false;
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
    get showUpdateModal() { return showUpdateModal; },
    set showUpdateModal(v) { showUpdateModal = v; },
    get updateChecking() { return updateChecking; },
    get updateResult() { return updateResult; },
    handleInput,
    createUser,
    login,
    promptDeleteUser,
    confirmDeleteUser,
    handleCheckUpdate
  };
}
