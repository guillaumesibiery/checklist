/**
 * Type de notification
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * Interface d'une notification toast
 */
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

/**
 * Gestion de l'état des toasts (Svelte 5 Runes)
 */
export function createToastState() {
    let toasts = $state<Toast[]>([]);

    /**
     * Ajoute un toast à la liste
     */
    function add(message: string, type: ToastType = 'info', duration: number = 3000) {
        const id = crypto.randomUUID();
        const newToast = { id, message, type, duration };
        
        toasts = [...toasts, newToast];

        if (duration > 0) {
            setTimeout(() => {
                remove(id);
            }, duration);
        }
    }

    /**
     * Supprime un toast par son ID
     */
    function remove(id: string) {
        toasts = toasts.filter(t => t.id !== id);
    }

    return {
        get toasts() { return toasts; },
        success: (msg: string, dur?: number) => add(msg, 'success', dur),
        error: (msg: string, dur?: number) => add(msg, 'error', dur),
        info: (msg: string, dur?: number) => add(msg, 'info', dur),
        remove
    };
}

export const toastState = createToastState();
