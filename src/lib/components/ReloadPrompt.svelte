<script lang="ts">
  import { useRegisterSW } from 'virtual:pwa-register/svelte';

  const { offlineReady, needUpdate, updateServiceWorker } = useRegisterSW({
    onRegistered(swr) {
      console.log('SW Registered: ', swr);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    offlineReady.set(false);
    needUpdate.set(false);
  };

  const buildDate = __APP_VERSION__;
</script>

{#if $offlineReady || $needUpdate}
  <div
    class="fixed bottom-24 right-4 z-[100] p-4 bg-white border-2 border-primary rounded-[2rem] shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300"
    role="alert"
    aria-labelledby="pwa-message"
  >
    <div class="mb-4">
      <p id="pwa-message" class="text-text-main font-bold">
        {#if $offlineReady}
          L'application fonctionne 100% hors-ligne !
        {:else}
          Une nouvelle version est disponible !
        {/if}
      </p>
      <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Version: {buildDate}</p>
    </div>
    <div class="flex gap-2">
      {#if $needUpdate}
        <button
          onclick={() => updateServiceWorker(true)}
          class="flex-1 py-2 px-4 bg-primary text-text-inverse rounded-full font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          Mettre à jour
        </button>
      {/if}
      <button
        onclick={close}
        class="flex-1 py-2 px-4 bg-secondary text-text-main rounded-full font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
      >
        Fermer
      </button>
    </div>
  </div>
{/if}
