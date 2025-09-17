// components/MarketDashboard.tsx
export default function MarketDashboard() {
  return (
<div className="flex flex-col bg-surface border border-border rounded-2xl shadow-2xl 
                w-[260px] h-[700px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-3 border-b border-border bg-background/60">
        <span className="inline-flex items-center justify-center bg-accent/20 text-accent rounded-full w-10 h-10">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path
              d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10M4 17h16M4 17l2.5-3 3.5 4.5 4.5-6L20 17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className="text-xl font-bold tracking-tight">Market Dashboard</h3>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-6 space-y-6">
        {/* Market Stats */}
        <div>
          <div className="flex justify-between items-center text-base text-text-secondary mb-3">
            <span className="font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
              S&amp;P 500
            </span>
            <span className="font-semibold text-success">+0.82%</span>
          </div>
          <div className="flex justify-between items-center text-base text-text-secondary mb-3">
            <span className="font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error inline-block"></span>
              NASDAQ
            </span>
            <span className="font-semibold text-error">-0.41%</span>
          </div>
          <div className="flex justify-between items-center text-base text-text-secondary">
            <span className="font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
              Dow Jones
            </span>
            <span className="font-semibold text-success">+0.15%</span>
          </div>
        </div>

        {/* Market Outlook Graph */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-text-primary">Market Outlook</span>
            <span className="text-xs text-text-secondary">Last 7 days</span>
          </div>
          <div className="bg-surface rounded-lg p-3">
            <svg
              viewBox="0 0 200 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-16"
            >
              <polyline
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                points="0,50 30,40 60,45 90,30 120,20 150,25 180,10 200,15"
              />
              <circle cx="200" cy="15" r="4" fill="var(--color-accent)" />
            </svg>
          </div>
        </div>

        {/* Trending Companies */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-text-primary">Trending Companies</span>
            <span className="text-xs text-text-secondary">Today</span>
          </div>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white rounded-full w-7 h-7 flex items-center justify-center">
                  <img src="https://logo.clearbit.com/apple.com" alt="Apple" className="w-5 h-5" />
                </span>
                <span className="font-medium text-text-primary">Apple</span>
              </div>
              <span className="text-success font-semibold text-sm">+1.2%</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white rounded-full w-7 h-7 flex items-center justify-center">
                  <img src="https://logo.clearbit.com/microsoft.com" alt="Microsoft" className="w-5 h-5" />
                </span>
                <span className="font-medium text-text-primary">Microsoft</span>
              </div>
              <span className="text-success font-semibold text-sm">+0.9%</span>
            </li>
            <li className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-white rounded-full w-7 h-7 flex items-center justify-center">
                  <img src="https://logo.clearbit.com/tesla.com" alt="Tesla" className="w-5 h-5" />
                </span>
                <span className="font-medium text-text-primary">Tesla</span>
              </div>
              <span className="text-error font-semibold text-sm">-0.4%</span>
            </li>
          </ul>
        </div>

        {/* Weather Widget */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center bg-accent/20 text-accent rounded-full w-14 h-14">
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="6" fill="var(--color-accent)" />
                  <path
                    d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-text-primary">27°C</div>
              <div className="text-sm text-text-secondary">Sunny · New Delhi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
