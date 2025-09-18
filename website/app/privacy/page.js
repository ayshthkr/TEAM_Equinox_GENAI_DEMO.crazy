"use client";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

      <p className="text-zinc-400 mb-6">
        Your privacy is important to us. This Privacy Policy explains how
        NEWS.app collects, uses, and protects your information when you use our
        platform.
      </p>

      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            1. Information We Collect
          </h2>
          <p>
            We collect limited information to improve your experience, including
            browsing preferences, saved articles, and optional account details
            (like email) if you register.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To personalize your news feed and recommendations</li>
            <li>To analyze engagement and improve our platform</li>
            <li>
              To communicate with you about updates, if you opt in to
              notifications
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            3. Data Sharing
          </h2>
          <p>
            We do not sell or rent your data. We may share anonymized analytics
            with partners to improve content quality, but your personal
            information remains secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            4. Cookies & Tracking
          </h2>
          <p>
            NEWS.app uses cookies and similar technologies to remember
            preferences and analyze traffic. You can control cookies through
            your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            5. Your Rights
          </h2>
          <p>
            You can request deletion of your data at any time by contacting us.
            If you have an account, you may also update or remove your
            information from your profile settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">
            6. Updates to this Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be reflected here with the date of revision.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center text-zinc-500 text-sm">
        Last updated: September 2025 <br />
        Questions?{" "}
        <a
          href="mailto:support@newsapp.com"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
