/**
 * Service de vérification et mise à jour de l'application.
 * Récupère la version depuis GitHub et compare avec le localStorage.
 */

/** Clé du localStorage pour stocker la version */
const VERSION_STORAGE_KEY = 'app_last_known_version';

/** URL du package.json sur le dépôt GitHub (branche main) */
const GITHUB_PACKAGE_URL =
  'https://raw.githubusercontent.com/guillaumesibiery/checklist/main/package.json';

/**
 * Résultat possible de la vérification de mise à jour
 */
export type UpdateCheckResult =
  | { status: 'updated'; newVersion: string }
  | { status: 'up-to-date'; version: string }
  | { status: 'offline' };

/**
 * Vérifie la disponibilité d'une mise à jour en comparant
 * la version GitHub avec celle stockée dans le localStorage.
 * Met à jour systématiquement le localStorage avec la dernière version récupérée.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
  // Vérification de la connectivité réseau
  if (!navigator.onLine) {
    return { status: 'offline' };
  }

  try {
    const response = await fetch(GITHUB_PACKAGE_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    const remoteVersion: string = data.version;

    // Récupère la version précédemment stockée
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    // Met à jour systématiquement le localStorage
    localStorage.setItem(VERSION_STORAGE_KEY, remoteVersion);

    // Compare les versions
    if (storedVersion !== null && storedVersion !== remoteVersion) {
      return { status: 'updated', newVersion: remoteVersion };
    }

    return { status: 'up-to-date', version: remoteVersion };
  } catch {
    // En cas d'erreur réseau (ex: DNS, timeout), on considère hors-ligne
    return { status: 'offline' };
  }
}
