import { test, expect } from '@playwright/test';

test('Finalize checklist flow', async ({ page }) => {
  const testUserName = 'FinUser' + Math.floor(Math.random() * 1000);
  const testChecklistName = 'FinChecklist' + Math.floor(Math.random() * 1000);

  // 1. Navigation et création utilisateur
  await page.goto('/');
  await page.getByRole('button', { name: /Créer un\s*utilisateur/i }).first().click();
  await page.locator('#firstName').fill(testUserName);
  await page.getByTestId('create-users').click();

  await expect(page.getByText(`Bonjour ${testUserName}`)).toBeVisible();

  // 2. Création checklist
  await page.getByRole('button', { name: 'Créer une checklist' }).click();
  await page.getByRole('textbox', { name: 'Nom de la checklist' }).fill(testChecklistName);
  await page.getByLabel('Modèle').selectOption('model-bebepack.json');
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();

  // 3. Vérifier que la checklist est bien chargée
  await expect(page.getByText(testChecklistName)).toBeVisible();

  // 4. Cliquer sur Finaliser (elle est à 0%)
  await page.getByRole('button', { name: 'Archiver' }).click();

  // 5. Vérifier la présence de l'alerte de progression < 100%
  await expect(page.getByText(/Attention : votre checklist n'est pas encore terminée/)).toBeVisible();
  await expect(page.getByRole('dialog').getByText('0%')).toBeVisible();

  // 6. Cliquer sur Annuler
  await page.getByRole('button', { name: 'Annuler' }).click();
  await expect(page.getByText(/Archiver la checklist \?/)).not.toBeVisible();

  // 7. Cocher quelques items pour changer le progrès (optionnel mais bien pour le test)
  // On va juste finaliser tel quel pour tester le bouton Valider
  await page.getByRole('button', { name: 'Archiver' }).click();
  await page.getByRole('button', { name: 'Valider' }).click();

  // 8. Vérifier la redirection vers l'accueil
  await expect(page).toHaveURL(/\/accueil/);

  // 9. Vérifier que la checklist n'est plus dans la liste IN_PROGRESS
  await expect(page.getByText(testChecklistName)).toHaveCount(0);
});
