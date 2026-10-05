export const metadata = {
  title: 'Privacy Policy — TapRate',
  description: 'TapRate Privacy Policy.',
};

export default function PrivacyPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-3 pb-6 border-b border-zinc-800/60">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500">Effective Date: May 29, 2026</p>
      </header>

      <section className="space-y-4 text-zinc-300 leading-relaxed">
        <p>
          This Privacy Policy describes how TapRate (&quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;) collects, uses, and shares information when you use our service.
        </p>
      </section>

      <Section title="1. Information We Collect">
        <p>
          <span className="text-white">Account information:</span> When you create an account,
          we collect your name, email address, organization name, and password (stored hashed).
        </p>
        <p>
          <span className="text-white">Billing information:</span> When you subscribe to a paid
          plan, payment details are collected directly by Stripe. We receive limited billing
          metadata (customer ID, subscription status, plan) but never your full card number.
        </p>
        <p>
          <span className="text-white">Survey responses:</span> We collect customer feedback
          submitted through your surveys, including ratings, comments, and optional contact
          details when customers opt in.
        </p>
        <p>
          <span className="text-white">Marketing opt-ins:</span> Email addresses collected
          through incentive entries when the customer has explicitly opted in to receive
          marketing.
        </p>
        <p>
          <span className="text-white">Technical data:</span> IP addresses, browser type,
          device information, and usage logs collected automatically when you or your
          customers interact with the Service.
        </p>
      </Section>

      <Section title="2. How We Use Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Provide, maintain, and improve the Service</li>
          <li>Process payments and manage subscriptions</li>
          <li>Deliver survey responses, alerts, and notifications</li>
          <li>Communicate with you about your account, billing, and product updates</li>
          <li>Detect and prevent fraud, abuse, and security incidents</li>
          <li>Comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="3. Third-Party Processors">
        <p>We rely on the following third-party services to operate TapRate:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>
            <span className="text-white">Stripe</span> — payment processing
          </li>
          <li>
            <span className="text-white">Resend</span> — transactional and notification email
            delivery
          </li>
          <li>
            <span className="text-white">Neon</span> — database hosting (PostgreSQL)
          </li>
          <li>
            <span className="text-white">Upstash</span> — in-memory caching (Redis)
          </li>
          <li>
            <span className="text-white">Vercel</span> — frontend hosting
          </li>
          <li>
            <span className="text-white">Fly.io</span> — backend application hosting
          </li>
        </ul>
        <p>
          Each processor receives only the data needed to perform its function and is
          contractually bound to protect that data.
        </p>
      </Section>

      <Section title="4. Data Sharing">
        <p>We do not sell personal information. We may share information:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>With third-party processors as described above</li>
          <li>When required by law, regulation, or valid legal process</li>
          <li>
            To protect the rights, safety, or property of TapRate, our users, or others
          </li>
          <li>
            In connection with a merger, acquisition, or sale of assets, with notice to
            affected users
          </li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain account and survey data for as long as your account is active. After
          account termination, we retain data for up to 90 days to allow for recovery, then
          delete it except where retention is required by law.
        </p>
        <p>
          Customer survey responses are retained according to the data controller&apos;s (your
          business&apos;s) policies and applicable legal requirements.
        </p>
      </Section>

      <Section title="6. Security">
        <p>
          We use industry-standard safeguards including encryption in transit (HTTPS),
          encrypted passwords, scoped access controls, and regular security review. No method
          of electronic transmission or storage is 100% secure, however, and we cannot
          guarantee absolute security.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Object to or restrict certain processing</li>
          <li>Receive a portable copy of your data</li>
          <li>Withdraw consent for marketing communications</li>
        </ul>
        <p>
          To exercise these rights, contact us at{' '}
          <a
            href="mailto:hello@taprate.app"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            hello@taprate.app
          </a>
          .
        </p>
      </Section>

      <Section title="8. Cookies and Tracking">
        <p>
          The Service uses essential cookies and similar technologies for authentication,
          security, and basic functionality. We do not use third-party advertising trackers.
        </p>
      </Section>

      <Section title="9. Children's Privacy">
        <p>
          TapRate is not directed at children under 13. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided us with
          information, contact us and we will delete it.
        </p>
      </Section>

      <Section title="10. International Users">
        <p>
          TapRate is operated from the United States. If you access the Service from outside
          the United States, your information may be transferred to, stored, and processed in
          the United States.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be
          communicated by email or through the Service. The effective date at the top
          reflects the most recent update.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          Questions about this Privacy Policy or our data practices? Contact us at{' '}
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