import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link, Button } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

interface WeeklyRecapProps {
  displayName?: string;
  headline?: string;
  topSaint?: string;
  saintMessageCount?: number;
  saintMinutes?: number;
  prayerCount?: number;
  rosaryCount?: number;
  streak?: number;
  topVirtue?: string;
  reflection?: string;
  scripture?: string;
  recapUrl?: string;
}

const WeeklyRecapEmail = ({
  displayName,
  headline,
  topSaint,
  saintMessageCount,
  saintMinutes,
  prayerCount,
  rosaryCount,
  streak,
  topVirtue,
  reflection,
  scripture,
  recapUrl,
}: WeeklyRecapProps) => (
  <Html>
    <Head />
    <Preview>{headline || 'Your week with God'}</Preview>
    <Body style={{ backgroundColor: '#0b0a08', color: '#e9e2cf', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
      <Container style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
        <Text style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#d4af37', marginBottom: 4 }}>
          Your week with God
        </Text>
        <Heading style={{ fontSize: 30, fontWeight: 400, color: '#e9e2cf', margin: '4px 0 16px', lineHeight: '36px' }}>
          {headline || 'A Week of Grace'}
        </Heading>
        <Text style={{ fontSize: 14, lineHeight: '22px', color: '#bdb29a', margin: 0 }}>
          {displayName ? `${displayName}, here'` : 'Here\u2019'}s how the past week unfolded in prayer.
        </Text>

        {topSaint && (
          <Section style={{ backgroundColor: '#15130f', borderRadius: 12, padding: 20, marginTop: 20, border: '1px solid #2a261d' }}>
            <Text style={{ margin: 0, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#9b9276' }}>Most time with</Text>
            <Text style={{ margin: '6px 0 0', fontSize: 22, color: '#d4af37' }}>{topSaint}</Text>
            <Text style={{ margin: '4px 0 0', fontSize: 12, color: '#9b9276' }}>
              {saintMessageCount || 0} messages · ~{saintMinutes || 0} min
            </Text>
          </Section>
        )}

        <Section style={{ marginTop: 16 }}>
          <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'separate', borderSpacing: 8 }}>
            <tr>
              <td width="33%" style={{ backgroundColor: '#15130f', borderRadius: 10, padding: 14, border: '1px solid #2a261d', textAlign: 'center' }}>
                <Text style={{ margin: 0, fontSize: 22, color: '#d4af37' }}>{streak || 0}d</Text>
                <Text style={{ margin: 0, fontSize: 10, color: '#9b9276', letterSpacing: 2, textTransform: 'uppercase' }}>Streak</Text>
              </td>
              <td width="33%" style={{ backgroundColor: '#15130f', borderRadius: 10, padding: 14, border: '1px solid #2a261d', textAlign: 'center' }}>
                <Text style={{ margin: 0, fontSize: 22, color: '#d4af37' }}>{prayerCount || 0}</Text>
                <Text style={{ margin: 0, fontSize: 10, color: '#9b9276', letterSpacing: 2, textTransform: 'uppercase' }}>Prayers</Text>
              </td>
              <td width="33%" style={{ backgroundColor: '#15130f', borderRadius: 10, padding: 14, border: '1px solid #2a261d', textAlign: 'center' }}>
                <Text style={{ margin: 0, fontSize: 22, color: '#d4af37' }}>{rosaryCount || 0}</Text>
                <Text style={{ margin: 0, fontSize: 10, color: '#9b9276', letterSpacing: 2, textTransform: 'uppercase' }}>Rosaries</Text>
              </td>
            </tr>
          </table>
        </Section>

        {topVirtue && (
          <Text style={{ marginTop: 18, fontSize: 14, color: '#bdb29a' }}>
            Where you grew most: <strong style={{ color: '#d4af37', textTransform: 'capitalize' }}>{topVirtue}</strong>
          </Text>
        )}

        {reflection && (
          <Section style={{ marginTop: 18, backgroundColor: '#15130f', borderRadius: 12, padding: 20, border: '1px solid #2a261d' }}>
            <Text style={{ margin: 0, fontSize: 14, lineHeight: '22px', color: '#e9e2cf', fontStyle: 'italic' }}>
              {reflection}
            </Text>
            {scripture && (
              <Text style={{ margin: '12px 0 0', fontSize: 12, color: '#9b9276' }}>
                {scripture}
              </Text>
            )}
          </Section>
        )}

        {recapUrl && (
          <Section style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              href={recapUrl}
              style={{
                backgroundColor: '#d4af37',
                color: '#0b0a08',
                padding: '14px 28px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Play your story
            </Button>
          </Section>
        )}

        <Hr style={{ borderColor: '#2a261d', margin: '28px 0 16px' }} />
        <Text style={{ fontSize: 11, color: '#7c7459', lineHeight: '18px', textAlign: 'center' }}>
          You're receiving this because you pray with Ora.{' '}
          {recapUrl && <Link href={recapUrl} style={{ color: '#9b9276' }}>Open in app</Link>}
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: WeeklyRecapEmail,
  subject: (data: WeeklyRecapProps) => data.headline ? `Your Wrapped: ${data.headline}` : 'Your week with God',
  displayName: 'Weekly Wrapped Recap',
  previewData: {
    displayName: 'Maria',
    headline: 'A Week of Quiet Strength',
    topSaint: 'St. Teresa of Ávila',
    saintMessageCount: 24,
    saintMinutes: 12,
    prayerCount: 14,
    rosaryCount: 3,
    streak: 6,
    topVirtue: 'patience',
    reflection: 'You returned to prayer with Teresa again and again this week — quiet, faithful, and steady. The grace of patience is taking root.',
    scripture: '"Let nothing disturb you. God alone suffices." — St. Teresa of Ávila',
    recapUrl: 'https://oradevotion.com/recap',
  },
} satisfies TemplateEntry;
