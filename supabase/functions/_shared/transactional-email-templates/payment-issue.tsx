import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Button } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';

interface PaymentIssueProps {
  displayName?: string;
  manageUrl?: string;
}

const PaymentIssue = ({ displayName, manageUrl }: PaymentIssueProps) => (
  <Html>
    <Head />
    <Preview>We couldn't process your latest Ora payment</Preview>
    <Body style={{ backgroundColor: '#0b0a08', color: '#e9e2cf', fontFamily: 'Georgia, serif', margin: 0, padding: '32px 0' }}>
      <Container style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px' }}>
        <Heading style={{ fontSize: 28, fontWeight: 400, color: '#d4af37', marginBottom: 8 }}>
          {displayName || 'Friend'}, your payment needs attention.
        </Heading>
        <Text style={{ fontSize: 14, lineHeight: '22px', color: '#bdb29a' }}>
          We were unable to process your latest payment for Ora Premium. Your access continues for now while we retry — please update your payment method to keep your subscription active.
        </Text>
        <Section style={{ marginTop: 20 }}>
          <Button href={manageUrl || 'https://oradevotion.com/settings'} style={{ backgroundColor: '#d4af37', color: '#0b0a08', padding: '12px 20px', borderRadius: 10, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
            Update payment method
          </Button>
        </Section>
        <Hr style={{ borderColor: '#2a261d', margin: '24px 0' }} />
        <Text style={{ fontSize: 12, color: '#7c7459', lineHeight: '20px' }}>Need help? Reply to this email and we'll be in touch.</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: PaymentIssue,
  subject: "Your Ora payment needs attention",
  displayName: 'Payment issue',
  previewData: { displayName: 'Maria', manageUrl: 'https://oradevotion.com/settings' },
} satisfies TemplateEntry;
