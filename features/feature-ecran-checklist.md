# Instructions de la feature écran d'édition d'une checklist'

# Fonctionnalité 1 : affichage de l'écran d'édition
### Action
- L'utilisateur créé une nouvelle checklist ou clique sur une checklist existante depuis l'écran d'accueil.
### Comportement
- L'écran d'édition de la checklist s'affiche, comme sur la maquette ecran_checklist.png.
- Un menu est présent en bas de page, en position fixe. Il contient 3 boutons avec uniquement des icones : "Partager", "Check" et "Quitter". Le menu a la couleur de fond #9d50f8, et les icones sont blancs.
- Un bandeau en haut de page en position fixe et de couleur #9d50f8 contient le nom de la checklist créé et en dessous une barre de progression à partir de la valeur progress de la checklist.
- Un bloc de couleur blanc avec bords arrondis est affiché par catégorie dans la checklist (champ category) et pour chaque bloc les items sont affichés les uns en dessous des autres (voir maquette ecran_checklist.png). Chaque item est séparée par une ligne horizontale.
- Pour chaque item, si la valeur champ wanted-quantity est égal à 1, un bouton toggle s'affiche. Si la valeur du champ wanted-quantity est supérieure à 1 alors un bouton avec une icone - et un bouton avec une icone + s'affichent. Entre les 2 boutons s'affiche la valeur du champ added-quantity.
- Pour chaque item un bouton avec une icone "désactiver" à gauche.