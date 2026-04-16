/**
 * hooks/useToast.ts
 *
 * Wraps Sonner's `toast` so components never import from 'sonner' directly.
 * Makes it trivial to swap the toast library later.
 *
 * Usage:
 *   const { success, error, info } = useToast();
 *   success('Task created');
 */

import { toast } from 'sonner';

export function useToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error:   (msg: string) => toast.error(msg),
    info:    (msg: string) => toast.info(msg),
    loading: (msg: string) => toast.loading(msg),
    dismiss: toast.dismiss,
  };
}
