import React, { useState } from "react";
import InputField from "./InputField";
import ResultCard from "./ResultCard";
import ThemeToggle from "./ThemeToggle";
import { calculateHoldingPattern, normalizeAngle, signedAngleDiff } from "../utils/calculations";
import type { HoldingResults } from "../types";

/**
 * HoldingCalculator - Main Application Component
 * 
 * Purpose: Interactive calculator for holding pattern wind corrections
 * Features:
 * - Input validation
 * - Real-time calculations
 * - Expandable math breakdowns
 * - Dark mode support
 * - Responsive design
 */
const HoldingCalculator: React.FC = () => {
  // Input state
  const [windDirection, setWindDirection] = useState<string>("170");
  const [windSpeed, setWindSpeed] = useState<string>("16");
  const [inboundCourse, setInboundCourse] = useState<string>("48");
  const [groundspeed, setGroundspeed] = useState<string>("120");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<HoldingResults | null>(null);

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCalculate = () => {
    setError(null);

    // Parse and validate inputs
    const windDirNum = Number(windDirection);
    const windSpdNum = Number(windSpeed);
    const inboundCrsNum = Number(inboundCourse);
    const gsNum = Number(groundspeed);

    if ([windDirNum, windSpdNum, inboundCrsNum, gsNum].some((v) => Number.isNaN(v))) {
      setError("Please enter valid numeric values.");
      setResults(null);
      return;
    }

    if (gsNum <= 0) {
      setError("Groundspeed must be greater than 0.");
      setResults(null);
      return;
    }

    // Perform calculations
    const calculatedResults = calculateHoldingPattern(
      windDirNum,
      windSpdNum,
      inboundCrsNum,
      gsNum
    );

    setResults(calculatedResults);
  };

  // Parse numeric values for display in math breakdowns
  const inboundCourseNum = Number(inboundCourse);
  const gsNum = Number(groundspeed);
  const windDirNum = Number(windDirection);
  const windSpdNum = Number(windSpeed);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header with Theme Toggle */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-wide text-gray-900 dark:text-neutral-50">
              HOLDING CORRECTION CALCULATOR
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-neutral-300 mt-2 max-w-2xl">
              Enter magnetic wind, inbound course, and groundspeed to compute drift, headings
              (single & triple drift), and suggested outbound timing. Expand each card to see
              the exact formulas and numbers behind the result.
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* INPUTS SECTION */}
        <section className="p-5 bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-700/30 dark:border-neutral-700">
          <h2 className="text-sm font-semibold mb-4 text-gray-800 dark:text-neutral-100 tracking-wide">
            INPUTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputField
              label="WIND DIRECTION (°M)"
              value={windDirection}
              onChange={setWindDirection}
            />
            <InputField label="WIND SPEED (KT)" value={windSpeed} onChange={setWindSpeed} />
            <InputField
              label="INBOUND COURSE (°M)"
              value={inboundCourse}
              onChange={setInboundCourse}
            />
            <InputField
              label="GROUNDSPEED (KT)"
              value={groundspeed}
              onChange={setGroundspeed}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCalculate}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              CALCULATE
            </button>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* RESULTS SECTION */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-neutral-100 tracking-wide">
            RESULTS
          </h2>
          {!results && (
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              Enter values and press CALCULATE to see headings, drift, and outbound timing.
            </p>
          )}

          {results && (
            <div className="space-y-4">
              {/* OUTBOUND COURSE */}
              <ResultCard
                title="Outbound course"
                value={`${results.outboundCourse.toFixed(0)}°M`}
                expanded={!!expanded.outboundCourse}
                onToggle={() => toggleExpanded("outboundCourse")}
                subtitle="Inbound track plus 180°, normalized to 0–359°."
              >
                <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-neutral-200 whitespace-pre-wrap">
{`inboundCourse = ${normalizeAngle(inboundCourseNum || 0).toFixed(0)}°
outboundCourse = inboundCourse + 180°
                = ${normalizeAngle(inboundCourseNum || 0).toFixed(0)}° + 180°
                = ${results.outboundCourse.toFixed(0)}°M (normalized)`}
                </pre>
              </ResultCard>

              {/* SINGLE DRIFT */}
              <ResultCard
                title="Single drift (max WCA)"
                value={`${results.singleDrift.toFixed(1)}°`}
                expanded={!!expanded.singleDrift}
                onToggle={() => toggleExpanded("singleDrift")}
                subtitle="Wind correction angle for the inbound leg."
              >
                <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-neutral-200 whitespace-pre-wrap">
{`GS = ${gsNum.toFixed(0)} kt
GS (NM/min) = GS / 60 = ${(gsNum / 60).toFixed(2)} NM/min
Wind speed = ${windSpdNum.toFixed(0)} kt

singleDrift = Wind speed / GS(NM/min)
            = ${windSpdNum.toFixed(0)} / ${(gsNum / 60).toFixed(2)}
            ≈ ${results.singleDrift.toFixed(1)}°`}
                </pre>
              </ResultCard>

              {/* INBOUND HEADING */}
              <ResultCard
                title="Inbound heading"
                value={`${results.inboundHeading.toFixed(0)}°M`}
                expanded={!!expanded.inboundHeading}
                onToggle={() => toggleExpanded("inboundHeading")}
                subtitle="Inbound course corrected by one drift angle into the wind."
              >
                {(() => {
                  const inboundNorm = normalizeAngle(inboundCourseNum || 0);
                  const diff = signedAngleDiff(windDirNum || 0, inboundNorm);
                  const side = diff < 0 ? "LEFT" : "RIGHT";
                  const op = diff < 0 ? "-" : "+";
                  return (
                    <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-neutral-200 whitespace-pre-wrap">
{`windDir = ${normalizeAngle(windDirNum || 0).toFixed(0)}°M
inboundCourse = ${inboundNorm.toFixed(0)}°M

signedAngleDiff = windDir - inboundCourse
                 = ${diff.toFixed(1)}° → wind from ${side}

inboundHeading = inboundCourse ${op} singleDrift
               = ${inboundNorm.toFixed(0)}° ${op} ${results.singleDrift.toFixed(1)}°
               ≈ ${results.inboundHeading.toFixed(0)}°M`}
                    </pre>
                  );
                })()}
              </ResultCard>

              {/* OUTBOUND HEADING */}
              <ResultCard
                title="Outbound heading (triple drift)"
                value={`${results.outboundHeading.toFixed(0)}°M`}
                expanded={!!expanded.outboundHeading}
                onToggle={() => toggleExpanded("outboundHeading")}
                subtitle="Outbound course corrected by three times the drift angle."
              >
                {(() => {
                  const inboundNorm = normalizeAngle(inboundCourseNum || 0);
                  const outboundCourseCalc = normalizeAngle(inboundNorm + 180);
                  const diff = signedAngleDiff(windDirNum || 0, outboundCourseCalc);
                  const side = diff < 0 ? "LEFT" : "RIGHT";
                  const op = diff < 0 ? "-" : "+";
                  const outboundDrift = 3 * results.singleDrift;
                  return (
                    <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-neutral-200 whitespace-pre-wrap">
{`windDir = ${normalizeAngle(windDirNum || 0).toFixed(0)}°M
outboundCourse = ${outboundCourseCalc.toFixed(0)}°M

signedAngleDiff = windDir - outboundCourse
                 = ${diff.toFixed(1)}° → wind from ${side}

outboundDrift = 3 × singleDrift
              = 3 × ${results.singleDrift.toFixed(1)}°
              ≈ ${outboundDrift.toFixed(1)}°

outboundHeading = outboundCourse ${op} outboundDrift
                = ${outboundCourseCalc.toFixed(0)}° ${op} ${outboundDrift.toFixed(1)}°
                ≈ ${results.outboundHeading.toFixed(0)}°M`}
                    </pre>
                  );
                })()}
              </ResultCard>

              {/* OUTBOUND TIME */}
              <ResultCard
                title="Outbound time"
                value={`${results.outboundTime} s`}
                expanded={!!expanded.outboundTime}
                onToggle={() => toggleExpanded("outboundTime")}
                subtitle="Starts from 60 s and is adjusted using a quarter-clock estimate of the head/tailwind component."
              >
                <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-neutral-200 whitespace-pre-wrap">
{`|wind - outboundCourse| = ${results.outboundAngleFromTrack.toFixed(1)}°
angleFromNose = min(Δ, 180° - Δ) → 0–90°
quarter-clock factor → head/tail component ≈ ${results.headTailComponentKt.toFixed(1)} kt

If component is headwind → subtract seconds from 60
If component is tailwind → add seconds to 60

outboundTime ≈ 60 s − signed(head/tail component in kt)
            ≈ ${results.outboundTime} s (clamped to [10, 180])`}
                </pre>
              </ResultCard>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HoldingCalculator;
