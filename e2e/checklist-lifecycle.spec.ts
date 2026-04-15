import { test, expect } from '@playwright/test';

test('Checklist life cycle', async ({ page }) => {
  
  const testUserName = 'TestUser' + Math.floor(Math.random() * 1000);
  const testChecklistName = 'TestChecklist' + Math.floor(Math.random() * 1000);

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
  await expect(page.getByText(`Bonjour, ${testUserName}`)).toBeVisible();

  await page.getByRole('button', { name: 'Créer une checklist' }).click();
  await page.getByRole('textbox', { name: 'Nom de la checklist' }).fill(testChecklistName);
  await page.getByLabel('Modèle').selectOption('model-bebepack.json');
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();

  await expect(page.getByText(testChecklistName)).toBeVisible();
  await page.getByRole('button', { name: 'Quitter' }).click();
  await page.getByRole('button', { name: 'Supprimer la checklist' }).click();
  await page.getByRole('button', { name: 'Valider la suppression' }).click();

  await expect(page.getByText(testChecklistName)).toHaveCount(0);

});
