import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-6 pb-12 pt-safe">
      <SEO title="Refund Policy | Ora" description="Ora's refund policy for premium subscriptions." canonicalPath="/refund-policy" />
      <header className="flex items-center gap-3 pt-6 pb-6">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-xl text-foreground">Refund Policy</h1>
      </header>

      <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-xs text-muted-foreground/60">Company: Ora Devotion LLC</p>

        <h2 className="font-serif text-lg text-foreground">30-Day Money-Back Guarantee</h2>
        <p>We want you to feel at peace with your purchase. If you are not satisfied with your Ora subscription, you may request a full refund within <strong className="text-foreground">30 days</strong> of your order date.</p>

        <h2 className="font-serif text-lg text-foreground">Free Trial</h2>
        <p>New subscribers receive a 3-day free trial. You will not be charged if you cancel before the trial ends.</p>

        <h2 className="font-serif text-lg text-foreground">How to Request a Refund</h2>
        <p>Refunds are processed by our payment provider, <strong className="text-foreground">Paddle</strong>, who serves as the Merchant of Record for all Ora purchases. To request a refund:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">paddle.net</a> and look up your order using the email address used at checkout, or</li>
          <li>Email us at <a href="mailto:derek@oradevotion.com" className="text-gold hover:underline">derek@oradevotion.com</a> and we will assist you.</li>
        </ul>
        <p>Refunds are typically returned to your original payment method within 5–10 business days, depending on your bank or card issuer.</p>

        <h2 className="font-serif text-lg text-foreground">Cancellations</h2>
        <p>You may cancel your subscription at any time through your account settings or via the Paddle customer portal. Cancellation stops future renewals; you will retain access to premium features until the end of your current billing period.</p>

        <h2 className="font-serif text-lg text-foreground">Refunds Outside the 30-Day Window</h2>
        <p>Refund requests made after 30 days are reviewed on a case-by-case basis and may be granted at our discretion or as required by law.</p>

        <h2 className="font-serif text-lg text-foreground">Contact</h2>
        <p>
          Ora Devotion LLC<br />
          <a href="mailto:derek@oradevotion.com" className="text-gold hover:underline">derek@oradevotion.com</a>
        </p>
      </div>
    </div>
  );
};

export default RefundPolicy;
