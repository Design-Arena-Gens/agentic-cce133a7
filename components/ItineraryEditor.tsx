'use client';

import { getActivitiesForCity } from "../lib/activities";
import { DayPlan } from "../lib/types";

interface ItineraryEditorProps {
  destination: string;
  dayPlans: DayPlan[];
  onRemoveActivity: (activityId: string) => void;
  onSwapActivity: (activityId: string, replacementId: string) => void;
  onAdjustDuration: (activityId: string, duration: number) => void;
}

export function ItineraryEditor({
  destination,
  dayPlans,
  onRemoveActivity,
  onSwapActivity,
  onAdjustDuration
}: ItineraryEditorProps) {
  const catalog = getActivitiesForCity(destination);

  return (
    <div className="grid gap-4">
      <h2 className="text-lg font-semibold text-slate-800">
        Destination itinerary
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {dayPlans.map((plan) => (
          <div
            key={plan.day}
            className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <header className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">Day {plan.day}</p>
                <p className="text-sm text-slate-600">{plan.theme}</p>
              </div>
              <div className="grid text-right text-xs text-slate-500">
                <span>Duration {plan.totalDurationHours}h</span>
                <span>Budget ${plan.totalCostUsd}</span>
              </div>
            </header>
            <div className="grid gap-3">
              {plan.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        {activity.name}
                      </h3>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {activity.startTime} – {activity.endTime} · {activity.type}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {activity.summary}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Est. cost ${activity.costEstimateUsd} · Recommended duration{" "}
                        {activity.recommendedDurationHours}h
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => onRemoveActivity(activity.id)}
                        className="rounded-lg border border-transparent bg-slate-200 px-2 py-1 font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        Remove
                      </button>
                      <SwapMenu
                        activityId={activity.id}
                        catalog={catalog.filter((item) => item.id !== activity.id)}
                        onSwap={onSwapActivity}
                      />
                      <DurationMenu
                        activityId={activity.id}
                        current={activity.recommendedDurationHours}
                        onSet={onAdjustDuration}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SwapMenu({
  activityId,
  catalog,
  onSwap
}: {
  activityId: string;
  catalog: ReturnType<typeof getActivitiesForCity>;
  onSwap: (activityId: string, replacementId: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="font-medium text-slate-500">Swap</span>
      <select
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
        onChange={(event) => {
          if (event.target.value) {
            onSwap(activityId, event.target.value);
          }
        }}
        defaultValue=""
      >
        <option value="">Pick alternative…</option>
        {catalog.map((activity) => (
          <option key={activity.id} value={activity.id}>
            {activity.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function DurationMenu({
  activityId,
  current,
  onSet
}: {
  activityId: string;
  current: number;
  onSet: (activityId: string, duration: number) => void;
}) {
  return (
    <label className="grid gap-1 text-xs">
      <span className="font-medium text-slate-500">Duration</span>
      <select
        className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
        value={current}
        onChange={(event) => onSet(activityId, Number(event.target.value))}
      >
        {[1, 1.5, 2, 2.5, 3, 4].map((value) => (
          <option key={value} value={value}>
            {value}h
          </option>
        ))}
      </select>
    </label>
  );
}
