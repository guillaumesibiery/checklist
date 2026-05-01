import { base } from '$app/paths';

/**
 * Ajoute une checklist à Google Agenda.
 * @param checklist La checklist à ajouter
 */
export function addToGoogleCalendar(checklist: any) {
    const title = encodeURIComponent(`Checklist: ${checklist.checklistName}`);
    // Utiliser la racine de l'app avec un paramètre pour éviter les 404 sur GitHub Pages
    const url = window.location.origin + base + '/?checklistId=' + checklist.checklistId;
    const details = encodeURIComponent(`Lien vers la checklist : ${url}`);
    
    // Date de début (maintenant)
    const now = new Date();
    const start = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    // Date de fin (+1 heure)
    const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
    
    window.open(googleUrl, '_blank');
}
