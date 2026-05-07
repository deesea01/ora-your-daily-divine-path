import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-6 pb-12 pt-safe">
      <SEO
        title="Terms of Service | Ora"
        description="The terms governing your use of Ora's Catholic prayer and devotion app."
        canonicalPath="/terms-of-service"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Terms of Service',
          url: 'https://oradevotion.com/terms-of-service',
          publisher: { '@type': 'Organization', name: 'Ora Devotion LLC' },
        }}
      />
      <header className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-xl text-foreground">Terms of Service</h1>
      </header>

      <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
        <h2 className="font-serif text-lg text-foreground">1. Acceptance of Terms</h2>
        <p>By using Ora, you agree to these Terms. If you do not agree, do not use the Service.</p>

        <h2 className="font-serif text-lg text-foreground">2. Eligibility</h2>
        <p>You must be at least 13 years old to use Ora.</p>

        <h2 className="font-serif text-lg text-foreground">3. Account Responsibility</h2>
        <p>You agree to provide accurate information, maintain account security, and be responsible for all activity under your account.</p>

        <h2 className="font-serif text-lg text-foreground">4. Subscriptions & Payments</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ora may offer paid subscriptions (e.g., $10/month or $60/year)</li>
          <li>Payments are billed automatically on a recurring basis unless canceled before renewal</li>
          <li>You may cancel anytime via your account settings or through Paddle</li>
          <li>Refunds are handled by Paddle in accordance with our <a href="/refund-policy" className="text-gold hover:underline">Refund Policy</a> and Paddle's <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Refund Policy</a></li>
          <li>Applicable taxes are calculated and collected by Paddle as Merchant of Record</li>
        </ul>

        <h2 className="font-serif text-lg text-foreground">4a. Merchant of Record</h2>
        <p>Our order process is conducted by our online reseller <strong className="text-foreground">Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. By completing a purchase, you also agree to Paddle's <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Buyer Terms</a>.</p>

        <h2 className="font-serif text-lg text-foreground">5. Acceptable Use</h2>
        <p>You agree NOT to use the app for unlawful purposes, attempt to hack, disrupt, or reverse engineer, or upload harmful or abusive content.</p>

        <h2 className="font-serif text-lg text-foreground">6. Intellectual Property</h2>
        <p>All content, branding, and technology belong to Ora Devotion LLC. You may not copy, distribute, or resell any part of the Service or use content for commercial purposes without permission.</p>

        <h2 className="font-serif text-lg text-foreground">7. User Content</h2>
        <p>You retain ownership of your content (e.g., journal entries), but you grant Ora a license to store, process, and display it as necessary to provide the Service.</p>

        <h2 className="font-serif text-lg text-foreground">8. AI Content Disclaimer</h2>
        <p>All AI-generated responses are provided "as is," may be inaccurate or incomplete, and should not be relied upon for spiritual, legal, or medical decisions.</p>

        <h2 className="font-serif text-lg text-foreground">9. No Warranty</h2>
        <p>The Service is provided "as is" and "as available." We make no guarantees regarding accuracy, availability, or reliability.</p>

        <h2 className="font-serif text-lg text-foreground">10. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Ora Devotion LLC is not liable for any indirect, incidental, or consequential damages, loss of data, spiritual distress, or personal decisions made based on the app.</p>

        <h2 className="font-serif text-lg text-foreground">11. Indemnification</h2>
        <p>You agree to indemnify and hold harmless Ora Devotion LLC from claims arising from your use of the Service or violations of these Terms.</p>

        <h2 className="font-serif text-lg text-foreground">12. Termination</h2>
        <p>We may suspend or terminate your account at any time if you violate these Terms.</p>

        <h2 className="font-serif text-lg text-foreground">13. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Rhode Island, without regard to conflict of law principles.</p>

        <h2 className="font-serif text-lg text-foreground">14. Dispute Resolution</h2>
        <p>Disputes will be resolved through good faith negotiation first, then binding arbitration (if necessary).</p>

        <h2 className="font-serif text-lg text-foreground">15. Changes to Terms</h2>
        <p>We may update these Terms at any time. Continued use constitutes acceptance.</p>

        <h2 className="font-serif text-lg text-foreground">16. Contact</h2>
        <p>
          Ora Devotion LLC<br />
          <a href="mailto:derek@oradevotion.com" className="text-gold hover:underline">derek@oradevotion.com</a>
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
