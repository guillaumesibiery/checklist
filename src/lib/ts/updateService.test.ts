import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkForUpdate } from './updateService';

/**
 * Tests unitaires du service de vérification de mise à jour.
 * Vérifie les différents scénarios : mise à jour, pas de mise à jour, hors-ligne.
 */
describe('updateService', () => {
  const STORAGE_KEY = 'app_last_known_version';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retourne "up-to-date" quand la version distante est identique à celle stockée', async () => {
    expect.assertions(2);

    localStorage.setItem(STORAGE_KEY, '1.11.0');

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ version: '1.11.0' }), { status: 200 })
    );

    const result = await checkForUpdate();

    expect(result.status).toBe('up-to-date');
    expect(result).toEqual({ status: 'up-to-date', version: '1.11.0' });
  });

  it('retourne "updated" quand la version distante diffère de celle stockée', async () => {
    expect.assertions(3);

    localStorage.setItem(STORAGE_KEY, '1.10.0');

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ version: '1.11.0' }), { status: 200 })
    );

    const result = await checkForUpdate();

    expect(result.status).toBe('updated');
    if (result.status === 'updated') {
      expect(result.newVersion).toBe('1.11.0');
    }
    // Vérifie que le localStorage a été mis à jour
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1.11.0');
  });

  it('retourne "up-to-date" et stocke la version quand aucune version n\'est en localStorage', async () => {
    expect.assertions(2);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ version: '1.11.0' }), { status: 200 })
    );

    const result = await checkForUpdate();

    expect(result).toEqual({ status: 'up-to-date', version: '1.11.0' });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('1.11.0');
  });

  it('retourne "offline" quand navigator.onLine est false', async () => {
    expect.assertions(1);

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    const result = await checkForUpdate();

    expect(result).toEqual({ status: 'offline' });
  });

  it('retourne "offline" quand le fetch échoue (erreur réseau)', async () => {
    expect.assertions(1);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const result = await checkForUpdate();

    expect(result).toEqual({ status: 'offline' });
  });

  it('retourne "offline" quand la réponse HTTP est en erreur', async () => {
    expect.assertions(1);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404 })
    );

    const result = await checkForUpdate();

    expect(result).toEqual({ status: 'offline' });
  });

  it('met à jour systématiquement le localStorage même si la version est identique', async () => {
    expect.assertions(2);

    localStorage.setItem(STORAGE_KEY, '1.11.0');

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ version: '1.11.0' }), { status: 200 })
    );

    await checkForUpdate();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('1.11.0');

    // Deuxième appel avec une version différente
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ version: '1.12.0' }), { status: 200 })
    );

    const result = await checkForUpdate();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('1.12.0');
  });
});
