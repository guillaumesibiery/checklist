<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { db } from '$lib/db';
    
    let user = $state<{firstName: string} | null>(null);

    onMount(async () => {
        const idStr = localStorage.getItem('currentUserId');
        if (!idStr) {
            goto('/');
            return;
        }
        const u = await db.users.get(parseInt(idStr));
        if (u) {
            user = u;
        } else {
            goto('/');
        }
    });

    function logout() {
        localStorage.removeItem('currentUserId');
        goto('/');
    }
</script>

<div class="min-h-screen bg-white p-4">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 class="text-2xl font-bold text-primary mb-4">Accueil</h1>
        {#if user}
            <p class="text-lg">Bienvenue, {user.firstName} !</p>
        {:else}
            <p class="animate-pulse text-gray-500">Chargement...</p>
        {/if}
        
        <button onclick={logout} class="mt-6 px-5 py-2.5 bg-gray-200 text-text-main rounded-lg hover:bg-gray-300 font-medium transition-colors cursor-pointer">
            Déconnexion
        </button>
    </div>
</div>
