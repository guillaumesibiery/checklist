<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import { db, type Checklist } from '$lib/db';
    import { fade } from 'svelte/transition';

    let checklist = $state<Checklist | null>(null);
    let loading = $state(true);

    onMount(async () => {
        const id = page.params.id;
        checklist = await db.checklists.where('checklistId').equals(id).first() || null;
        loading = false;
    });
</script>

<div class="min-h-screen bg-white text-text-main p-6">
    {#if loading}
        <div class="animate-pulse space-y-4">
            <div class="h-8 bg-secondary rounded w-3/4"></div>
            <div class="h-4 bg-secondary rounded w-1/2"></div>
        </div>
    {:else if checklist}
        <div in:fade>
            <h1 class="text-2xl font-bold">{checklist.checklistName}</h1>
            <p class="text-text-main/60">Modèle : {checklist.modelName}</p>
            
            <div class="mt-8">
                <p>Ceci est l'écran d'édition de la checklist (en cours de développement).</p>
                <a href="/accueil" class="inline-block mt-4 text-primary font-bold underline">Retour à l'accueil</a>
            </div>
        </div>
    {:else}
        <div in:fade>
            <h1 class="text-2xl font-bold text-red-500">Checklist non trouvée</h1>
            <p class="mt-2 text-text-main/60">L'id recherché était : {page.params.id}</p>
            <a href="/accueil" class="inline-block mt-4 text-primary font-bold underline">Retour à l'accueil</a>
        </div>
    {/if}
</div>