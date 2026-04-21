import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

interface ReceiptProps {
  displayName?: string;
  amount?: string;
  currency?: string;
  planLabel?: string;
  invoiceUrl?: string;
}

const Receipt = ({ displayName, amount, currency, planLabel, invoiceUrl }: ReceiptProps) => (
  <Html>
    <Head />
    <Preview>Thank you for supporting Ora</Preview>
    <Body style={{ backgroundColor: '#0b0a08', color: '#e9e2cf', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
      <Container style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
        <Heading style={{ fontSize: 28, fontWeight: 400, color: '#d4af37', marginBottom: 8 }}>Thank you, {displayName || 'friend'}.</Heading>
        <Text style={{ fontSize: 14, lineHeight: '22px', color: '#bdb29a' }}>
          Your payment for <strong style={{ color: '#e9e2cf' }}>{planLabel || 'Ora Premium'}</strong> was received.
        </Text>
        <Section style={{ backgroundColor: '#15130f', borderRadius: 12, padding: 20, marginTop: 16, border: '1px solid #2a261d' }}>
          <Text style={{ margin: 0, fontSize: 13, color: '#9b9276' }}>Amount</Text>
          <Text style={{ margin: '4px 0 0', fontSize: 22, color: '#d4af37' }}>{amount || '$10.00'} {currency || 'USD'}</Text>
        </Section>
        {invoiceUrl && (
          <Text style={{ marginTop: 16, fontSize: 13 }}>
            <Link href={invoiceUrl} style={{ color: '#d4af37' }}>View invoice →</Link>
          </Text>
        )}
        <Hr style={{ borderColor: '#2a261d', margin: '24px 0' }} />
        <Text style={{ fontSize: 12, color: '#7c7459', lineHeight: '20px' }}>
          10% of all profits go to faith-based causes. Thank you for praying with us.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Receipt,
  subject: 'Your Ora receipt',
  displayName: 'Receipt',
  previewData: { displayName: 'Maria', amount: '$10.00', currency: 'USD', planLabel: 'Ora Premium · Monthly' },
} satisfies TemplateEntry;
