import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-6 pb-12 pt-safe">
      <SEO
        title="Privacy Policy | Ora"
        description="How Ora collects, uses, and protects your personal and prayer data."
        canonicalPath="/privacy-policy"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Privacy Policy',
          url: 'https://oradevotion.com/privacy-policy',
          publisher: { '@type': 'Organization', name: 'Ora Devotion LLC' },
        }}
      />
      <header className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-xl text-foreground">Privacy Policy</h1>
      </header>

      <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-xs text-muted-foreground/60">Company: Ora Devotion LLC</p>

        <p>Ora Devotion LLC ("Ora," "we," "our," or "us") respects your privacy and is committed to protecting it. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Ora mobile application, website, and related services (collectively, the "Service").</p>

        <h2 className="font-serif text-lg text-foreground">1. Information We Collect</h2>
        <h3 className="font-serif text-base text-foreground">A. Personal Information</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, email address, and account credentials</li>
          <li>Billing and payment information (processed by our Merchant of Record, Paddle.com — see Section 10)</li>
          <li>Account preferences and subscription status</li>
        </ul>

        <h3 className="font-serif text-base text-foreground">B. Spiritual & User-Generated Content</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Journal entries (including spiritual journaling and Examen reflections)</li>
          <li>Prayer activity, confession tracking data, and saved preferences</li>
          <li>Conversations with AI-guided features (e.g., saint personas, monk guidance)</li>
        </ul>
        <p><strong className="text-foreground">Important:</strong> This content may be sensitive in nature. By using Ora, you consent to its processing as described here.</p>

        <h3 className="font-serif text-base text-foreground">C. Usage Data</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Device information (IP address, browser type, OS)</li>
          <li>App usage patterns, feature interactions</li>
          <li>Log data and analytics</li>
        </ul>

        <h3 className="font-serif text-base text-foreground">D. Cookies & Tracking</h3>
        <p>We may use cookies and similar technologies to improve performance, analyze usage trends, and personalize user experience.</p>

        <h2 className="font-serif text-lg text-foreground">2. How We Use Your Information & Legal Basis</h2>
        <p>We process your personal information on the following legal bases (under GDPR and similar regimes):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Performance of a contract</strong> — to create your account, deliver the Service, and process subscriptions.</li>
          <li><strong className="text-foreground">Legitimate interests</strong> — to improve features, ensure security, prevent fraud, and analyze usage.</li>
          <li><strong className="text-foreground">Consent</strong> — for optional communications and processing of sensitive spiritual content (journal entries, confession data, AI conversations). You may withdraw consent at any time.</li>
          <li><strong className="text-foreground">Legal obligation</strong> — to comply with tax, accounting, and other applicable laws.</li>
        </ul>
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and operate the Service</li>
          <li>Personalize spiritual guidance and user experience</li>
          <li>Improve app functionality and features</li>
          <li>Process payments and manage subscriptions</li>
          <li>Communicate updates, support, and service notifications</li>
          <li>Ensure security and prevent fraud</li>
        </ul>

        <h2 className="font-serif text-lg text-foreground">3. AI & Spiritual Guidance Disclaimer</h2>
        <p>Ora provides AI-generated spiritual reflections, guidance, and saint-based interactions. These are not a substitute for clergy, confession, or professional counseling and are intended for informational and devotional purposes only. We do not guarantee theological accuracy, and outputs may vary.</p>

        <h2 className="font-serif text-lg text-foreground">4. How We Share Information</h2>
        <p>We do not sell your personal data. We may share information with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Merchant of Record (Paddle.com Market Limited)</strong> — for sale of subscriptions, payment processing, subscription management, tax compliance, invoicing, and refund handling.</li>
          <li><strong className="text-foreground">Service providers / subprocessors</strong> — hosting (Supabase), AI providers, email delivery, and analytics tooling.</li>
          <li><strong className="text-foreground">Professional advisers</strong> — legal and accounting professionals, where necessary.</li>
          <li><strong className="text-foreground">Authorities</strong> — where required by law or to protect rights and safety.</li>
          <li><strong className="text-foreground">Successors</strong> — in connection with a merger, acquisition, or sale of assets.</li>
        </ul>

        <h2 className="font-serif text-lg text-foreground">5. Data Storage & Security</h2>
        <p>We implement reasonable safeguards, including encryption (where applicable), secure hosting environments, and access controls. However, no system is 100% secure. Use the Service at your own risk.</p>

        <h2 className="font-serif text-lg text-foreground">6. Data Retention</h2>
        <p>We retain data as long as your account is active, as needed to provide services, and as required by law. You may request deletion at any time (see Section 9).</p>

        <h2 className="font-serif text-lg text-foreground">7. Children's Privacy</h2>
        <p>Ora is not intended for users under 13. We do not knowingly collect data from children.</p>

        <h2 className="font-serif text-lg text-foreground">8. Your Rights</h2>
        <p>Depending on your location, you may have rights to access your data, correct inaccuracies, request deletion, and withdraw consent.</p>

        <h2 className="font-serif text-lg text-foreground">9. Data Deletion Requests</h2>
        <p>You may request deletion by contacting <a href="mailto:derek@oradevotion.com" className="text-gold hover:underline">derek@oradevotion.com</a>. We will process requests within a reasonable timeframe, subject to legal obligations.</p>

        <h2 className="font-serif text-lg text-foreground">10. Third-Party Services & Merchant of Record</h2>
        <p>Our order process is conducted by our online reseller <strong className="text-foreground">Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. When you make a purchase, Paddle collects and processes your billing information under its own <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Privacy Policy</a> and <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Buyer Terms</a>.</p>
        <p>Ora also integrates with hosting providers (Supabase), AI providers, and email delivery services. Each has its own privacy policy.</p>

        <h2 className="font-serif text-lg text-foreground">11. Changes to This Policy</h2>
        <p>We may update this policy at any time. Continued use of the Service constitutes acceptance.</p>

        <h2 className="font-serif text-lg text-foreground">12. Contact</h2>
        <p>
          Ora Devotion LLC<br />
          45 Poplar Dr, Cranston, RI<br />
          <a href="mailto:derek@oradevotion.com" className="text-gold hover:underline">derek@oradevotion.com</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
