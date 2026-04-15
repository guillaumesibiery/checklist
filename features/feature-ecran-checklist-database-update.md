# Instructions de la feature mise à jour de la checklist

# Fonctionnalité 1 : mise à jour de la checklist
### Action
- L'utilisateur est sur la page d'édition d'une checklist, il la modifie en cliquant sur les boutons toggle, les boutons +/- et les checkboxes.
### Comportement
- La checklist est mise à jour en base de données à chaque modification.
- La mise à jour en base de données ne doit pas être bloquante et doit être effectuée en tache de fond.
- Le champ lastModifiedDate est mis à jour avec la date et heure de la dernière modification enregistrée.
- Le champ progress de la checklist et de chaque catégorie sont mis en jour avec la valeur calculée dans l'écran.