import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { db } from '$lib/db';

export function createAccueilState() {
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

    return {
        get user() { return user; },
        logout
    };
}