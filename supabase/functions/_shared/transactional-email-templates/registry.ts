import type { ComponentType } from 'npm:react@18.3.1';
import { template as receipt } from './receipt.tsx';
import { template as trialEnding } from './trial-ending.tsx';
import { template as paymentIssue } from './payment-issue.tsx';
import { template as weeklyRecap } from './weekly-recap.tsx';
import { template as prayerReminder } from './prayer-reminder.tsx';

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: any) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  to?: string;
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  receipt,
  trial_ending: trialEnding,
  payment_issue: paymentIssue,
  weekly_recap: weeklyRecap,
  prayer_reminder: prayerReminder,
};
