import { describe, it, expect } from 'vitest';
import { compactChecklist, expandChecklist, encodeChecklist, decodeChecklist } from '../ts/share';
import type { Checklist } from '../db';

describe('Share Utilities', () => {
    const mockChecklist: Checklist = {
        checklistId: 'test-uuid',
        checklistName: 'Ma Checklist',
        userId: 'user-uuid',
        userName: 'Test User',
        creationDate: '2026-01-01',
        lastModifiedDate: '2026-01-01',
        progress: 0,
        status: 'IN_PROGRESS',
        modelName: 'Model',
        elements: [
            {
                category: 'Cat 1',
                progress: 0,
                addedByUser: false,
                items: [
                    {
                        item: 'Item 1',
                        'wanted-quantity': 2,
                        'added-quantity': 1,
                        disabled: false,
                        addedByUser: false
                    },
                    {
                        item: 'Item 2',
                        'wanted-quantity': 1,
                        'added-quantity': 0,
                        disabled: true,
                        addedByUser: false
                    }
                ]
            }
        ]
    };

    it('devrait compacter et étendre une checklist sans perte de données essentielles', () => {
        const compact = compactChecklist(mockChecklist);
        
        // Vérifier que les clés sont courtes
        expect(compact.n).toBe('Ma Checklist');
        expect(compact.id).toBe('test-uuid');
        expect(compact.e[0].c).toBe('Cat 1');
        
        const expanded = expandChecklist(compact);
        
        expect(expanded.checklistName).toBe(mockChecklist.checklistName);
        expect(expanded.checklistId).toBe(mockChecklist.checklistId);
        expect(expanded.elements![0].category).toBe(mockChecklist.elements[0].category);
        expect(expanded.elements![0].items[0].item).toBe(mockChecklist.elements[0].items[0].item);
        expect(expanded.elements![0].items[0]['wanted-quantity']).toBe(2);
        expect(expanded.elements![0].items[1].disabled).toBe(true);
    });

    it('devrait réduire significativement la taille de la chaîne encodée', () => {
        // Encodage original (simulé)
        const originalJson = JSON.stringify(mockChecklist);
        const originalEncoded = btoa(encodeURIComponent(originalJson));
        
        // Encodage compacté
        const compact = compactChecklist(mockChecklist);
        const compactEncoded = encodeChecklist(compact);
        
        console.log(`Original: ${originalEncoded.length} chars`);
        console.log(`Compact: ${compactEncoded.length} chars`);
        
        expect(compactEncoded.length).toBeLessThan(originalEncoded.length);
    });

    it('devrait supporter les caractères spéciaux (UTF-8)', () => {
        const specialChecklist: Checklist = {
            ...mockChecklist,
            checklistName: 'Checklist Éléphant 🐘'
        };
        
        const compact = compactChecklist(specialChecklist);
        const encoded = encodeChecklist(compact);
        const decoded = decodeChecklist(encoded);
        const expanded = expandChecklist(decoded);
        
        expect(expanded.checklistName).toBe('Checklist Éléphant 🐘');
    });
});
