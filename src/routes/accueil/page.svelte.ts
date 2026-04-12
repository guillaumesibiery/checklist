import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { db, type User } from '$lib/db';

export function createAccueilState() {
    let user = $state<User | null>(null);
    let showLogoutModal = $state(false);

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

    function toggleLogoutModal() {
        showLogoutModal = !showLogoutModal;
    }

    return {
        get user() { return user; },
        get showLogoutModal() { return showLogoutModal; },
        logout,
        toggleLogoutModal
    };
}