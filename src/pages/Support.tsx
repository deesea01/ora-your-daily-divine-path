import { Link } from "react-router-dom";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";

const SUPPORT_EMAIL = "support@oradevotion.com";
const SUPPORT_PHONE = "+1 (555) 123-4567";

const Support = () => {
  return (
    <div className="min-h-screen bg-background pt-safe pb-safe px-safe">
      <SEO
        title="Support — Ora"
        description="Contact Ora support by email or phone. We're here to help with your prayer life."
      />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="font-serif text-4xl mb-3 text-foreground">Support</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          We're here to help. Reach out anytime — we typically reply within 24 hours.
        </p>

        <div className="space-y-4">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:bg-accent/30 transition"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-foreground font-medium">{SUPPORT_EMAIL}</div>
            </div>
          </a>

          <a
            href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:bg-accent/30 transition"
          >
            <div className="rounded-full bg-primary/10 p-3">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="text-foreground font-medium">{SUPPORT_PHONE}</div>
            </div>
          </a>
        </div>

        <div className="mt-12 text-sm text-muted-foreground space-y-2">
          <p>
            For account, billing, or subscription questions, please email us with the
            address associated with your account.
          </p>
          <p>
            Subscriptions are managed through iOS Settings → Apple ID → Subscriptions.
          </p>
        </div>

        <div className="mt-10 flex gap-6 text-sm">
          <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Support;
