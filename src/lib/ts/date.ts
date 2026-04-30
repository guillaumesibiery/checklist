/**
 * Formate une date au format ISO en chaîne de caractères lisible (fr-FR).
 * @param isoString La date au format ISO.
 * @returns La date formatée.
 */
export function formatDate(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date).replace(',', ' à');
}
