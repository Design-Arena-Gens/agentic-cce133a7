'use client';

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { DayPlan, PlannerResult } from "../lib/types";

const LeafletMap = dynamic(
  async () => {
    const { MapContainer, TileLayer, Polyline, Marker, Tooltip } = await import(
      "react-leaflet"
    );
    return function MapWrapper({
      paths,
      markers,
      center
    }: {
      center: LatLngExpression;
      paths: { positions: LatLngExpression[]; color: string }[];
      markers: {
        position: LatLngExpression;
        color: string;
        label: string;
        description: string;
      }[];
    }) {
      return (
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={false}
          className="h-full w-full rounded-2xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {paths.map((path) => (
            <Polyline
              key={path.color}
              positions={path.positions}
              pathOptions={{ color: path.color, weight: 4, opacity: 0.65 }}
            />
          ))}
          {markers.map((marker) => (
            <Marker
              key={marker.label}
              position={marker.position}
              {...withIcon(coloredIcon(marker.color))}
            >
              <Tooltip direction="top">
                <div className="grid gap-1">
                  <strong>{marker.label}</strong>
                  <span className="text-xs">{marker.description}</span>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      );
    };
  },
  {
    ssr: false,
    loading: () => <div className="grid h-full place-items-center">Loading map…</div>
  }
);

const colors = ["#2563eb", "#fb923c"];

export function MapView({ result }: { result: PlannerResult | null }) {
  const { center, markers, paths } = useMemo(() => {
    if (!result) {
      return {
        center: [35.6762, 139.6503] as LatLngExpression,
        markers: [] as {
          position: LatLngExpression;
          color: string;
          label: string;
          description: string;
        }[],
        paths: [] as { positions: LatLngExpression[]; color: string }[]
      };
    }

    const originMarker = {
      position: [result.origin.lat, result.origin.lng] as LatLngExpression,
      color: "#0f172a",
      label: `Origin: ${result.origin.name}`,
      description: `Start city`
    };
    const destinationMarker = {
      position: [result.destination.lat, result.destination.lng] as LatLngExpression,
      color: "#16a34a",
      label: `Destination: ${result.destination.name}`,
      description: `Primary base`
    };

    const dayMarkers = toDayMarkers(result.dayPlans);
    const travelPath = {
      positions: [
        [result.origin.lat, result.origin.lng] as LatLngExpression,
        [result.destination.lat, result.destination.lng] as LatLngExpression
      ],
      color: "#0f172a"
    };

    return {
      center: [result.destination.lat, result.destination.lng] as LatLngExpression,
      markers: [originMarker, destinationMarker, ...dayMarkers],
      paths: [travelPath, ...toDayPaths(result.dayPlans)]
    };
  }, [result]);

  return (
    <div className="h-[520px] w-full">
      <LeafletMap center={center} markers={markers} paths={paths} />
    </div>
  );
}

function toDayMarkers(dayPlans: DayPlan[]) {
  return dayPlans.flatMap((plan) =>
    plan.activities.map((activity, index) => ({
      position: [activity.lat, activity.lng] as LatLngExpression,
      color: colors[plan.day - 1] ?? "#7c3aed",
      label: `Day ${plan.day}: ${activity.name}`,
      description: `${activity.startTime} – ${activity.endTime} · Stop ${
        index + 1
      }`
    }))
  );
}

function toDayPaths(dayPlans: DayPlan[]) {
  return dayPlans
    .map((plan) => ({
      color: colors[plan.day - 1] ?? "#7c3aed",
      positions: plan.activities.map(
        (activity) => [activity.lat, activity.lng] as LatLngExpression
      )
    }))
    .filter((plan) => plan.positions.length >= 2);
}

let leafletSingleton: typeof import("leaflet") | null = null;

function ensureLeaflet() {
  if (typeof window === "undefined") return null;
  if (!leafletSingleton) {
    leafletSingleton = require("leaflet");
  }
  return leafletSingleton;
}

function coloredIcon(color: string) {
  const leaflet = ensureLeaflet();
  if (!leaflet) return null;
  return leaflet.divIcon({
    html: `<span style="background:${color};border:2px solid rgba(15,23,42,0.8);width:18px;height:18px;display:block;border-radius:50%;box-shadow:0 0 6px rgba(15,23,42,0.35);"></span>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function withIcon(icon: ReturnType<typeof coloredIcon>) {
  if (!icon) return {};
  return { icon };
}
