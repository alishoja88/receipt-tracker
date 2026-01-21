import { useEffect } from 'react';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              style={{ color: '#3B82F6' }}
            >
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-lg">Last updated: January 20, 2026</p>
          </div>

          {/* Content */}
          <div
            className="prose prose-invert max-w-none rounded-xl p-8"
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <div className="space-y-8 text-gray-300">
              {/* Introduction */}
              <section>
                <p className="text-lg">
                  Receiptly ("we", "us", "our") is a personal side project and portfolio application
                  created and operated by an individual developer based in Canada. This Privacy
                  Policy explains how we collect, use, and protect your personal information when
                  you use our web application.
                </p>
                <p className="text-lg mt-4">
                  By using Receiptly, you agree to the practices described in this Privacy Policy.
                </p>
              </section>

              {/* Who we are */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  1. Who we are
                </h2>
                <p>
                  Receiptly is a web application that helps you track your expenses by uploading
                  receipts and turning them into structured data and simple analytics. The app is
                  currently operated as a small-scale, non-commercial / portfolio project by an
                  individual developer residing in Canada.
                </p>
                <p className="mt-4">For any questions about this policy, you can contact:</p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:alishojaa88@gmail.com"
                      className="text-blue-400 hover:underline"
                    >
                      alishojaa88@gmail.com
                    </a>
                  </li>
                </ul>
              </section>

              {/* What information we collect */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  2. What information we collect
                </h2>

                <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#60A5FA' }}>
                  2.1. Account information
                </h3>
                <p>When you sign in using a third-party provider (such as Google OAuth):</p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Name / display name (as provided by your sign-in provider)</li>
                  <li>Email address</li>
                  <li>Sign-in provider information (e.g., "Signed in with Google")</li>
                </ul>
                <p className="mt-4">
                  We do <strong>not</strong> ask you to create a separate password for Receiptly.
                  Authentication is handled via OAuth.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#60A5FA' }}>
                  2.2. Receipt and usage data
                </h3>
                <p>When you use the app to process receipts, we may collect:</p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>
                    Structured receipt data, such as:
                    <ul className="list-circle list-inside mt-2 ml-4">
                      <li>Store name</li>
                      <li>Date of purchase</li>
                      <li>Total amount</li>
                      <li>Currency</li>
                      <li>Category (e.g., Grocery, Health, Education)</li>
                      <li>Payment method (e.g., Card, Cash, Other)</li>
                    </ul>
                  </li>
                  <li>Any manual edits you make to this data</li>
                </ul>
                <div
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <p className="font-semibold">Important:</p>
                  <ul className="list-disc list-inside mt-2 ml-4">
                    <li>
                      We <strong>do not permanently store</strong> the original receipt image or PDF
                      on our servers.
                    </li>
                    <li>
                      The image is used temporarily to send to third-party OCR / AI services, and
                      then discarded.
                    </li>
                    <li>
                      Only the <strong>structured data</strong> (like totals and categories) is
                      stored in our database for your account.
                    </li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#60A5FA' }}>
                  2.3. Technical and log data
                </h3>
                <p>
                  When you use Receiptly, some technical information may be collected automatically,
                  such as:
                </p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Basic usage logs (e.g., error logs, request logs)</li>
                </ul>
              </section>

              {/* How we use your information */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  3. How we use your information
                </h2>
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-2">
                  <li>
                    <strong>To provide the core functionality of the app</strong> - Let you sign in,
                    access your receipts, and view your expense summaries.
                  </li>
                  <li>
                    <strong>To process receipts</strong> - Convert uploaded receipts into structured
                    data using OCR and AI.
                  </li>
                  <li>
                    <strong>To improve the app</strong> - Diagnose issues, monitor performance, and
                    understand basic usage patterns.
                  </li>
                  <li>
                    <strong>To communicate with you (if needed)</strong> - For example, to respond
                    to your questions or support requests.
                  </li>
                </ul>
                <p className="mt-4">
                  We do <strong>not</strong> sell your personal information or receipt data to third
                  parties.
                </p>
              </section>

              {/* Third-party services */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  4. Third-party services and data sharing
                </h2>
                <p className="mb-4">
                  To provide Receiptly's functionality, we rely on third-party services. When you
                  use the app, certain data may be shared with these providers:
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#60A5FA' }}>
                  4.1. Authentication providers (OAuth)
                </h3>
                <p>
                  When you sign in with Google or another OAuth provider, they authenticate you and
                  send us your basic profile information (such as name and email) and a unique
                  identifier for your account.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#60A5FA' }}>
                  4.2. OCR (Optical Character Recognition) providers
                </h3>
                <p>
                  When you upload a receipt, the image or PDF may be sent to a cloud OCR / Document
                  AI service to recognize the text on the receipt. This may include all text on the
                  receipt, such as store name, items, dates, totals, and potentially sensitive
                  information if it appears on the receipt.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#60A5FA' }}>
                  4.3. AI / LLM providers
                </h3>
                <p>
                  After OCR, the extracted text may be sent to an AI / LLM API (for example,
                  OpenAI's API) to structure the text into JSON, assign categories to the receipt,
                  and split mixed receipts into meaningful segments per category.
                </p>
                <div
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="text-yellow-400">
                    You should assume that your receipt content passes through third-party servers
                    for processing. If you have highly sensitive receipts, you should consider
                    whether you are comfortable uploading them.
                  </p>
                </div>
              </section>

              {/* Data retention */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  5. Data retention
                </h2>
                <p>
                  We generally retain your data as long as your account exists. More specifically:
                </p>
                <ul className="list-disc list-inside mt-2 ml-4 space-y-2">
                  <li>
                    <strong>Account data (name, email):</strong> retained while your account is
                    active.
                  </li>
                  <li>
                    <strong>Structured receipt data:</strong> retained while your account is active,
                    unless you delete specific receipts.
                  </li>
                  <li>
                    <strong>Receipt images:</strong> not permanently stored by us; used temporarily
                    for processing and then discarded.
                  </li>
                  <li>
                    <strong>Logs:</strong> may be kept for a limited period for security and
                    debugging.
                  </li>
                </ul>
                <p className="mt-4">
                  If you would like your data to be deleted, contact us at{' '}
                  <a href="mailto:alishojaa88@gmail.com" className="text-blue-400 hover:underline">
                    alishojaa88@gmail.com
                  </a>{' '}
                  and request deletion of your data.
                </p>
              </section>

              {/* Security */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  6. Security
                </h2>
                <p>
                  We take reasonable technical and organizational measures to protect your
                  information, such as using HTTPS (TLS) to encrypt data in transit, storing
                  structured data in a controlled database environment, and restricting access to
                  the database and administrative interfaces.
                </p>
                <p className="mt-4">
                  However, no online service can guarantee perfect security. You use Receiptly at
                  your own risk.
                </p>
              </section>

              {/* Your rights */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  7. Your rights and choices
                </h2>
                <p>
                  Depending on your jurisdiction (for example, under Canadian privacy laws such as
                  PIPEDA and applicable provincial laws), you may have rights such as:
                </p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>The right to access the personal information we hold about you.</li>
                  <li>The right to request correction of inaccurate information.</li>
                  <li>
                    The right to request deletion of your data, subject to legal and technical
                    limitations.
                  </li>
                </ul>
                <p className="mt-4">
                  Please contact us at{' '}
                  <a href="mailto:alishojaa88@gmail.com" className="text-blue-400 hover:underline">
                    alishojaa88@gmail.com
                  </a>{' '}
                  to exercise any of these rights.
                </p>
              </section>

              {/* Children's privacy */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  8. Children's privacy
                </h2>
                <p>
                  Receiptly is not designed for, or intentionally directed at, children under the
                  age of 13. We do not knowingly collect personal information from children.
                </p>
              </section>

              {/* Changes to policy */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  9. Changes to this Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time as the app evolves or as legal
                  requirements change. When we make significant changes, we will update the "Last
                  updated" date at the top of this page.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#3B82F6' }}>
                  10. Contact
                </h2>
                <p>
                  If you have any questions, concerns, or requests related to this Privacy Policy or
                  to your personal data, you can contact:
                </p>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:alishojaa88@gmail.com"
                      className="text-blue-400 hover:underline"
                    >
                      alishojaa88@gmail.com
                    </a>
                  </li>
                </ul>
                <p className="mt-4">We will do our best to respond in a reasonable timeframe.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
