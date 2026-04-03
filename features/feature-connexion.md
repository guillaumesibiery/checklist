# Instructions de la feature écran de connexion

# Fonctionnalité 1 : première utilisation
### Action
- L'utilisateur ouvre l'application pour la première fois depuis son appareil mobile ou ordinateur
### Comportement
- L'écran de connexion s'affiche (maquette ecran_connexion.png)

# Fonctionnalité 2 : création d'un utilisateur
### Action
- L'utilisateur est sur l'écran de connexion et clique sur l'icône Créer un utilisateur
### Comportement
- La modale de création d'un nouvel utilisateur apparait (maquette ecran_connexion_nouvel_utilisateur.png).
- Le champ Prénom n'accèpte que les caractères alphanumériques (a-z, A-Z, 0-9) et a une longueur maximum de 50 caractères.
- Si un utilisateur avec le même prénom existe déjà un message "Un utilisateur avec ce prénom existe déjà" s'affiche sous le champ prénom.
- Le bouton Créer est désactivé tant que le champ Prénom est vide ou si un utilisateur avec le même prénom existe déjà.
- Si l'utilisateur clique sur le bouton Créer, il est créé en base de données et l'écran d'accueil s'affiche (maquette ecran_accueil.png)

# Fonctionnalité 3 : reconnexion
### Action
- L'utilisateur ouvre l'application et au moins un utilisateur est créé en base de données
### Comportement
- L'écran de connexion s'affiche (maquette ecran_connexion_utilisateur_existant.png)
- Si il clique sur un utilisateur créé alors l'écran d'accueil s'affiche (maquette ecran_accueil.png)
- Le bouton Créer un utilisateur et les boutons des utilisateurs créés sont alignés horizontalement, on doit pouvoir scroller de gauche à droite
- Le bouton Créer un utilisateur est centré horizontalement