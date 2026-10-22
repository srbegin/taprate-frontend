// Cleanpulse Privacy Policy. Written to match what the product actually
// collects — update it when data practices change (new fields, processors,
// analytics, etc.) and bump EFFECTIVE_DATE.
import { Email, LegalHeader, List, Section, Term } from '@/components/landing/LegalParts'

export const metadata = {
  title: 'Privacy Policy — Cleanpulse',
  description: 'How Cleanpulse collects, uses and protects information.',
}

const EFFECTIVE_DATE = 'October 22, 2026'

export default function PrivacyPage() {
  return (
    <article className="space-y-10 text-stone-700 leading-relaxed">
      <LegalHeader title="Privacy Policy" effective={EFFECTIVE_DATE} />

      <p>
        Cleanpulse (“we,” “us,” or “our”) helps businesses collect restroom feedback: customers tap or scan a
        placard to rate a restroom or report a problem, and the business sees the results and gets alerts. This
        policy explains what information we collect, how we use it, and the choices you have. It covers our
        website at cleanpulse.app, the feedback pages that open from our placards, and the Cleanpulse dashboard
        (together, the “Service”).
      </p>

      <Section title="1. Information we collect">
        <p><Term>From people who leave feedback.</Term> When you tap or scan a placard, we collect the rating you
          give, any issues you select (for example, “Out of soap”), and any comment you choose to write. You don’t
          need an account, and we don’t ask for your name or email address to leave feedback. To prevent spam and
          abuse, we process your IP address and basic device information; we store them only in a one-way hashed
          form alongside your feedback, not as readable values.</p>
        <p><Term>From businesses that use Cleanpulse.</Term> When you create an account, we collect your name,
          email address, business name and password (stored hashed, never in readable form). We also store the
          information you add while using the Service, such as restroom names, survey settings, alert email
          addresses and time zone.</p>
        <p><Term>When you contact us or request early access.</Term> We collect the details you provide — such as
          your name, business name, email address, number of restrooms and message — and the IP address the request
          came from, which we use to prevent spam.</p>
        <p><Term>Billing information.</Term> When paid plans are available and you subscribe, payment details are
          collected and processed directly by Stripe. We receive limited billing information (such as a customer ID
          and subscription status) but never your full card number.</p>
        <p><Term>Technical information.</Term> Like most online services, our hosting providers automatically
          record standard server logs — such as IP address, browser type and the pages requested — which we use to
          keep the Service secure and working.</p>
      </Section>

      <Section title="2. How we use information">
        <p>We use the information we collect to:</p>
        <List>
          <li>Provide the Service, including showing feedback to the business and sending it alerts</li>
          <li>Create and manage accounts, including sign-in and password resets</li>
          <li>Respond to inquiries and early-access requests</li>
          <li>Prevent spam, fraud and abuse, and keep the Service secure</li>
          <li>Maintain and improve the Service</li>
          <li>Comply with legal obligations</li>
        </List>
        <p>We do not sell personal information, and we do not use it for advertising.</p>
      </Section>

      <Section title="3. Feedback belongs to the business">
        <p>
          Feedback left on a placard is collected on behalf of the business that placed it. That business can see
          the ratings, issues and comments for its restrooms and decides how long to keep using them. We process
          feedback to provide the Service to that business. If you have a question about feedback you left at a
          particular business, you can contact that business or us.
        </p>
      </Section>

      <Section title="4. Service providers">
        <p>We use these companies to run Cleanpulse. Each receives only the information it needs to do its job:</p>
        <List>
          <li><Term>Vercel</Term> — website hosting</li>
          <li><Term>Fly.io</Term> — application hosting</li>
          <li><Term>Neon</Term> — database hosting</li>
          <li><Term>Upstash</Term> — caching</li>
          <li><Term>Resend</Term> — sending and receiving email</li>
          <li><Term>Stripe</Term> — payment processing</li>
        </List>
        <p>
          Cleanpulse shares accounts and infrastructure with our sister product, TapRate. If your business uses
          both, the same account and business details are used for each.
        </p>
      </Section>

      <Section title="5. When we share information">
        <p>Beyond the service providers above, we share information only:</p>
        <List>
          <li>With the business that owns a placard, for feedback left on it</li>
          <li>When required by law, regulation or valid legal process</li>
          <li>To protect the rights, safety or property of Cleanpulse, our users or others</li>
          <li>As part of a merger, acquisition or sale of assets, with notice to affected users</li>
        </List>
      </Section>

      <Section title="6. How long we keep information">
        <p>
          We keep account information and feedback for as long as the business’s account is active. After an
          account is closed, we delete its data within 90 days, except where we need to keep it to meet legal
          obligations. We keep contact and early-access requests for as long as needed to follow up, and delete
          them on request.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          We use only essential cookies — for example, to keep you signed in to the dashboard. We don’t use
          analytics, advertising or tracking cookies.
        </p>
      </Section>

      <Section title="8. Security">
        <p>
          We protect information with measures such as encryption in transit (HTTPS), hashed passwords and
          restricted access to systems and data. No method of transmission or storage is completely secure, but we
          work to protect your information and will notify affected users of a breach as required by law.
        </p>
      </Section>

      <Section title="9. Your choices and rights">
        <p>Depending on where you live, you may have the right to:</p>
        <List>
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Delete your information</li>
          <li>Object to or restrict certain processing</li>
          <li>Receive a copy of your information in a portable format</li>
        </List>
        <p>To make a request, email <Email />. We won’t discriminate against you for exercising these rights.</p>
      </Section>

      <Section title="10. Children">
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect personal information
          from them. If you believe a child has given us personal information, contact us and we will delete it.
        </p>
      </Section>

      <Section title="11. Where information is processed">
        <p>
          Cleanpulse is operated from the United States, and information is stored and processed in the United
          States. If you use the Service from elsewhere, your information will be transferred to the United States.
        </p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>
          We may update this policy from time to time. If we make material changes, we will let account holders
          know by email or in the Service. The date at the top shows when it was last updated.
        </p>
      </Section>

      <Section title="13. Contact us">
        <p>Questions about this policy or your information? Email <Email />.</p>
      </Section>
    </article>
  )
}
