export const metadata = {
  title: 'Terms of Service — TapRate',
  description: 'TapRate Terms of Service.',
};

export default function TermsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3 pb-6 border-b border-zinc-800/60">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500">Effective Date: May 29, 2026</p>
      </header>

      <section className="space-y-4 text-zinc-300 leading-relaxed">
        <p>
          Welcome to TapRate. These Terms of Service (&quot;Terms&quot;) govern your access to
          and use of the TapRate platform, including our website, web applications, NFC-based
          survey tools, and related services (collectively, the &quot;Service&quot;) provided
          by TapRate (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
        </p>
        <p>
          By creating an account or using the Service, you agree to these Terms. If you do
          not agree, do not use the Service.
        </p>
      </section>

      <Section title="1. Service Description">
        <p>
          TapRate provides a software-as-a-service platform that allows businesses to collect
          customer feedback through NFC-enabled surveys. Customers tap physical NFC stickers
          at participating business locations to complete short surveys, and business owners
          view results through an online dashboard.
        </p>
      </Section>

      <Section title="2. Account Terms">
        <p>To use the Service, you must:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Be at least 18 years old</li>
          <li>Provide accurate and complete registration information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Promptly notify us of any unauthorized access</li>
        </ul>
        <p>You are responsible for all activity that occurs under your account.</p>
      </Section>

      <Section title="3. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Use the Service for any unlawful purpose</li>
          <li>Submit false, misleading, or fraudulent survey responses</li>
          <li>Attempt to gain unauthorized access to the Service or other accounts</li>
          <li>Interfere with or disrupt the Service or its infrastructure</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code</li>
          <li>Use the Service to send spam or unsolicited communications</li>
          <li>Collect personal information from customers without their consent</li>
        </ul>
      </Section>

      <Section title="4. Subscriptions and Billing">
        <p>TapRate offers tiered subscription plans. Subscription terms:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <span className="text-white">Free trial:</span> New accounts receive a 30-day free
            trial. No payment information is required to start.
          </li>
          <li>
            <span className="text-white">Paid plans:</span> After the trial ends, continued
            use requires an active subscription. Plans are billed monthly in advance.
          </li>
          <li>
            <span className="text-white">Auto-renewal:</span> Subscriptions automatically renew
            until canceled. You may cancel at any time through the billing portal.
          </li>
          <li>
            <span className="text-white">Refunds:</span> Fees are non-refundable except as
            required by law.
          </li>
          <li>
            <span className="text-white">Price changes:</span> We may change subscription
            prices with at least 30 days&apos; notice.
          </li>
        </ul>
        <p>
          Payments are processed by Stripe, Inc. Your payment information is handled according
          to Stripe&apos;s terms and privacy policy.
        </p>
      </Section>

      <Section title="5. Customer Data">
        <p>
          You retain all rights to data you and your customers submit through the Service
          (&quot;Customer Data&quot;). By using the Service, you grant us a limited license to
          process Customer Data solely to provide and improve the Service.
        </p>
        <p>You are responsible for:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Ensuring you have the right to collect customer feedback through TapRate</li>
          <li>Complying with all applicable privacy and consumer protection laws</li>
          <li>Providing required notices to your customers about feedback collection</li>
          <li>Honoring customer requests regarding their data</li>
        </ul>
      </Section>

      <Section title="6. Intellectual Property">
        <p>
          The Service, including all software, designs, and content provided by TapRate, is
          owned by TapRate and protected by intellectual property laws. We grant you a
          limited, non-exclusive, non-transferable license to use the Service in accordance
          with these Terms.
        </p>
        <p>
          You may not copy, modify, distribute, sell, or lease any part of the Service
          without our prior written consent.
        </p>
      </Section>

      <Section title="7. Service Availability">
        <p>
          We strive to maintain high availability but do not guarantee uninterrupted access.
          We may modify, suspend, or discontinue any part of the Service at any time, with or
          without notice.
        </p>
      </Section>

      <Section title="8. Termination">
        <p>
          You may cancel your account at any time. We may suspend or terminate your account
          if you violate these Terms, fail to pay fees, or engage in conduct that harms
          TapRate or other users.
        </p>
        <p>
          Upon termination, your access to the Service ends and we may delete your account
          data after a reasonable retention period.
        </p>
      </Section>

      <Section title="9. Disclaimers">
        <p className="uppercase text-zinc-400 text-sm leading-relaxed">
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without
          warranties of any kind, express or implied. We disclaim all warranties including
          merchantability, fitness for a particular purpose, and non-infringement.
        </p>
        <p>
          We do not warrant that the Service will be error-free, secure, or uninterrupted.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p className="uppercase text-zinc-400 text-sm leading-relaxed">
          To the maximum extent permitted by law, TapRate shall not be liable for any
          indirect, incidental, special, consequential, or punitive damages, or any loss of
          profits, data, or goodwill arising from your use of the Service.
        </p>
        <p className="uppercase text-zinc-400 text-sm leading-relaxed">
          Our total liability for any claim relating to the Service shall not exceed the
          greater of (a) the amount you paid us in the 12 months preceding the claim, or
          (b) $100 USD.
        </p>
      </Section>

      <Section title="11. Governing Law">
        <p>
          These Terms are governed by the laws of the State of Rhode Island, without regard
          to its conflict of laws principles. Any disputes shall be resolved in the state or
          federal courts located in Rhode Island.
        </p>
      </Section>

      <Section title="12. Changes to Terms">
        <p>
          We may update these Terms from time to time. Material changes will be communicated
          by email or through the Service at least 14 days before they take effect. Continued
          use after changes constitutes acceptance.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          Questions about these Terms? Contact us at{' '}
          <a
            href="mailto:hello@taprate.app"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            hello@taprate.app
          </a>
          .
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3 text-zinc-300 leading-relaxed">
      <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}