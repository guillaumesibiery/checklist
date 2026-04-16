import { db, type Checklist, type ChecklistItem } from '$lib/db';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { onMount } from 'svelte';

export function createChecklistState(id: string) {
    let checklist = $state<Checklist | null>(null);
    let loading = $state(true);
    let expandedCategories = $state(new Set<number>());
    let isFinalizeModalOpen = $state(false);

    onMount(async () => {
        const c = await db.checklists.where('checklistId').equals(id).first();
        if (c) {
            checklist = c;
            // Par défaut, on ouvre toutes les catégories au chargement
            const initialSet = new Set<number>();
            c.elements.forEach((_, index) => initialSet.add(index));
            expandedCategories = initialSet;
        }
        loading = false;
    });

    function toggleCategory(index: number) {
        const newSet = new Set(expandedCategories);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        expandedCategories = newSet;
    }

    async function save() {
        if (!checklist) return;
        
        // 1. Recalculer le progrès (mise à jour du Proxy Svelte)
        updateAllProgress();
        checklist.lastModifiedDate = new Date().toISOString();
        
        // 2. Récupérer l'enregistrement actuel en base pour garantir l'ID numérique
        // 'id' est le checklistId (UUID) passé en paramètre de la fonction createChecklistState
        const existing = await db.checklists.where('checklistId').equals(id).first();
        
        if (existing && existing.id) {
            // 3. Créer un snapshot (objet brut) à partir de l'état réactif
            const rawChecklist = $state.snapshot(checklist);
            
            if (rawChecklist) {
                // 4. On s'assure que l'ID numérique interne est présent pour le 'put'
                rawChecklist.id = existing.id;
                
                // 5. Sauvegarde complète de l'objet (écrase l'existant)
                await db.checklists.put(rawChecklist);
            }
        }
    }

    function updateAllProgress() {
        if (!checklist) return;

        let totalWanted = 0;
        let totalAdded = 0;

        checklist.elements.forEach(element => {
            let catWanted = 0;
            let catAdded = 0;

            element.items.forEach(item => {
                // S'assurer que les valeurs existent avant de faire le calcul
                const wantedVal = item['wanted-quantity'] ?? 0;
                const addedVal = item['added-quantity'] ?? 0;
                
                const wanted = parseInt(wantedVal.toString()) || 0;
                const added = parseInt(addedVal.toString()) || 0;
                
                // Un item n'est compté dans le progrès que s'il n'est pas désactivé
                const isDisabled = item.disabled === 'true' || item.disabled === true;
                if (!isDisabled) {
                    catWanted += wanted;
                    // On ne peut pas avoir ajouté plus que demandé pour le calcul du progrès (%)
                    catAdded += Math.min(added, wanted);
                }
            });

            // Calcul du progrès par catégorie
            const catProgress = catWanted > 0 ? Math.round((catAdded / catWanted) * 100) : 0;
            element.progress = catProgress.toString();

            totalWanted += catWanted;
            totalAdded += catAdded;
        });

        // Calcul du progrès global de la checklist
        const totalProgress = totalWanted > 0 ? Math.round((totalAdded / totalWanted) * 100) : 0;
        checklist.progress = totalProgress.toString();
    }

    async function updateQuantity(categoryIndex: number, itemIndex: number, delta: number) {
        if (!checklist) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];
        let added = parseInt(item['added-quantity'].toString()) || 0;

        added = Math.max(0, added + delta);
        item['added-quantity'] = added.toString();
        
        await save();
    }

    async function toggleItem(categoryIndex: number, itemIndex: number) {
        if (!checklist) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];
        const wanted = parseInt(item['wanted-quantity'].toString()) || 0;
        let added = parseInt(item['added-quantity'].toString()) || 0;

        if (added >= wanted) {
            item['added-quantity'] = '0';
        } else {
            item['added-quantity'] = wanted.toString();
        }

        await save();
    }

    async function toggleDisabled(categoryIndex: number, itemIndex: number) {
        if (!checklist) return;
        const item = checklist.elements[categoryIndex].items[itemIndex];
        item.disabled = (item.disabled === 'true' || item.disabled === true) ? '' : 'true';
        
        await save();
    }

    function quit() {
        goto(`${base}/accueil`);
    }

    function openFinalizeModal() {
        isFinalizeModalOpen = true;
    }

    function closeFinalizeModal() {
        isFinalizeModalOpen = false;
    }

    async function finalize() {
        if (!checklist) return;
        
        checklist.status = 'FINISHED';
        await save();
        goto(`${base}/accueil`);
    }

    return {
        get checklist() { return checklist; },
        get loading() { return loading; },
        get expandedCategories() { return expandedCategories; },
        get isFinalizeModalOpen() { return isFinalizeModalOpen; },
        updateQuantity,
        toggleItem,
        toggleDisabled,
        toggleCategory,
        quit,
        openFinalizeModal,
        closeFinalizeModal,
        finalize
    };
}
