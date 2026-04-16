import { supabase } from '@/integrations/supabase/client';

export async function notifyAdminError(
  functionName: string,
  errorMessage: string,
  userId?: string,
  metadata?: Record<string, unknown>
) {
  try {
    await supabase.functions.invoke('notify-admin', {
      body: { functionName, errorMessage, userId, metadata },
    });
  } catch (e) {
    console.error('Failed to notify admin:', e);
  }
}
