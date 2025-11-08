'use client';

import { useMemo, useState } from "react";
import { PlannerForm } from "../components/PlannerForm";
import { TransportOptions } from "../components/TransportOptions";
import { ItineraryEditor } from "../components/ItineraryEditor";
import { MapView } from "../components/MapView";
import { applyEdit, buildPlannerResult } from "../lib/planner";
import { PlannerResult } from "../lib/types";

export default function HomePage() {
  const [goal, setGoal] = useState(
    "Plan a 2-day trip to Tokyo from New Delhi with a mix of food and culture."
  );
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [editLog, setEditLog] = useState<string[]>([]);

  const handlePlan = async (nextGoal: string) => {
    setGoal(nextGoal);
    setLoading(true);
    await delay(450);
    const draft = buildPlannerResult({
      goal: nextGoal,
      originGuess: extractOrigin(nextGoal),
      destinationGuess: extractDestination(nextGoal)
    });
    setResult(draft);
    setEditLog([]);
    setLoading(false);
  };

  const handleChangeTransport = (id: string) => {
    if (!result) return;
    const updated = applyEdit(result, {
      type: "changeTransport",
      payload: { transportId: id }
    });
    setResult(updated);
    setEditLog((log) => [
      `Switched transport to ${updated.selectedTransport.mode.toUpperCase()}.`,
      ...log
    ]);
  };

  const handleRemove = (activityId: string) => {
    if (!result) return;
    const updated = applyEdit(result, {
      type: "removeActivity",
      payload: { activityId }
    });
    setResult(pruneEmptyDays(updated));
    setEditLog((log) => [`Removed ${activityId} from the plan.`, ...log]);
  };

  const handleSwap = (activityId: string, replacementId: string) => {
    if (!result) return;
    const updated = applyEdit(result, {
      type: "swapActivity",
      payload: { activityId, replacementId }
    });
    setResult(updated);
    setEditLog((log) => [`Swapped ${activityId} with ${replacementId}.`, ...log]);
  };

  const handleAdjustDuration = (activityId: string, duration: number) => {
    if (!result) return;
    const updated = applyEdit(result, {
      type: "adjustDuration",
      payload: { activityId, durationHours: duration }
    });
    setResult(updated);
    setEditLog((log) => [
      `Adjusted ${activityId} duration to ${duration}h.`,
      ...log
    ]);
  };

  const highlightAction = useMemo(() => {
    if (!result) return null;
    const firstActivity = result.dayPlans[0]?.activities[0];
    if (!firstActivity) return null;
    return {
      activityId: firstActivity.id,
      suggestion: `Try swapping ${firstActivity.name} with an alternative from the drop-down to see the agent rebalance the plan.`
    };
  }, [result]);

  return (
    <main className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:py-16">
      <header className="grid gap-2">
        <p className="text-xs uppercase tracking-[0.4em] text-blue-500">
          Agentic travel prototype
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
          Goal-driven planner that turns a travel brief into a mapped, optimized trip
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Enter any 2-day goal, and the agent will infer the route, weigh transport
          trade-offs, craft a realistic schedule, and visualize the entire plan. Use the
          editing controls to nudge the plan and watch it re-optimize instantly.
        </p>
      </header>

      <PlannerForm defaultGoal={goal} onPlan={handlePlan} loading={loading} />

      {result && (
        <section className="grid gap-8">
          <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <TransportOptions
              options={result.transportOptions}
              current={result.selectedTransport}
              onSelect={handleChangeTransport}
            />

            <ItineraryEditor
              destination={result.destination.name}
              dayPlans={result.dayPlans}
              onRemoveActivity={handleRemove}
              onSwapActivity={handleSwap}
              onAdjustDuration={handleAdjustDuration}
            />

            {highlightAction && (
              <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {highlightAction.suggestion}
              </div>
            )}

            <section className="grid gap-2">
              <h3 className="text-sm font-semibold text-slate-700">
                Agent reasoning
              </h3>
              <ul className="grid gap-1 text-sm text-slate-600">
                {result.agentLog.map((entry, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </section>
          </section>

          <section className="grid gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Spatial preview</h2>
            <MapView result={result} />
          </section>

          {editLog.length > 0 && (
            <section className="grid gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
              <h3 className="font-semibold uppercase tracking-wide text-emerald-700">
                Live edits
              </h3>
              <ul className="grid gap-1">
                {editLog.map((entry, index) => (
                  <li key={`${entry}-${index}`} className="flex items-start gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      )}
    </main>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractDestination(goal: string) {
  const match = goal.match(/to\s+([a-z\s]+)/i);
  return match ? match[1] : undefined;
}

function extractOrigin(goal: string) {
  const match = goal.match(/from\s+([a-z\s]+)/i);
  return match ? match[1] : undefined;
}

function pruneEmptyDays(result: PlannerResult): PlannerResult {
  return {
    ...result,
    dayPlans: result.dayPlans.filter((plan) => plan.activities.length > 0)
  };
}
