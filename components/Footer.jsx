import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A1628] border-border mt-16">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              DEMO.CRAZY (Team Equinox)
            </h2>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Stay informed with balanced perspectives. We bring you curated
              news stories with transparency on media bias and coverage.
            </p>
          </div>

          {/* Quick Links (categories removed for now to avoid 404s) */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Explore
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="text-text-secondary">World</li>
              <li className="text-text-secondary">Business</li>
              <li className="text-text-secondary">Technology</li>
              <li className="text-text-secondary">Sports</li>
            </ul>
          </div>

          {/* Legal + Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Support
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-text-secondary hover:text-accent"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-secondary hover:text-accent"
                >
                  Privacy Policy
                </Link>
              </li>
              <li className="text-text-secondary">Terms of Service</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-center text-sm text-text-secondary">
          <p>© {new Date().getFullYear()} DEMO.CRAZY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
