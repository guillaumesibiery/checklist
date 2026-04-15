## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: tailwindcss, vitest, sveltekit-adapter

---

# Instructions du Projet Checklist
- L'objectif est de construire une application Web qui permet de créer des checklist pour suivre leurs avancement à partir de modèles existant.
- Chaque utilisateur gère ses propres checklist, en cours ou archivées.
- Chaque checklist est liée à un seul utilisateur.

## Stack Technique
- Framework: SvelteKit (Dernière version)
- Style: Tailwind CSS
- Base de données: Dexie.js (IndexedDB)
- PWA: @vite-pwa/sveltekit
- Vitest : test unitaires
- Playwright : tests E2E (répertoire e2e)

## Règles de Développement
1. **Réactivité :** Utilise toujours les transitions natives de Svelte (`fly`, `fade`, `scale`) pour chaque changement d'état.
2. **Offline :** 
- Toutes les données lues ou écrites doivent passer par Dexie.js.
- L'application est 100% Offline, il n'y a aucune synchronisation avec une API.
3. **Design :** 
- Utilise des "Skeleton Screens" avec la classe `animate-pulse` de Tailwind pour tous les états de chargement. 
- L'app doit être utilisable sur mobile, tablette et desktop. 
- La couleur principale est #9d50f8, la couleur secondaire est #f5f5f5. La couleur pour le texte sur fond blanc est #0a0a0a. La couleur du texte est #ffffff si la couleur de fond est #9d50f8.
- Tu dois strictement respecter les maquettes dans le répertoire maquettes.
- Utilise https://heroicons.com/solid pour les icones.
- Utilise le système de validation des champs de Tailwind.
4. **Code :** 
- Écris du code propre en TypeScript. 
- Commente le code en français. 
- Respecte les principes SOLID, KISS, DRY. 
- Les méthodes ne doivent pas dépasser les 200 lignes. 
- Implémente des tests unitaires pour vérifier le fonctionnement des requêtes select, insert, update et delete en base de données IndexedDB.
- Les scripts TS sont isolés dans des fichiers .ts
- Joue les tests e2e Playwright à chaque modification. Tu ne dois pas en créer de nouveaux.
5. **Git :** :
- Tu n'as pas le droit de commiter les développements sur une branche.
- Tu n'as pas le droit de merger une branche. 
- Tu n'as pas le droit de supprimer une branche.
- Créé une branche à chaque nouvelle feature depuis la branche main. Tu ne dois pas faire de modifications directement sur la branche main.

## Structure des données
- Utilise un fichier `src/lib/db.ts` pour centraliser la configuration Dexie.