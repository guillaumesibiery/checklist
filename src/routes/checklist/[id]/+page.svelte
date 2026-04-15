<script lang="ts">
    import { page } from '$app/state';
    import { createChecklistState } from './page.svelte.ts';
    import { fade, fly, scale } from 'svelte/transition';

    const state = createChecklistState(page.params.id);

    // Icônes Heroicons Solid
    const icons = {
        share: `<path fill-rule="evenodd" d="M15.75 4.5a3.75 3.75 0 1 1 .731 2.25l-6.45 3.518a3.75 3.75 0 0 1 0 3.464l6.45 3.518a3.75 3.75 0 1 1-.731 2.25c0-.188.014-.37.04-.548l-6.45-3.518a3.75 3.75 0 1 1 0-4.932l6.45-3.518a3.75 3.75 0 0 1-.04-.548Z" clip-rule="evenodd" />`,
        check: `<path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" />`,
        logout: `<path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a0 0 0 0 1 0 0H7.5a0 0 0 0 1 0 0V5.25a0 0 0 0 1 0 0h6a0 0 0 0 1 0 0V8.25a.75.75 0 0 0 1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />`,
        plus: `<path d="M10.75 4.75a.75.75 0 0 1 1.5 0v5.25h5.25a.75.75 0 0 1 0 1.5h-5.25v5.25a.75.75 0 0 1-1.5 0v-5.25H5.25a.75.75 0 0 1 0-1.5h5.25V4.75Z" />`,
        minus: `<path d="M5.25 10.75a.75.75 0 0 1 0-1.5h13.5a.75.75 0 0 1 0 1.5H5.25Z" />`
    };

    function getIcon(name: keyof typeof icons) {
        return icons[name];
    }
</script>

