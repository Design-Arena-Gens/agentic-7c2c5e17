"use client";

import { useMemo, useState, type ReactNode } from "react";

type CoverageChannel = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  transferFee: number;
  maxSweep: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatCurrencyWithCents = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatPercent = (value: number) =>
  `${value.toFixed(0)}%`;

const maskedCardNumber = "XXXXXXXXXX5491";

const accountSnapshot = {
  creditLine: 15000,
  availableCredit: 8700,
  currentBalance: 6300,
  autopayDay: 17,
  lastReview: "Apr 9, 2024",
  institution: "Crescendo Bank",
};

const activities = [
  {
    id: "a1",
    title: "Coverage sweep from credit line",
    timestamp: "Apr 8, 2024 · 6:22 PM",
    amount: 260.32,
    status: "Settled",
    ref: "ACH-82741",
  },
  {
    id: "a2",
    title: "Alert acknowledged",
    timestamp: "Apr 7, 2024 · 9:14 AM",
    amount: 0,
    status: "Confirmed",
    ref: "ALRT-11293",
  },
  {
    id: "a3",
    title: "Linked account utilization check",
    timestamp: "Apr 4, 2024 · 11:05 AM",
    amount: 0,
    status: "Completed",
    ref: "AUD-99054",
  },
];

export default function OverdraftDashboard() {
  const [coverageEnabled, setCoverageEnabled] = useState(true);
  const [autoTransferEnabled, setAutoTransferEnabled] = useState(true);
  const [preferredBuffer, setPreferredBuffer] = useState(250);
  const [overdraftLimit, setOverdraftLimit] = useState(1200);
  const [scenarioAmount, setScenarioAmount] = useState(540);
  const [channels, setChannels] = useState<CoverageChannel[]>([
    {
      id: "creditLine",
      label: "Crescendo Reserve Credit",
      description: "Covers the primary checking account instantly with no interest for 30 days.",
      enabled: true,
      transferFee: 0,
      maxSweep: 1200,
    },
    {
      id: "savings",
      label: "High-Yield Savings · 0.45% APY",
      description: "Pulls from savings if the credit reserve has been exhausted.",
      enabled: true,
      transferFee: 2,
      maxSweep: 800,
    },
    {
      id: "external",
      label: "Linked Brokerage Account",
      description: "Initiates next-business-day transfer after approval if needed.",
      enabled: false,
      transferFee: 5,
      maxSweep: 2500,
    },
  ]);
  const [alertPreferences, setAlertPreferences] = useState({
    push: true,
    sms: true,
    email: false,
  });

  const activeChannels = useMemo(
    () => channels.filter((channel) => channel.enabled),
    [channels],
  );

  const potentialCoverage = useMemo(() => {
    if (!coverageEnabled) return 0;
    const channelCapacity = activeChannels.reduce(
      (total, channel) => total + channel.maxSweep,
      0,
    );
    return Math.min(overdraftLimit, channelCapacity, accountSnapshot.availableCredit);
  }, [coverageEnabled, activeChannels, overdraftLimit]);

  const uncoveredAmount = Math.max(scenarioAmount - potentialCoverage, 0);
  const coverageRatio = potentialCoverage === 0 ? 0 : Math.min((scenarioAmount / potentialCoverage) * 100, 100);

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === id ? { ...channel, enabled: !channel.enabled } : channel,
      ),
    );
  };

  return (
    <div className="relative isolate rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur">
      <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Overdraft Protection
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {accountSnapshot.institution} · {maskedCardNumber}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Manage how your reserve credit line shields your checking activity. Tune coverage, transfer priorities, and alerts to keep balances healthy without surprises.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
          type="button"
        >
          Run Health Check
        </button>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-4">
        <StatCard
          label="Credit Line"
          value={formatCurrency(accountSnapshot.creditLine)}
          hint={`Available: ${formatCurrency(accountSnapshot.availableCredit)}`}
        />
        <StatCard
          label="Current Balance"
          value={formatCurrency(accountSnapshot.currentBalance)}
          hint={`Autopay on day ${accountSnapshot.autopayDay}`}
        />
        <StatCard
          label="Protection Limit"
          value={formatCurrency(overdraftLimit)}
          hint={`Reviewed ${accountSnapshot.lastReview}`}
        />
        <StatCard
          label="Scenario Coverage"
          value={formatPercent(coverageRatio)}
          hint={`${formatCurrencyWithCents(potentialCoverage)} ready to deploy`}
        />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1.3fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Coverage Controls</h2>
                <p className="text-sm text-slate-400">Define how the reserve credit responds the moment a checking shortfall is detected.</p>
              </div>
              <Switch
                id="coverage"
                label={coverageEnabled ? "Enabled" : "Disabled"}
                active={coverageEnabled}
                onToggle={() => setCoverageEnabled((prev) => !prev)}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FieldCard
                title="Overdraft Limit"
                description="Set the maximum nightly sweep allowed from the credit reserve."
              >
                <input
                  aria-label="Overdraft limit"
                  className="w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-400"
                  type="range"
                  min={300}
                  max={3000}
                  step={50}
                  value={overdraftLimit}
                  onChange={(event) => setOverdraftLimit(Number(event.target.value))}
                />
                <p className="mt-2 text-sm text-slate-300">
                  {formatCurrency(overdraftLimit)} nightly cap
                </p>
              </FieldCard>

              <FieldCard
                title="Preferred Buffer"
                description="Keep this cushion in checking before a sweep is triggered."
              >
                <input
                  aria-label="Preferred buffer"
                  className="w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-400"
                  type="range"
                  min={50}
                  max={1000}
                  step={25}
                  value={preferredBuffer}
                  onChange={(event) => setPreferredBuffer(Number(event.target.value))}
                />
                <p className="mt-2 text-sm text-slate-300">Trigger when balance dips under {formatCurrency(preferredBuffer)}</p>
              </FieldCard>
            </div>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Transfer Priority
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">Enable the accounts you want to use and reorder priorities if needed. Sweeps follow this order until the limit is met.</p>
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
                  type="button"
                >
                  Optimize Order
                </button>
              </div>
              <div className="mt-4 space-y-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`channel-${channel.id}`}
                          label={channel.enabled ? "Active" : "Off"}
                          active={channel.enabled}
                          onToggle={() => toggleChannel(channel.id)}
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{channel.label}</p>
                          <p className="text-xs text-slate-400">{channel.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Fee {formatCurrencyWithCents(channel.transferFee)}</span>
                      <span>Max {formatCurrency(channel.maxSweep)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <h3 className="text-base font-semibold text-white">Automatic Transfers</h3>
                <p className="text-sm text-slate-400">
                  {autoTransferEnabled
                    ? "We will automatically sweep from the credit reserve when balances are projected to fall below your buffer."
                    : "No automatic sweeps will be triggered. You can enable them to avoid NSF events."}
                </p>
              </div>
              <Switch
                id="auto-transfer"
                label={autoTransferEnabled ? "Enabled" : "Disabled"}
                active={autoTransferEnabled}
                onToggle={() => setAutoTransferEnabled((prev) => !prev)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Scenario Planner</h2>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                {uncoveredAmount === 0 ? "Fully Covered" : "Coverage Gap"}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Model how the protection behaves against a projected overdraft. Adjust the amount to see remaining exposure after all sweeps complete.
            </p>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
              <label className="flex items-center justify-between text-sm text-slate-300" htmlFor="scenario-range">
                <span>Projected overdraft</span>
                <span className="font-semibold text-white">{formatCurrencyWithCents(scenarioAmount)}</span>
              </label>
              <input
                id="scenario-range"
                className="mt-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-indigo-400"
                type="range"
                min={100}
                max={2500}
                step={50}
                value={scenarioAmount}
                onChange={(event) => setScenarioAmount(Number(event.target.value))}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <ScenarioStat
                  label="Ready coverage"
                  value={formatCurrencyWithCents(potentialCoverage)}
                  accent="text-indigo-300"
                />
                <ScenarioStat
                  label="Uncovered balance"
                  value={formatCurrencyWithCents(uncoveredAmount)}
                  accent={uncoveredAmount === 0 ? "text-emerald-300" : "text-rose-300"}
                />
                <ScenarioStat
                  label="Coverage ratio"
                  value={formatPercent(coverageRatio)}
                  accent="text-sky-300"
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <h2 className="text-lg font-semibold text-white">Alerts & notifications</h2>
            <p className="mt-2 text-sm text-slate-400">
              Choose how you want to hear about sweeps, gaps, and coverage optimization suggestions.
            </p>
            <div className="mt-4 space-y-3">
              {(
                [
                  { id: "push", label: "Push notifications" },
                  { id: "sms", label: "SMS messages" },
                  { id: "email", label: "Email summaries" },
                ] as const
              ).map((option) => (
                <label
                  key={option.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-200"
                >
                  {option.label}
                  <input
                    checked={alertPreferences[option.id]}
                    onChange={() =>
                      setAlertPreferences((prev) => ({
                        ...prev,
                        [option.id]: !prev[option.id],
                      }))
                    }
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-indigo-400"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-sm text-indigo-200">
              <p className="font-medium">Smart nudges</p>
              <p className="mt-1 text-indigo-100/80">
                Stay ahead of NSF fees. We will warn you a full day earlier when projected activity exceeds {formatCurrency(preferredBuffer)}.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
            <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{activity.title}</p>
                      <p className="text-xs text-slate-400">{activity.timestamp}</p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{activity.status}</span>
                  </div>
                  {activity.amount !== 0 && (
                    <p className="mt-2 text-xs text-slate-400">
                      Transfer amount · {formatCurrencyWithCents(activity.amount)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">Reference {activity.ref}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-sm text-slate-200">
            <h2 className="text-lg font-semibold text-white">Coverage checklist</h2>
            <ul className="mt-3 space-y-3">
              <ChecklistItem
                done={coverageEnabled}
                label="Reserve credit enabled for same-day sweeps"
              />
              <ChecklistItem
                done={autoTransferEnabled}
                label="Automatic sweeps scheduled each evening"
              />
              <ChecklistItem
                done={activeChannels.length >= 2}
                label="At least two funding sources active"
              />
              <ChecklistItem
                done={alertPreferences.push || alertPreferences.sms}
                label="Real-time alert channel configured"
              />
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function FieldCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ScenarioStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[0.6rem] ${
          done
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
            : "border-slate-600 bg-slate-800 text-slate-500"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span>{label}</span>
    </li>
  );
}

function Switch({
  id,
  label,
  active,
  onToggle,
}: {
  id: string;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-indigo-400 bg-indigo-500/20 text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/30"
          : "border-slate-700 bg-slate-800/70 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
      }`}
    >
      <span
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${
          active ? "bg-indigo-400/80" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute left-0.5 inline-block h-3 w-3 rounded-full bg-white transition-transform ${
            active ? "translate-x-3.5" : "translate-x-0"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
