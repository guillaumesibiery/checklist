<script lang="ts">
    interface Props {
        count?: number;
    }

    let { count = 3 }: Props = $props();
</script>

<div class="space-y-4">
    {#each Array(count) as _}
        <div class="h-24 bg-secondary dark:bg-gray-800 rounded-[2rem] animate-pulse transition-colors border border-primary/5 dark:border-gray-700/30"></div>
    {/each}
</div>
