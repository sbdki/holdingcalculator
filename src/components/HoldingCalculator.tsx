import { useState } from "react";
import InputField from "./InputField";
import ResultCard from "./ResultCard";
import ThemeToggle from "./ThemeToggle";
import Footer from "./Footer";
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
const HoldingCalculator = () => {
  // Input state
  const [windDirection, setWindDirection] = useState<string>("170");
  const [windSpeed, setWindSpeed] = useState<string>("16");
  const [inboundCourse, setInboundCourse] = useState<string>("48");
  const [tas, setTas] = useState<string>("120");

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
    const tasNum = Number(tas);

    if ([windDirNum, windSpdNum, inboundCrsNum, tasNum].some((v) => Number.isNaN(v))) {
      setError("Please enter valid numeric values.");
      setResults(null);
      return;
    }

    if (tasNum <= 0) {
      setError("TAS must be greater than 0.");
      setResults(null);
      return;
    }

    // Perform calculations
    const calculatedResults = calculateHoldingPattern(
      windDirNum,
      windSpdNum,
      inboundCrsNum,
      tasNum
    );

    setResults(calculatedResults);
  };

  // Parse numeric values for display in math breakdowns
  const inboundCourseNum = Number(inboundCourse);
  const tasNum = Number(tas);
  const windDirNum = Number(windDirection);
  const windSpdNum = Number(windSpeed);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-8">
        {/* Header with Theme Toggle */}
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-neutral-50">
            Holding Calculator
          </h1>
          <ThemeToggle />
        </header>

        {/* INPUTS SECTION */}
        <section className="p-5 bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-700/30 dark:border-neutral-700">
          <h2 className="text-sm font-semibold mb-4 text-gray-800 dark:text-neutral-100 tracking-wide">
            Data
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
              label="TAS (KT)"
              value={tas}
              onChange={setTas}
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
        {results && (
          <section className="space-y-4">(
            <div className="space-y-4">
              {/* OUTBOUND COURSE */}
              <ResultCard
                title="Outbound course"
                value={`${results.outboundCourse.toFixed(0)}°M`}
                expanded={!!expanded.outboundCourse}
                onToggle={() => toggleExpanded("outboundCourse")}
                subtitle="Inbound track plus 180°, normalized to 0–359°."
              >
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-1 font-mono">
                  <div>Inbound Course = {normalizeAngle(inboundCourseNum || 0).toFixed(0)}°</div>
                  <div>Outbound Course = Inbound Course + 180°</div>
                  <div className="pl-4">= {normalizeAngle(inboundCourseNum || 0).toFixed(0)}° + 180°</div>
                  <div className="pl-4">= {results.outboundCourse.toFixed(0)}°M (normalized)</div>
                </div>
              </ResultCard>

              {/* SINGLE DRIFT */}
              <ResultCard
                title="Single drift (max WCA)"
                value={`${results.singleDrift.toFixed(1)}°`}
                expanded={!!expanded.singleDrift}
                onToggle={() => toggleExpanded("singleDrift")}
                subtitle="Wind correction angle for the inbound leg."
              >
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-1 font-mono">
                  <div>TAS = {tasNum.toFixed(0)} kt</div>
                  <div>TAS (NM/min) = TAS / 60 = {(tasNum / 60).toFixed(2)} NM/min</div>
                  <div>Wind Speed = {windSpdNum.toFixed(0)} kt</div>
                  <div className="pt-2">Single Drift = Wind Speed / TAS(NM/min)</div>
                  <div className="pl-4">= {windSpdNum.toFixed(0)} / {(tasNum / 60).toFixed(2)}</div>
                  <div className="pl-4">≈ {results.singleDrift.toFixed(1)}°</div>
                </div>
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
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-1 font-mono">
                      <div>Wind Direction = {normalizeAngle(windDirNum || 0).toFixed(0)}°M</div>
                      <div>Inbound Course = {inboundNorm.toFixed(0)}°M</div>
                      <div className="pt-2">Signed Angle Diff = Wind Dir - Inbound Course</div>
                      <div className="pl-4">= {diff.toFixed(1)}° → wind from {side}</div>
                      <div className="pt-2">Inbound Heading = Inbound Course {op} Single Drift</div>
                      <div className="pl-4">= {inboundNorm.toFixed(0)}° {op} {results.singleDrift.toFixed(1)}°</div>
                      <div className="pl-4">≈ {results.inboundHeading.toFixed(0)}°M</div>
                    </div>
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
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-1 font-mono">
                      <div>Wind Direction = {normalizeAngle(windDirNum || 0).toFixed(0)}°M</div>
                      <div>Outbound Course = {outboundCourseCalc.toFixed(0)}°M</div>
                      <div className="pt-2">Signed Angle Diff = Wind Dir - Outbound Course</div>
                      <div className="pl-4">= {diff.toFixed(1)}° → wind from {side}</div>
                      <div className="pt-2">Outbound Drift = 3 × Single Drift</div>
                      <div className="pl-4">= 3 × {results.singleDrift.toFixed(1)}°</div>
                      <div className="pl-4">≈ {outboundDrift.toFixed(1)}°</div>
                      <div className="pt-2">Outbound Heading = Outbound Course {op} Outbound Drift</div>
                      <div className="pl-4">= {outboundCourseCalc.toFixed(0)}° {op} {outboundDrift.toFixed(1)}°</div>
                      <div className="pl-4">≈ {results.outboundHeading.toFixed(0)}°M</div>
                    </div>
                  );
                })()}
              </ResultCard>

              {/* OUTBOUND TIME */}
              <ResultCard
                title="Outbound time"
                value={`${results.outboundTime} s`}
                expanded={!!expanded.outboundTime}
                onToggle={() => toggleExpanded("outboundTime")}
                subtitle="How long to fly outbound before turning back."
              >
                {(() => {
                  const absLegDiff = results.outboundAngleFromTrack;
                  const isHeadwind = absLegDiff <= 90;
                  const component = results.headTailComponentKt;
                  const adjustment = isHeadwind ? component : -component;
                  
                  return (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                      <div className="space-y-1">
                        <div className="font-semibold">Step 1: Check the wind angle</div>
                        <div>Wind angle to outbound track: {absLegDiff.toFixed(0)}°</div>
                        <div className="text-gray-600 dark:text-neutral-400">
                          {isHeadwind ? '→ This is a headwind (slows you down)' : '→ This is a tailwind (speeds you up)'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold">Step 2: Estimate wind effect (Quarter-Clock Method)</div>
                        <div className="text-gray-600 dark:text-neutral-400 text-xs space-y-1 mt-1">
                          <div>A pilot mental-math rule based on wind angle:</div>
                          <div className="pl-2">• 0–15° from nose → 100% component (×1.0)</div>
                          <div className="pl-2">• 15–45° → 75% component (×0.75)</div>
                          <div className="pl-2">• 45–75° → 50% component (×0.5)</div>
                          <div className="pl-2">• 75–90° → 25% component (×0.25)</div>
                        </div>
                        <div className="pt-2">Wind pushing you: ~{component.toFixed(0)} knots</div>
                        <div className="text-gray-600 dark:text-neutral-400">
                          {isHeadwind 
                            ? '→ You\'ll cover less ground, so fly longer' 
                            : '→ You\'ll cover more ground, so fly shorter'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold">Step 3: Adjust your timing</div>
                        <div>Standard time: 60 seconds</div>
                        <div>Wind effect: {adjustment >= 0 ? '+' : ''}{adjustment.toFixed(0)} seconds</div>
                        <div className="font-semibold text-base pt-1">Final time: {results.outboundTime} seconds</div>
                      </div>
                    </div>
                  );
                })()}
              </ResultCard>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default HoldingCalculator;
