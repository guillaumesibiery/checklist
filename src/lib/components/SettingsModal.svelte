<script lang="ts">
    import Modal from './Modal.svelte';
    import { layoutState } from '$lib/ts/layoutState.svelte.ts';

    interface Props {
        isOpen: boolean;
        onclose: () => void;
    }

    let { isOpen, onclose }: Props = $props();
</script>

<Modal {isOpen} {onclose} title="Paramètres">
    <div class="space-y-4">
        <!-- Mode sombre -->
        <div class="flex items-center justify-between p-4 bg-secondary dark:bg-gray-700/50 rounded-2xl transition-colors">
            <div class="flex flex-col">
                <span class="font-bold text-text-main dark:text-gray-200">Mode sombre</span>
                <span class="text-xs text-text-main/50 dark:text-gray-400">Activer le thème sombre</span>
            </div>
            <button 
                onclick={layoutState.toggleDarkMode}
                class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none {layoutState.isDarkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}"
                aria-label="Basculer le mode sombre"
            >
                <span class="sr-only">Mode sombre</span>
                <span 
                    class="inline-block h-5 w-5 transform rounded-full bg-white transition-transform {layoutState.isDarkMode ? 'translate-x-6' : 'translate-x-1'}"
                ></span>
            </button>
        </div>

        <!-- Informations de version -->
        <div class="p-4 bg-secondary dark:bg-gray-700/50 rounded-2xl transition-colors">
            <div class="flex flex-col">
                <span class="text-xs font-bold text-primary uppercase tracking-wider mb-1">Version</span>
                <span class="text-xs font-bold text-text-main dark:text-white transition-colors">
                    v{__PACKAGE_VERSION__}
                </span>
            </div>
            
            <div class="my-3 border-t border-gray-300 dark:border-gray-600 opacity-50"></div>
            
            <div class="flex flex-col">
                <span class="text-xs font-bold text-primary uppercase tracking-wider mb-1">Numéro de build</span>
                <span class="text-xs font-bold text-text-main dark:text-white break-all transition-colors">
                    {__APP_VERSION__}
                </span>
            </div>
        </div>

        <div class="pt-4">
            <button 
                onclick={onclose}
                class="w-full py-4 px-4 bg-secondary dark:bg-gray-700 text-text-main dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
                Fermer
            </button>
        </div>
    </div>
</Modal>
