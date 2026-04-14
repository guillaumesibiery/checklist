# Instructions de la feature de création d'une checklist

# Fonctionnalité 1 : modale de création d'une checklist
### Action
- L'utilisateur clique sur le bouton "Créer" dans le menu en bas de page ou sur le bouton "Créer une checklist" si il se trouve sur l'écran d'accueil.
### Comportement
- Une modale s'affiche, elle contient un titre "Nouvelle checklist", un champ "Nom de la checklist" à donner à la nouvelle checklist à créer, une liste déroulante qui répertorie les modèles de checklist disponibles, un bouton "Créer" et un bouton "Annuler".
- Le champ "Nom de la checklist" n'accèpte que les caractères alphanumériques (a-z, A-Z, 0-9), a une longueur maximum de 50 caractères et est obligatoire.
- Si une checklist existe déjà avec le même nom un message "Une checklist avec ce nom existe déjà" s'affiche sous le champ "Nom de la checklist".
- La liste déroulante liste les modèles disponibles dans le répertoire /static/models/.
- Le bouton "Créer" est désactivé tant que le champ "Nom de la checklist" est vide et qu'aucun modèle n'a été sélectionné dans la liste déroulante.
- Lorsque l'utilisateur clique sur le bouton "Annuler", la modale se ferme.

# Fonctionnalité 2 : création d'une checklist
### Action
- L'utilisateur clique sur le bouton "Créer" dans la modale de création d'une checklist.
### Comportement
- Le json dans le modèle choisi est copié puis modifié comme suit : un id unique dans le champ checklistId, le nom de la checklist créé dans le champ checklistName, l'id de l'utilisateur connecté dans le champ userId, la date et heure dans le champ creationDate.
- Une fois modifiée, la copie est sauvegardée en base de donnée et l'utilisateur est redirigé vers l'écran d'édition de la checklist créée.