import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Button } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

interface PrayerReminderProps {
  displayName?: string;
  slotLabel?: string; // e.g. "Morning Lauds"
  invocation?: string; // gentle line for the slot
  scripture?: string;
  prayUrl?: string;
  kind?: 'scheduled' | 'unfinished';
}

const PrayerReminderEmail = ({
  displayName,
  slotLabel,
  invocation,
  scripture,
  prayUrl,
  kind,
}: PrayerReminderProps) => (
  <Html>
    <Head />
    <Preview>{kind === 'unfinished' ? 'Continue your prayer when you’re ready' : `Time for ${slotLabel || 'prayer'}`}</Preview>
    <Body style={{ backgroundColor: '#0b0a08', color: '#e9e2cf', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
      <Container style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
        <Text style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#d4af37', marginBottom: 4 }}>
          {kind === 'unfinished' ? 'A gentle return' : 'A gentle invitation'}
        </Text>
        <Heading style={{ fontSize: 28, fontWeight: 400, color: '#e9e2cf', margin: '4px 0 16px', lineHeight: '34px' }}>
          {kind === 'unfinished'
            ? 'Continue when you’re ready'
            : (slotLabel || 'Time to pray')}
        </Heading>
        <Text style={{ fontSize: 14, lineHeight: '22px', color: '#bdb29a', margin: 0 }}>
          {displayName ? `${displayName}, ` : ''}
          {invocation || 'Pause for a moment and turn your heart toward Him.'}
        </Text>

        {scripture && (
          <Section style={{ backgroundColor: '#15130f', borderRadius: 12, padding: 18, marginTop: 18, border: '1px solid #2a261d' }}>
            <Text style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: '#e9e2cf', fontStyle: 'italic' }}>
              “{scripture}”
            </Text>
          </Section>
        )}

        {prayUrl && (
          <Section style={{ marginTop: 24, textAlign: 'center' }}>
            <Button
              href={prayUrl}
              style={{
                backgroundColor: '#d4af37',
                color: '#0b0a08',
                padding: '12px 28px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {kind === 'unfinished' ? 'Resume prayer' : 'Pray now'}
            </Button>
          </Section>
        )}

        <Text style={{ marginTop: 32, fontSize: 11, color: '#6f6a5b', textAlign: 'center' }}>
          Walking with you · Ora
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: PrayerReminderEmail,
  subject: (data: PrayerReminderProps) =>
    data?.kind === 'unfinished'
      ? 'Continue your prayer when you’re ready'
      : `Time for ${data?.slotLabel || 'prayer'}`,
  displayName: 'Prayer reminder',
  previewData: {
    displayName: 'Maria',
    slotLabel: 'Morning Lauds',
    invocation: 'Begin your day in grace.',
    scripture: 'In the morning, Lord, you hear my voice.',
    prayUrl: 'https://oradevotion.com/prayer/morning',
    kind: 'scheduled',
  },
} satisfies TemplateEntry;
