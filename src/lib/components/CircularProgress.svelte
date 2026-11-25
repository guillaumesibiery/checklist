<script lang="ts">
    /**
     * Composant de progression circulaire (SVG).
     * Affiche un cercle de progression avec le pourcentage au centre.
     * Inspiré de Preline UI Circular Progress.
     */

    interface Props {
        /** Valeur de progression (0-100) */
        progress: number;
        /** Taille du composant en pixels (défaut : 48) */
        size?: number;
    }

    let { progress, size = 48 }: Props = $props();

    /** Rayon du cercle dans le viewBox */
    const RADIUS = 16;

    /** Périmètre du cercle (2πr) arrondi pour stroke-dasharray */
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    /** Calcul du décalage pour le stroke-dashoffset */
    const offset = $derived(CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE);
</script>

<!-- Conteneur du circular progress -->
<div class="relative flex-shrink-0" style="width: {size}px; height: {size}px;">
    <svg class="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
        <!-- Cercle de fond -->
        <circle
            cx="18"
            cy="18"
            r={RADIUS}
            fill="none"
            class="stroke-current text-primary/10 dark:text-primary/20"
            stroke-width="3"
        ></circle>
        <!-- Cercle de progression -->
        <circle
            cx="18"
            cy="18"
            r={RADIUS}
            fill="none"
            class="stroke-current text-primary transition-all duration-500"
            stroke-width="3"
            stroke-dasharray={CIRCUMFERENCE}
            stroke-dashoffset={offset}
            stroke-linecap="round"
        ></circle>
    </svg>

    <!-- Pourcentage centré -->
    <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-[10px] font-black text-primary">{progress}%</span>
    </div>
</div>
