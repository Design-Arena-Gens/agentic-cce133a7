'use client';

import { useState } from "react";
import { listCities } from "../lib/geo";

interface PlannerFormProps {
  defaultGoal: string;
  onPlan: (goal: string) => void;
  loading: boolean;
}

const cities = listCities();

export function PlannerForm({ defaultGoal, onPlan, loading }: PlannerFormProps) {
  const [goal, setGoal] = useState(defaultGoal);
  const [origin, setOrigin] = useState("New Delhi");
  const [destination, setDestination] = useState("Tokyo");

  return (
    <form
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        let customizedGoal = goal
          .replace(/to\s+[a-z\s]+/i, `to ${destination}`)
          .replace(/from\s+[a-z\s]+/i, `from ${origin}`);
        if (!/to\s+[a-z\s]+/i.test(customizedGoal)) {
          customizedGoal = `${customizedGoal} to ${destination}`;
        }
        if (!/from\s+[a-z\s]+/i.test(customizedGoal)) {
          customizedGoal = `${customizedGoal} from ${origin}`;
        }
        onPlan(customizedGoal);
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Travel goal</span>
        <textarea
          className="min-h-[80px] rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="Plan a 2-day trip to Tokyo from New Delhi with food and culture focus"
        />
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Origin</span>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
          >
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Destination</span>
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        disabled={loading}
      >
        {loading ? "Planning your trip…" : "Generate plan"}
      </button>
    </form>
  );
}
