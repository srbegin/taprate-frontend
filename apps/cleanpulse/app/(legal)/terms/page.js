// Cleanpulse Terms of Service — adapted from TapRate's terms for restroom
// feedback, placards and the current trial-only billing. Bump EFFECTIVE_DATE
// (and give 14 days' notice of material changes, per section 14).
import Link from 'next/link'
import { Email, LegalHeader, List, Section, Term } from '@/components/landing/LegalParts'

export const metadata = {
  title: 'Terms of Service — Cleanpulse',
  description: 'The terms that apply to using Cleanpulse.',
}

const EFFECTIVE_DATE = 'October 22, 2026'

export default function TermsPage() {
  return (
    <article className="space-y-10 text-stone-700 leading-relaxed">
      <LegalHeader title="Terms of Service" effective={EFFECTIVE_DATE} />

      <div className="space-y-3">
        <p>
          These Terms of Service (“Terms”) govern your use of Cleanpulse, including our website at cleanpulse.app,
          the Cleanpulse dashboard, the feedback pages that open from our placards, and the placards themselves
          (together, the “Service”). The Service is provided by Beginnings LLC, a Rhode Island limited liability
          company, doing business as Cleanpulse (“Cleanpulse,” “we,” “us,” or “our”).
        </p>
        <p>
          By creating an account or using the Service, you agree to these Terms. If you’re using the Service on
          behalf of a business, you agree to them on that business’s behalf. If you don’t agree, don’t use the
          Service. Our <Link href="/privacy" className="text-brand-soft hover:text-brand-softer underline underline-offset-2">Privacy Policy</Link> explains
          how we handle information.
        </p>
      </div>

      <Section title="1. The Service">
        <p>
          Cleanpulse helps businesses collect feedback about their restrooms. Customers tap or scan a placard to
          rate a restroom or report an issue, and the business sees the results in an online dashboard and can
          receive email alerts.
        </p>
      </Section>

      <Section title="2. Your account">
        <p>To use the dashboard, you must:</p>
        <List>
          <li>Be at least 18 years old</li>
          <li>Provide accurate and complete registration information</li>
          <li>Keep your sign-in details secure</li>
          <li>Tell us promptly about any unauthorized access to your account</li>
        </List>
        <p>
          You’re responsible for all activity under your account. Your Cleanpulse account also works with our
          sister product, TapRate; each product is subscribed to separately.
        </p>
      </Section>

      <Section title="3. Placards">
        <p>
          Placards we provide are for use with your Cleanpulse account. Each placard carries a unique code that links
          it to the Service. You agree not to alter, copy or reuse placard codes, or use placards with any other
          service. Put placards where customers can use them safely. If a placard is lost, damaged or moved,
          contact us or update it in your dashboard. Placards may come with separate pricing or terms that we tell
          you about when you order them.
        </p>
      </Section>

      <Section title="4. Alerts are not a guarantee">
        <p>
          Cleanpulse helps you find out about restroom issues sooner, but it is not a substitute for your own
          cleaning, inspection and maintenance routines, and it is <Term>not an emergency or safety reporting
          system</Term>. Alerts depend on customers choosing to leave feedback and on email delivery, and they may
          be delayed or not arrive. You remain responsible for the condition, safety and compliance of your
          premises.
        </p>
      </Section>

      <Section title="5. Acceptable use">
        <p>You agree not to:</p>
        <List>
          <li>Use the Service for any unlawful purpose</li>
          <li>Submit false, misleading or fraudulent feedback, or manipulate ratings</li>
          <li>Attempt to gain unauthorized access to the Service or to other accounts</li>
          <li>Interfere with or disrupt the Service or its infrastructure</li>
          <li>Reverse engineer, decompile or attempt to extract the Service’s source code</li>
          <li>Use the Service to collect personal information from customers without a lawful basis</li>
        </List>
      </Section>

      <Section title="6. Free trial and billing">
        <List>
          <li>
            <Term>Free trial:</Term> New accounts get a 30-day free trial. No payment information is needed to
            start.
          </li>
          <li>
            <Term>Paid plans:</Term> We’re still finalizing paid plans. When they’re available, continuing to use
            the Service after your trial will require a subscription. We’ll tell you the price before you’re
            charged, and you won’t be charged unless you choose a plan.
          </li>
          <li>
            <Term>Once you subscribe:</Term> plans are billed in advance and renew automatically until you cancel.
            You can cancel at any time, effective at the end of the current billing period. Fees are
            non-refundable except where required by law. We’ll give you at least 30 days’ notice of any price
            change.
          </li>
        </List>
        <p>Payments are processed by Stripe, Inc., under Stripe’s own terms and privacy policy.</p>
      </Section>

      <Section title="7. Feedback data">
        <p>
          As between you and us, you own the feedback collected through your placards and the information you add
          to the Service (“Your Data”). You grant us a limited license to process Your Data only to provide,
          secure and improve the Service.
        </p>
        <p>You are responsible for:</p>
        <List>
          <li>Having the right to collect feedback at the locations where you use placards</li>
          <li>Complying with privacy and consumer protection laws that apply to you</li>
          <li>Giving your customers any notices the law requires</li>
          <li>Handling customer requests about their information</li>
        </List>
      </Section>

      <Section title="8. Our intellectual property">
        <p>
          The Service, including its software, designs and content, is owned by Beginnings LLC and protected by
          intellectual property laws. We grant you a limited, non-exclusive, non-transferable license to use the
          Service under these Terms. You may not copy, modify, distribute, sell or lease any part of the Service
          without our written permission.
        </p>
      </Section>

      <Section title="9. Availability and changes to the Service">
        <p>
          We work to keep the Service available but don’t guarantee uninterrupted access. We may change, suspend or
          discontinue parts of the Service, and will give reasonable notice of changes that significantly affect
          you where we can.
        </p>
      </Section>

      <Section title="10. Ending your use">
        <p>
          You can stop using the Service at any time, and close your account by emailing us at <Email />. We may suspend or
          close your account if you break these Terms, don’t pay fees that are due, or use the Service in a way
          that harms us or others. When an account is closed, access ends and we delete its data as described in
          our Privacy Policy.
        </p>
      </Section>

      <Section title="11. Disclaimers">
        <p>
          The Service is provided “as is” and “as available,” without warranties of any kind, express or implied,
          including merchantability, fitness for a particular purpose and non-infringement. We don’t warrant that
          the Service will be error-free, secure or uninterrupted, or that every issue reported by customers will
          reach you.
        </p>
      </Section>

      <Section title="12. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Cleanpulse will not be liable for any indirect, incidental,
          special, consequential or punitive damages, or for lost profits, data or goodwill, arising from your use
          of the Service — including any loss resulting from an alert that was delayed or not delivered.
        </p>
        <p>
          Our total liability for any claim relating to the Service will not exceed the greater of (a) the amount
          you paid us in the 12 months before the claim, or (b) $100 USD.
        </p>
      </Section>

      <Section title="13. Governing law">
        <p>
          These Terms are governed by the laws of the State of Rhode Island, without regard to its conflict of laws
          principles. Any disputes will be resolved in the state or federal courts located in Rhode Island.
        </p>
      </Section>

      <Section title="14. Changes to these Terms">
        <p>
          We may update these Terms from time to time. We’ll tell account holders about material changes by email
          or in the Service at least 14 days before they take effect. Continuing to use the Service after that
          means you accept the updated Terms.
        </p>
      </Section>

      <Section title="15. Contact">
        <p>Questions about these Terms? Email <Email />. Cleanpulse is a product of Beginnings LLC, Rhode Island.</p>
      </Section>
    </article>
  )
}
