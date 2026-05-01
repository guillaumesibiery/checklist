import { test, expect } from '@playwright/test';

test('User life cycle', async ({ page }) => {
  const testUserName = 'TestUser' + Math.floor(Math.random() * 1000);

  // 1. Navigation vers la page d'accueil
  await page.goto('/');
  await expect(page).toHaveTitle(/Checklist/i);

  // 2. Création de l'utilisateur
  // Cliquer sur le bouton de création (il peut y en avoir plusieurs si des utilisateurs existent déjà, on prend le premier visible)
  await page.getByRole('button', { name: /Créer un\s*utilisateur/i }).first().click();
  
  // Remplir le prénom
  const input = page.locator('#firstName');
  await input.fill(testUserName);
  
  // Cliquer sur Créer
  await page.getByTestId('create-users').click();

  // 3. Vérification de la redirection vers /accueil
  await expect(page).toHaveURL(/\/accueil/);
  await expect(page.getByText(`Bonjour ${testUserName}`)).toBeVisible();

  // 4. Déconnexion
  await page.getByRole('button', { name: 'Déconnexion' }).click();
  await page.getByRole('button', { name: 'Oui, me déconnecter' }).click();
  
  // Retour à la page de connexion
  await expect(page).toHaveURL(/\/$/);

  // 5. Suppression de l'utilisateur
  // On cherche le bouton de suppression associé à notre utilisateur test
  const deleteButton = page.getByRole('button', { name: `Supprimer ${testUserName}` });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // Confirmation dans la modale
  const confirmButton = page.getByRole('button', { name: 'Valider' });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();

  // 6. Vérification que l'utilisateur n'est plus présent
  await expect(page.getByText(testUserName)).toHaveCount(0);
});
