<script lang="ts">
    /**
     * Composant Card refactorisé.
     * Layout : titre en haut, puis une ligne avec circular progress (gauche),
     * badges (milieu) et dropdown d'actions (droite).
     * Le clic sur toute la card (hors dropdown) redirige vers la checklist.
     */
    import type { Snippet } from 'svelte';

    interface Props {
        /** Titre de la checklist */
        title: string;
        /** Lien de navigation (pour les checklists en cours) */
        href?: string;
        /** Action au clic (pour les checklists historisées) */
        onclick?: () => void;
        /** Slot pour le circular progress (gauche) */
        progress?: Snippet;
        /** Slot pour les informations / badges (milieu) */
        info?: Snippet;
        /** Slot pour la dropdown d'actions (droite) */
        actions?: Snippet;
        /** Identifiant de test */
        testId?: string;
    }

    let { 
        title, 
        href, 
        onclick, 
        progress,
        info, 
        actions,
        testId
    }: Props = $props();
</script>

<!-- Conteneur principal de la card -->
<div class="group relative bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-3xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-all active:scale-[0.98]">
    <!-- Zone cliquable couvrant toute la card -->
    {#if href}
        <a {href} class="home-checklist-name block px-4 pt-5 pb-4" data-testid={testId}>
            <!-- Titre de la checklist -->
            <h3 class="font-bold text-xl text-text-main dark:text-white mb-4 break-words">
                {title}
            </h3>

            <!-- Ligne du bas : Progress + Infos -->
            <div class="flex items-center gap-4">
                <!-- Circular Progress (gauche) -->
                {#if progress}
                    {@render progress()}
                {/if}

                <!-- Informations / Badges (milieu) -->
                <div class="flex flex-col items-start gap-2 flex-1 min-w-0">
                    {#if info}
                        {@render info()}
                    {/if}
                </div>
            </div>
        </a>
    {:else if onclick}
        <button class="home-checklist-name w-full text-left cursor-pointer block px-4 pt-5 pb-4" {onclick} data-testid={testId}>
            <!-- Titre de la checklist -->
            <h3 class="font-bold text-xl text-text-main dark:text-white mb-4 break-words">
                {title}
            </h3>

            <!-- Ligne du bas : Progress + Infos -->
            <div class="flex items-center gap-4">
                <!-- Circular Progress (gauche) -->
                {#if progress}
                    {@render progress()}
                {/if}

                <!-- Informations / Badges (milieu) -->
                <div class="flex flex-col items-start gap-2 flex-1 min-w-0">
                    {#if info}
                        {@render info()}
                    {/if}
                </div>
            </div>
        </button>
    {:else}
        <div class="px-4 pt-5 pb-4">
            <!-- Titre de la checklist -->
            <h3 class="font-bold text-xl text-text-main dark:text-white mb-4 break-words">
                {title}
            </h3>

            <!-- Ligne du bas : Progress + Infos -->
            <div class="flex items-center gap-4">
                <!-- Circular Progress (gauche) -->
                {#if progress}
                    {@render progress()}
                {/if}

                <!-- Informations / Badges (milieu) -->
                <div class="flex flex-col items-start gap-2 flex-1 min-w-0">
                    {#if info}
                        {@render info()}
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    <!-- Dropdown d'actions (positionnée en absolute en bas à droite) -->
    {#if actions}
        <div class="absolute bottom-3 right-3">
            {@render actions()}
        </div>
    {/if}
</div>
