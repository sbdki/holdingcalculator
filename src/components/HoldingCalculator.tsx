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
          <section className="space-y-4">
            <div className="space-y-4">
              {/* OUTBOUND COURSE */}
              <ResultCard
                title="Outbound course"
                value={`${results.outboundCourse.toFixed(0)}°M`}
                expanded={!!expanded.outboundCourse}
                onToggle={() => toggleExpanded("outboundCourse")}
                subtitle={inboundCourseNum < 180 ? "Inbound + 180°" : "Inbound - 180°"}
              >
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-base">Step 1: Start with inbound course</div>
                    <div className="text-sm">
                      Inbound Course = {Math.round(normalizeAngle(inboundCourseNum || 0))}°
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-base">Step 2: {inboundCourseNum < 180 ? 'Add' : 'Subtract'} 180° to get opposite direction</div>
                    <div className="space-y-1 text-sm">
                      <div>Outbound Course = Inbound Course {inboundCourseNum < 180 ? '+' : '-'} 180°</div>
                      <div className="pl-4">= {Math.round(normalizeAngle(inboundCourseNum || 0))}° {inboundCourseNum < 180 ? '+' : '-'} 180°</div>
                      <div className="pl-4">= {Math.round(results.outboundCourse)}°M</div>
                    </div>
                  </div>
                </div>
              </ResultCard>

              {/* SINGLE DRIFT */}
              <ResultCard
                title="Single drift"
                value={`${Math.round(results.singleDrift)}°`}
                expanded={!!expanded.singleDrift}
                onToggle={() => toggleExpanded("singleDrift")}
                subtitle="Wind correction angle using clock system."
              >
                {(() => {
                  const clockLabels: Record<number, string> = {
                    0.25: "1/4 crosswind (15°)",
                    0.5: "1/2 crosswind (30°)",
                    0.75: "3/4 crosswind (45°)",
                    1.0: "Full crosswind (60°+)"
                  };
                  const crosswindFraction = results.driftCrosswind / windSpdNum;
                  const clockLabel = clockLabels[crosswindFraction] || `${(crosswindFraction * 100).toFixed(0)}% crosswind`;
                  
                  return (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 1: Find which leg is closer to wind direction</div>
                        <div className="space-y-1 text-sm">
                          <div>Wind Direction = {Math.round(normalizeAngle(windDirNum || 0))}°</div>
                          <div>Inbound Course = {Math.round(normalizeAngle(inboundCourseNum || 0))}°</div>
                          <div>Outbound Course = {Math.round(results.outboundCourse)}°</div>
                          <div className="pt-1">Angle to inbound = abs({Math.round(normalizeAngle(windDirNum || 0))}° - {Math.round(normalizeAngle(inboundCourseNum || 0))}°) = {Math.round(results.driftAngleToInbound)}°</div>
                          <div>Angle to outbound = abs({Math.round(normalizeAngle(windDirNum || 0))}° - {Math.round(results.outboundCourse)}°) = {Math.round(results.driftAngleToOutbound)}°</div>
                        </div>
                        <div className="text-gray-600 dark:text-neutral-400">
                          → Use {results.driftUsedLeg} ({results.driftUsedLeg === 'inbound' ? Math.round(normalizeAngle(inboundCourseNum || 0)) : Math.round(results.outboundCourse)}°) — relative angle = {Math.round(results.driftRelativeAngle)}°
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 2: Apply clock system to find crosswind</div>
                        <div className="text-gray-600 dark:text-neutral-400 text-sm">
                          Clock system rules:
                        </div>
                        <div className="space-y-1 text-xs bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                          <div>• 15° → 1/4 crosswind</div>
                          <div>• 30° → 1/2 crosswind</div>
                          <div>• 45° → 3/4 crosswind</div>
                          <div>• 60°+ → Full crosswind</div>
                        </div>
                        <div className="space-y-1 text-sm pt-2">
                          <div>Relative angle = {Math.round(results.driftRelativeAngle)}° → {clockLabel}</div>
                          <div>Wind Speed = {Math.round(windSpdNum)} kt</div>
                          <div className="pt-1">Crosswind component = {Math.round(results.driftCrosswind)} kt</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 3: Calculate drift value at {Math.round(tasNum)} kt TAS</div>
                        <div className="space-y-1 text-sm">
                          <div>Drift = (60 × crosswind) / TAS</div>
                          <div className="pl-4">= (60 × {Math.round(results.driftCrosswind)}) / {Math.round(tasNum)}</div>
                          <div className="pl-4">= {Math.round(60 * results.driftCrosswind)} / {Math.round(tasNum)}</div>
                          <div className="pl-4">= {Math.round(results.singleDrift)}°</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </ResultCard>

              {/* MAX DRIFT */}
              <ResultCard
                title="Max drift"
                value={`${Math.round(results.maxDrift)}°`}
                expanded={!!expanded.maxDrift}
                onToggle={() => toggleExpanded("maxDrift")}
                subtitle="Maximum possible wind correction angle (direct crosswind)."
              >
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-base">Step 1: Convert TAS to nautical miles per minute</div>
                    <div className="space-y-1 text-sm">
                      <div>TAS = {Math.round(tasNum)} kt</div>
                      <div>TAS (NM/min) = TAS / 60</div>
                      <div className="pl-4">= {Math.round(tasNum)} / 60</div>
                      <div className="pl-4">= {(tasNum / 60).toFixed(2)} NM/min</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-base">Step 2: Calculate max drift (full crosswind)</div>
                    <div className="space-y-1 text-sm">
                      <div>Wind Speed = {Math.round(windSpdNum)} kt</div>
                      <div className="pt-1">Max Drift = Wind Speed / TAS(NM/min)</div>
                      <div className="pl-4">= {Math.round(windSpdNum)} / {(tasNum / 60).toFixed(2)}</div>
                      <div className="pl-4">= {Math.round(results.maxDrift)}°</div>
                    </div>
                    <div className="text-gray-600 dark:text-neutral-400 text-sm pt-2">
                      → This is the maximum drift if wind was 90° crosswind
                    </div>
                  </div>
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
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 1: Determine which side the wind is from</div>
                        <div className="space-y-1 text-sm">
                          <div>Wind Direction = {Math.round(normalizeAngle(windDirNum || 0))}°M</div>
                          <div>Inbound Course = {Math.round(inboundNorm)}°M</div>
                          <div className="pt-1">Signed Angle Diff = Wind Dir - Inbound Course</div>
                          <div className="pl-4">= {Math.round(diff)}°</div>
                        </div>
                        <div className="text-gray-600 dark:text-neutral-400">
                          → Wind from {side}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 2: Apply drift correction</div>
                        <div className="space-y-1 text-sm">
                          <div>Inbound Heading = Inbound Course {op} Single Drift</div>
                          <div className="pl-4">= {Math.round(inboundNorm)}° {op} {Math.round(results.singleDrift)}°</div>
                          <div className="pl-4">= {Math.round(results.inboundHeading)}°M</div>
                        </div>
                      </div>
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
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 1: Determine which side the wind is from</div>
                        <div className="space-y-1 text-sm">
                          <div>Wind Direction = {Math.round(normalizeAngle(windDirNum || 0))}°M</div>
                          <div>Outbound Course = {Math.round(outboundCourseCalc)}°M</div>
                          <div className="pt-1">Signed Angle Diff = Wind Dir - Outbound Course</div>
                          <div className="pl-4">= {Math.round(diff)}°</div>
                        </div>
                        <div className="text-gray-600 dark:text-neutral-400">
                          → Wind from {side}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 2: Calculate triple drift</div>
                        <div className="space-y-1 text-sm">
                          <div>Outbound Drift = 3 × Single Drift</div>
                          <div className="pl-4">= 3 × {Math.round(results.singleDrift)}°</div>
                          <div className="pl-4">= {Math.round(outboundDrift)}°</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 3: Apply drift correction</div>
                        <div className="space-y-1 text-sm">
                          <div>Outbound Heading = Outbound Course {op} Outbound Drift</div>
                          <div className="pl-4">= {Math.round(outboundCourseCalc)}° {op} {Math.round(outboundDrift)}°</div>
                          <div className="pl-4">= {Math.round(results.outboundHeading)}°M</div>
                        </div>
                      </div>
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
                  
                  // Calculate angle for quarter-clock (WIND to COURSE, not nose!)
                  const angleWindToCourse = absLegDiff <= 90 ? absLegDiff : 180 - absLegDiff;
                  
                  // Determine quarter-clock factor
                  const getQuarterClockFactor = (angle: number): number => {
                    if (angle <= 15) return 1.0;
                    if (angle <= 45) return 0.75;
                    if (angle <= 75) return 0.5;
                    return 0.25;
                  };
                  const factor = getQuarterClockFactor(angleWindToCourse);
                  const factorLabel = factor === 1.0 ? "Full (×1.0)" : factor === 0.75 ? "3/4 (×0.75)" : factor === 0.5 ? "1/2 (×0.5)" : "1/4 (×0.25)";
                  
                  return (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 1: Find angle between wind and outbound course</div>
                        <div className="space-y-1 text-sm">
                          <div>Wind Direction = {Math.round(normalizeAngle(windDirNum || 0))}°</div>
                          <div>Outbound Course = {Math.round(results.outboundCourse)}°</div>
                          <div className="pt-1">Raw difference = abs({Math.round(normalizeAngle(windDirNum || 0))}° - {Math.round(results.outboundCourse)}°)</div>
                          <div className="pl-4">= {Math.round(absLegDiff)}°</div>
                        </div>
                        {absLegDiff > 90 && (
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-600 dark:text-neutral-400">
                              This is more than 90°, so we use the smaller angle:
                            </div>
                            <div className="pl-4">180° - {Math.round(absLegDiff)}° = {Math.round(angleWindToCourse)}°</div>
                          </div>
                        )}
                        <div className="pt-2 text-gray-600 dark:text-neutral-400">
                          {isHeadwind ? '→ This is a headwind (slows you down)' : '→ This is a tailwind (speeds you up)'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 2: Use the Quarter-Clock Method</div>
                        <div className="text-gray-600 dark:text-neutral-400 text-sm">
                          A pilot mental-math rule based on wind angle:
                        </div>
                        <div className="space-y-1 text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                          <div>• 0–15° from track → 100% component (×1.0)</div>
                          <div>• 15–45° → 75% component (×0.75)</div>
                          <div>• 45–75° → 50% component (×0.5)</div>
                          <div>• 75–90° → 25% component (×0.25)</div>
                        </div>
                        <div className="space-y-1 text-sm pt-2">
                          <div>Angle = {Math.round(angleWindToCourse)}° → Factor = {factorLabel}</div>
                          <div>Wind Speed = {Math.round(windSpdNum)} kt</div>
                          <div className="pt-1">Effective Component = Wind Speed × Factor</div>
                          <div className="pl-4">= {Math.round(windSpdNum)} × {factor.toFixed(2)}</div>
                          <div className="pl-4">= {Math.round(component)} kt</div>
                        </div>
                        <div className="pt-2 text-gray-600 dark:text-neutral-400">
                          {isHeadwind 
                            ? '→ Headwind: You\'ll cover less ground, so fly longer' 
                            : '→ Tailwind: You\'ll cover more ground, so fly shorter'}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-semibold text-base">Step 3: Adjust your timing</div>
                        <div className="space-y-1 text-sm">
                          <div>Standard outbound time = 60 seconds</div>
                          <div>Wind effect = {adjustment >= 0 ? '+' : ''}{Math.round(adjustment)} seconds</div>
                          <div className="pt-1">Final time = 60 {adjustment >= 0 ? '+' : ''} ({Math.round(adjustment)})</div>
                          <div className="pl-4">= {results.outboundTime} seconds</div>
                        </div>
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
