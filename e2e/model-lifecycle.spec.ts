import { test, expect } from '@playwright/test';

test('Model life cycle', async ({ page }) => {
  
  const formattedDate: string = new Date().toLocaleDateString('fr-FR');
  const testUserName = 'TestUser' + Math.floor(Math.random() * 1000);
  const testModelName = 'TestModel' + Math.floor(Math.random() * 1000);

  // Navigation vers la page d'accueil
  await page.goto('/');
  await expect(page).toHaveTitle(/Checklist/i);

  // Création de l'utilisateur
  // Cliquer sur le bouton de création (il peut y en avoir plusieurs si des utilisateurs existent déjà, on prend le premier visible)
  await page.getByRole('button', { name: /Créer un\s*utilisateur/i }).first().click();
  
  // Remplir le prénom
  const input = page.locator('#firstName');
  await input.fill(testUserName);
  
  // Cliquer sur Créer
  await page.getByTestId('create-users').click();

  // Vérification de la redirection vers /accueil
  await expect(page).toHaveURL(/\/accueil/);
  await expect(page.getByText(`Bonjour, ${testUserName}`)).toBeVisible();
  
  //Création du modèle
  await page.getByRole('button', { name: 'Modèles' }).click();
  await expect(page).toHaveURL(/\/modeles/);

  await page.getByRole('button', { name: 'Créer un modèle' }).click();
  await page.getByRole('textbox', { name: 'Nom du modèle' }).fill('Voyage pro');
  await page.getByRole('dialog').getByRole('button', { name: 'Créer' }).click();

  //Modification du modèle
  await expect(page.getByRole('heading', { name: 'Modèle "Voyage pro"' })).toBeVisible();

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click();
  await page.getByRole('button', { name: 'Annuler' }).click();

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click();
  await page.getByRole('textbox', { name: 'Nom de la catégorie' }).fill('Valise');
  await page.getByTestId('add-model-category').click();

  await page.getByRole('button', { name: 'Ajouter un élément' }).click();
  await page.getByRole('textbox', { name: 'Nom de l\'élément' }).fill('T-shirts');
  await page.getByRole('button', { name: 'Augmenter la quantité' }).click();
  await page.getByRole('button', { name: 'Augmenter la quantité' }).click();
  await page.getByTestId('add-model-item').click();

  await page.getByRole('button', { name: 'Ajouter un élément' }).click();
  await page.getByRole('textbox', { name: 'Nom de l\'élément' }).fill('Pantalons');
  await page.getByRole('dialog').getByRole('button', { name: 'Augmenter la quantité' }).click();
  await page.getByTestId('add-model-item').click();

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click();
  await page.getByRole('textbox', { name: 'Nom de la catégorie' }).fill('Documents');
  await page.getByTestId('add-model-category').click();

  await page.getByRole('button', { name: 'Ajouter un élément' }).first().click();
  await page.getByRole('textbox', { name: 'Nom de l\'élément' }).fill('Passeport');
  await page.getByTestId('add-model-item').click();
  
  //Vérification des données créées
  await expect(page.locator('body')).toContainText('Valise');
  await expect(page.locator('body')).toContainText('T-shirts 3');
  await expect(page.locator('body')).toContainText('Pantalons 2');
  await expect(page.locator('body')).toContainText('Documents');
  await expect(page.locator('body')).toContainText('Passeport 1');
  
  //Suppression d'une catégorie
  await page.locator('section').filter({ hasText: 'Documents Ajouter un élément' }).getByLabel('Supprimer la catégorie').click();
  await expect(page.getByText('Documents')).toHaveCount(0);

  //Suppression d'un élément
  await page.getByRole('button', { name: 'Supprimer l\'élément' }).first().click();
  await expect(page.getByText('Pantalons 2')).toHaveCount(0);

  //Sortie
  await page.getByRole('button', { name: 'Quitter' }).click();
  await expect(page).toHaveURL(/\/modeles/);

  await expect(page.locator('h3')).toContainText('Voyage pro');

  //Modification
  await page.getByRole('button', { name: 'Voyage pro Créé le '+formattedDate }).click();
  await expect(page.getByRole('heading', { name: 'Modèle "Voyage pro"' })).toBeVisible();

  await page.getByRole('button', { name: 'Ajouter une catégorie' }).click();
  await page.getByRole('textbox', { name: 'Nom de la catégorie' }).fill('Documents');
  await page.getByTestId('add-model-category').click();

  await page.getByRole('button', { name: 'Ajouter un élément' }).first().click();
  await page.getByRole('textbox', { name: 'Nom de l\'élément' }).fill('Passeport');
  await page.getByTestId('add-model-item').click();

  await expect(page.locator('body')).toContainText('Valise');
  await expect(page.locator('body')).toContainText('T-shirts 3');

  await expect(page.locator('body')).toContainText('Documents');
  await expect(page.locator('body')).toContainText('Passeport 1');

  await page.getByRole('button', { name: 'Quitter' }).click();
  await expect(page).toHaveURL(/\/modeles/);

  //Suppression du modèle
  await page.getByRole('button', { name: 'Supprimer le modèle' }).click();
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click();

  await expect(page.getByRole('main')).toContainText('Aucun modèle de checklist pour le moment.');

});
