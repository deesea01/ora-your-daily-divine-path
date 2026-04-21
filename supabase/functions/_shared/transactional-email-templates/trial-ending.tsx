import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

interface TrialEndingProps {
  displayName?: string;
  endsAt?: string; // human readable
  manageUrl?: string;
}

const TrialEnding = ({ displayName, endsAt, manageUrl }: TrialEndingProps) => (
  <Html>
    <Head />
    <Preview>Your Ora free trial ends tomorrow</Preview>
    <Body style={{ backgroundColor: '#0b0a08', color: '#e9e2cf', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
      <Container style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
        <Heading style={{ fontSize: 28, fontWeight: 400, color: '#d4af37', marginBottom: 8 }}>
          A gentle note, {displayName || 'friend'}.
        </Heading>
        <Text style={{ fontSize: 14, lineHeight: '22px', color: '#bdb29a' }}>
          Your free trial of Ora Premium ends <strong style={{ color: '#e9e2cf' }}>{endsAt || 'tomorrow'}</strong>. After that your subscription will begin so your spiritual path can continue uninterrupted.
        </Text>
        <Section style={{ marginTop: 20 }}>
          <Button href={manageUrl || 'https://oradevotion.com/settings'} style={{ backgroundColor: '#d4af37', color: '#0b0a08', padding: '12px 20px', borderRadius: 10, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            Manage subscription
          </Button>
        </Section>
        <Hr style={{ borderColor: '#2a261d', margin: '24px 0' }} />
        <Text style={{ fontSize: 12, color: '#7c7459', lineHeight: '20px' }}>
          You can cancel anytime from Settings → Subscription. 10% of all profits go to faith-based causes.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: TrialEnding,
  subject: 'Your Ora free trial ends tomorrow',
  displayName: 'Trial ending reminder',
  previewData: { displayName: 'Maria', endsAt: 'tomorrow', manageUrl: 'https://oradevotion.com/settings' },
} satisfies TemplateEntry;
