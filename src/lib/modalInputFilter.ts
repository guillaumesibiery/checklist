/**
 * Filtre une chaîne de caractères pour ne garder que les caractères autorisés dans les champs des modales :
 * Alphanumériques (incluant accents), espaces, tirets, underscores, apostrophes et points.
 */
export function filterInput(value: string): string {
    return value.replace(/[^\p{L}\p{N}\s._'\-]/gu, '');
}
