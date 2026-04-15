import { db, type Checklist, type ChecklistItem } from '$lib/db';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

export function createChecklistState(id: string) {
    let checklist = $state<Checklist | null>(null);
    let loading = $state(true);

    onMount(async () => {
        const c = await db.checklists.where('checklistId').equals(id).first();
        if (c) {
            checklist = c;
        }
        loading = false;
    });

    async function save() {
        if (!checklist || !checklist.id) return;
        checklist.lastModifiedDate = new Date().toISOString();
        updateAllProgress();
        await db.checklists.update(checklist.id, checklist);
    }

    function updateAllProgress() {
        if (!checklist) return;

        let totalWanted = 0;
        let totalAdded = 0;

        checklist.elements.forEach(element => {
            let catWanted = 0;
            let catAdded = 0;

            element.items.forEach(item => {
                const wanted = parseInt(item['wanted-quantity'].toString()) || 0;
                const added = parseInt(item['added-quantity'].toString()) || 0;
                
                if (item.disabled !== 'true' && item.disabled !== true) {
                    catWanted += wanted;
                    catAdded += Math.min(added, wanted);
                }
            });

            const catProgress = catWanted > 0 ? Math.round((catAdded / catWanted) * 100) : 0;
            element.progress = catProgress.toString();

            totalWanted += catWanted;
            totalAdded += catAdded;
        });

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
        goto('/accueil');
    }

    return {
        get checklist() { return checklist; },
        get loading() { return loading; },
        updateQuantity,
        toggleItem,
        toggleDisabled,
        quit
    };
}