<div class="min-h-screen bg-secondary pb-40">
    {#if state.loading}
        <div class="fixed top-0 left-0 right-0 h-24 bg-primary p-4 z-10 shadow-lg flex flex-col justify-end">
            <div class="animate-pulse h-6 bg-white/20 rounded w-1/2 mb-4"></div>
            <div class="animate-pulse h-2 bg-white/20 rounded w-full"></div>
        </div>
        <div class="pt-28 px-4 space-y-6">
            {#each Array(3) as _}
                <div class="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                    <div class="h-6 bg-secondary rounded w-1/3 mb-4"></div>
                    {#each Array(4) as _}
                        <div class="h-12 bg-secondary rounded w-full mt-2"></div>
                    {/each}
                </div>
            {/each}
        </div>
    {:else if state.checklist}
        <!-- Header -->
        <header class="fixed top-0 left-0 right-0 bg-primary text-text-inverse p-4 z-10 shadow-lg flex flex-col items-center" in:fly={{ y: -50 }}>
            <h1 class="text-xl font-bold truncate w-full text-center px-8">{state.checklist.checklistName}</h1>
            <div class="mt-2 h-2.5 w-full max-w-md bg-white/30 rounded-full overflow-hidden">
                <div class="h-full bg-white transition-all duration-500 ease-out" 
                     style="width: {state.checklist.progress}%">
                </div>
            </div>
            <span class="mt-1 text-xs font-medium">{state.checklist.progress}%</span>
        </header>

        <!-- Content -->
        <main class="pt-28 px-4 space-y-6">
            {#each state.checklist.elements as element, catIndex}
                <section class="bg-white rounded-2xl shadow-sm overflow-hidden" in:fade={{ delay: catIndex * 100 }}>
                    <div class="p-4 bg-white flex justify-between items-center">
                        <h2 class="text-lg font-bold text-text-main">{element.category}</h2>
                        <span class="text-xs font-medium text-text-main/40">{element.progress}%</span>
                    </div>
                    <div class="divide-y divide-secondary">
                        {#each element.items as item, itemIndex}
                            {@const isDisabled = item.disabled === 'true' || item.disabled === true}
                            <div class="p-4 flex items-center gap-3 transition-opacity duration-300"
                                 class:opacity-40={isDisabled}>
                                
                                <!-- Enable/Disable checkbox -->
                                <input type="checkbox" 
                                       class="w-6 h-6 rounded border-2 border-primary text-primary accent-primary focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all duration-200" 
                                       checked={!isDisabled}
                                       onchange={() => state.toggleDisabled(catIndex, itemIndex)}>

                                <!-- Item Name & Quantity Info -->
                                <div class="flex-grow flex flex-col min-w-0">
                                    <span class="text-text-main font-medium truncate" 
                                          class:line-through={isDisabled}>
                                        {item.item}
                                    </span>
                                    {#if parseInt(item['wanted-quantity'].toString()) > 1}
                                        <span class="text-xs text-text-main/50" class:line-through={isDisabled}>
                                            Quantité : {item['wanted-quantity']}
                                        </span>
                                    {/if}
                                </div>

                                <!-- Controls -->
                                {#if !isDisabled}
                                    <div class="flex items-center gap-2" in:scale>
                                        {#if parseInt(item['wanted-quantity'].toString()) === 1}
                                            <button class="w-12 h-6 rounded-full relative transition-colors duration-300"
                                                    class:bg-primary={parseInt(item['added-quantity'].toString()) === 1}
                                                    class:bg-secondary={parseInt(item['added-quantity'].toString()) === 0}
                                                    onclick={() => state.toggleItem(catIndex, itemIndex)}>
                                                <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm"
                                                     class:translate-x-6={parseInt(item['added-quantity'].toString()) === 1}>
                                                </div>
                                            </button>
                                        {:else}
                                            <div class="flex items-center bg-secondary rounded-lg p-1">
                                                <button class="w-8 h-8 flex items-center justify-center text-text-main hover:text-primary active:scale-95 transition-all"
                                                        onclick={() => state.updateQuantity(catIndex, itemIndex, -1)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                                        {@html icons.minus}
                                                    </svg>
                                                </button>
                                                <span class="w-8 text-center font-bold text-text-main">
                                                    {item['added-quantity']}
                                                </span>
                                                <button class="w-8 h-8 flex items-center justify-center text-text-main hover:text-primary active:scale-95 transition-all"
                                                        onclick={() => state.updateQuantity(catIndex, itemIndex, 1)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                                        {@html icons.plus}
                                                    </svg>
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </section>
            {/each}
        </main>

        <!-- Footer Menu -->
        <footer class="fixed bottom-0 left-0 right-0 p-4 bg-secondary z-10" in:fly={{ y: 50 }}>
            <nav class="bg-primary h-20 flex justify-around items-center px-6 rounded-2xl shadow-lg">
                <button class="p-3 text-text-inverse hover:scale-110 transition-transform active:scale-95" aria-label="Partager">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        {@html icons.share}
                    </svg>
                </button>
                <button class="p-3 text-text-inverse hover:scale-110 transition-transform active:scale-95" aria-label="Valider">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        {@html icons.check}
                    </svg>
                </button>
                <button class="p-3 text-text-inverse hover:scale-110 transition-transform active:scale-95" 
                        onclick={state.quit} aria-label="Quitter">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8">
                        {@html icons.logout}
                    </svg>
                </button>
            </nav>
        </footer>
    {:else}
        <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" in:fade>
            <h1 class="text-2xl font-bold text-red-500">Checklist non trouvée</h1>
            <p class="mt-2 text-text-main/60">Nous n'avons pas pu charger votre checklist.</p>
            <button onclick={state.quit} class="mt-8 px-6 py-3 bg-primary text-text-inverse rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                Retour à l'accueil
            </button>
        </div>
    {/if}
</div>

<style>
    /* Optionnel: masquer la scrollbar mais garder le scroll */
    :global(body) {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    :global(body::-webkit-scrollbar) {
        display: none;
    }
</style>