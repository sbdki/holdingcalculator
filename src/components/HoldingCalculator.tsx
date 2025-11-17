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
            Holding Heading Calculator
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
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                  <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                    <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — Calculate opposite direction</h3>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                      <div>Inbound Course = {Math.round(normalizeAngle(inboundCourseNum || 0))}°</div>
                      <div className="pt-2">Outbound Course = Inbound Course {inboundCourseNum < 180 ? '+' : '-'} 180°</div>
                      <div>= {Math.round(normalizeAngle(inboundCourseNum || 0))}° {inboundCourseNum < 180 ? '+' : '-'} 180°</div>
                      <div className="pt-2">= <strong>{Math.round(results.outboundCourse)}°M</strong></div>
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
                    0.25: "1/4 crosswind",
                    0.5: "1/2 crosswind",
                    0.75: "3/4 crosswind",
                    1.0: "Full crosswind"
                  };
                  const crosswindFraction = results.driftCrosswind / windSpdNum;
                  const clockLabel = clockLabels[crosswindFraction] || `${(crosswindFraction * 100).toFixed(0)}% crosswind`;
                  
                  return (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200 space-y-4">
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — Determine closest leg</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div><strong>Wind:</strong> {Math.round(normalizeAngle(windDirNum || 0))}° at {Math.round(windSpdNum)} kt</div>
                          <div><strong>Inbound course:</strong> {Math.round(normalizeAngle(inboundCourseNum || 0))}°</div>
                          <div><strong>Outbound course:</strong> {Math.round(results.outboundCourse)}°</div>
                          <div className="pt-2">Angle to inbound: {Math.round(results.driftAngleToInbound)}°</div>
                          <div>Angle to outbound: <strong>{Math.round(results.driftAngleToOutbound)}°</strong></div>
                          <div className="pt-2">➜ <strong>Use {results.driftUsedLeg} leg (smaller angle)</strong></div>
                          <div className="pt-2">Relative angle = {Math.round(results.driftRelativeAngle)}°</div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 2 — Apply clock system</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                          <div className="mb-3"><strong>Clock rules (round to closest):</strong></div>
                          <div className="space-y-0.5">
                            <div>Closest to 15° → ¼ crosswind</div>
                            <div>Closest to 30° → ½ crosswind</div>
                            <div>Closest to 45° → ¾ crosswind</div>
                            <div>Closest to 60°+ → Full crosswind</div>
                          </div>
                          <div className="pt-3 space-y-1">
                            <div>Relative angle: <strong>{Math.round(results.driftRelativeAngle)}° → {clockLabel.replace(/\s*\(.*?\)/, '')}</strong></div>
                            {(results.driftCrosswind / windSpdNum) === 1.0 ? (
                              <div className="pt-2">Crosswind = <strong>{Math.round(results.driftCrosswind)} kt</strong></div>
                            ) : (
                              <>
                                <div className="pt-2">Crosswind = {Math.round(windSpdNum)} kt × {(results.driftCrosswind / windSpdNum).toFixed(2)}</div>
                                <div>= <strong>{Math.round(results.driftCrosswind)} kt</strong></div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 3 — Compute drift</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div className="mb-3"><strong>Drift formula:</strong></div>
                          <div>(60 × crosswind) ÷ TAS</div>
                          <div className="pt-3">= (60 × {Math.round(results.driftCrosswind)}) ÷ {Math.round(tasNum)}</div>
                          <div>= {Math.round(60 * results.driftCrosswind)} ÷ {Math.round(tasNum)}</div>
                          <div className="pt-2">= <strong>{Math.round(results.singleDrift)}° drift</strong></div>
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
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                  <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                    <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — Simple rule</h3>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                      <div>Wind Speed = {Math.round(windSpdNum)} kt</div>
                      <div className="pt-2">Max Drift = Wind Speed ÷ 2</div>
                      <div>= {Math.round(windSpdNum)} ÷ 2</div>
                      <div className="pt-2">= <strong>{Math.round(results.maxDrift)}°</strong></div>
                      <div className="text-gray-600 dark:text-neutral-400 pt-2">
                        → Maximum drift if wind was 90° crosswind
                      </div>
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
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — Wind side</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div><strong>Wind Direction:</strong> {Math.round(normalizeAngle(windDirNum || 0))}°M</div>
                          <div><strong>Inbound Course:</strong> {Math.round(inboundNorm)}°M</div>
                          <div className="pt-2">Angle difference = {Math.round(normalizeAngle(windDirNum || 0))}° - {Math.round(inboundNorm)}°</div>
                          <div>= {Math.round(diff)}°</div>
                          <div className="pt-2">→ <strong>Wind from {side}</strong></div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 2 — Apply drift correction</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div>Inbound Heading = Inbound Course {op} Single Drift</div>
                          <div>= {Math.round(inboundNorm)}° {op} {Math.round(results.singleDrift)}°</div>
                          <div className="pt-2">= <strong>{Math.round(results.inboundHeading)}°M</strong></div>
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
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — Wind side</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div><strong>Wind Direction:</strong> {Math.round(normalizeAngle(windDirNum || 0))}°M</div>
                          <div><strong>Outbound Course:</strong> {Math.round(outboundCourseCalc)}°M</div>
                          <div className="pt-2">Angle difference = {Math.round(normalizeAngle(windDirNum || 0))}° - {Math.round(outboundCourseCalc)}°</div>
                          <div>= {Math.round(diff)}°</div>
                          <div className="pt-2">→ <strong>Wind from {side}</strong></div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 2 — Calculate triple drift</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div>Outbound Drift = 3 × Single Drift</div>
                          <div>= 3 × {Math.round(results.singleDrift)}°</div>
                          <div className="pt-2">= <strong>{Math.round(outboundDrift)}°</strong></div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 3 — Apply drift correction</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div>Outbound Heading = Outbound Course {op} Outbound Drift</div>
                          <div>= {Math.round(outboundCourseCalc)}° {op} {Math.round(outboundDrift)}°</div>
                          <div className="pt-2">= <strong>{Math.round(results.outboundHeading)}°M</strong></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </ResultCard>

              {/* OUTBOUND TIME */}
              <ResultCard
                title="Outbound time"
                value={(() => {
                  const totalSeconds = results.outboundTime;
                  const minutes = Math.floor(totalSeconds / 60);
                  const seconds = totalSeconds % 60;
                  return minutes > 0 ? `${minutes}m${seconds.toString().padStart(2, '0')}s` : `${seconds}s`;
                })()}
                expanded={!!expanded.outboundTime}
                onToggle={() => toggleExpanded("outboundTime")}
                subtitle="How long to fly outbound before turning back."
              >
                {(() => {
                  const isTailwind = results.timingIsTailwind;
                  const effectiveAngle = results.timingEffectiveAngle;
                  const alongTrackWind = results.timingAlongTrackWind;
                  
                  // Timing clock method factor (round to closest, based on 60°)
                  let timingFactor: number;
                  let timingLabel: string;
                  if (effectiveAngle < 7.5) {
                    timingFactor = 0.0;
                    timingLabel = "No effect";
                  } else if (effectiveAngle < 22.5) {
                    timingFactor = 0.25;
                    timingLabel = "1/4 wind";
                  } else if (effectiveAngle < 37.5) {
                    timingFactor = 0.5;
                    timingLabel = "1/2 wind";
                  } else if (effectiveAngle < 52.5) {
                    timingFactor = 0.75;
                    timingLabel = "3/4 wind";
                  } else {
                    timingFactor = 1.0;
                    timingLabel = "Full wind";
                  }
                  
                  // Direct conversion: knots = seconds
                  const timingCorrection = isTailwind ? -alongTrackWind : alongTrackWind;
                  
                  return (
                    <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — Determine headwind or tailwind zone</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div><strong>Wind FROM:</strong> {Math.round(normalizeAngle(windDirNum || 0))}°</div>
                          <div><strong>Outbound Heading:</strong> {Math.round(results.outboundCourse)}°</div>
                          <div className="pt-2"><strong>±90° Zone Rule:</strong></div>
                          <div>• Headwind zone: {Math.round(normalizeAngle(results.outboundCourse - 90))}° to {Math.round(normalizeAngle(results.outboundCourse + 90))}°</div>
                          <div>• Tailwind zone: {Math.round(normalizeAngle(results.outboundCourse + 90))}° to {Math.round(normalizeAngle(results.outboundCourse - 90))}°</div>
                          <div className="pt-2">Wind {Math.round(normalizeAngle(windDirNum || 0))}° is in the <strong>{isTailwind ? 'tailwind' : 'headwind'} zone</strong></div>
                          <div className="pt-2">→ <strong>{isTailwind ? 'Tailwind' : 'Headwind'}</strong> (effective angle = {Math.round(effectiveAngle)}°)</div>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 2 — Timing clock method</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg">
                          <div className="mb-3"><strong>Timing clock rules (based on 60°):</strong></div>
                          <div className="space-y-0.5">
                            <div>• 15° → 1/4 wind</div>
                            <div>• 30° → 1/2 wind</div>
                            <div>• 45° → 3/4 wind</div>
                            <div>• 60° → Full wind</div>
                          </div>
                          <div className="pt-3 space-y-1">
                            <div>Effective angle: {Math.round(effectiveAngle)}° → <strong>{timingLabel}</strong></div>
                            {timingFactor > 0 && (
                              <>
                                <div className="pt-2">Wind component = {Math.round(windSpdNum)} kt × {timingFactor === 1 ? '1' : timingFactor.toFixed(2)} = <strong>{Math.round(alongTrackWind)} kt</strong></div>
                                <div className="pt-2">Direct conversion: <strong>{Math.round(alongTrackWind)} kt = {Math.round(alongTrackWind)} seconds</strong></div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                        <h3 className="mt-0 mb-3 text-lg font-semibold">Step 3 — Calculate final time</h3>
                        <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                          <div>Standard time = 60 seconds</div>
                          <div className="pt-2">It's a <strong>{isTailwind ? 'tailwind' : 'headwind'}</strong>, so we {isTailwind ? 'subtract' : 'add'} that time</div>
                          <div className="pt-2">Final time = 60 {timingCorrection >= 0 ? '+' : ''} {Math.round(timingCorrection)}</div>
                          <div>= <strong>{(() => {
                            const totalSeconds = results.outboundTime;
                            const minutes = Math.floor(totalSeconds / 60);
                            const seconds = totalSeconds % 60;
                            return minutes > 0 ? `${minutes}m${seconds.toString().padStart(2, '0')}s` : `${seconds}s`;
                          })()}</strong></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </ResultCard>

              {/* GATE 1 */}
              <ResultCard
                title="Gate 1"
                value={`${Math.round(results.gate1Heading)}°M`}
                expanded={!!expanded.gate1}
                onToggle={() => toggleExpanded("gate1")}
                subtitle="At 90° through turn: check radial and adjust bank."
              >
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                  <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                    <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — When to check</h3>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                      <div><strong>Inbound heading:</strong> {Math.round(results.inboundHeading)}°</div>
                      <div><strong>After 90° turn:</strong> {Math.round(results.gate1Heading)}°</div>
                      <div className="pt-2">At heading <strong>{Math.round(results.gate1Heading)}°</strong>, check radial position:</div>
                      <div className="pt-2">• <strong>Left of radial?</strong> → Tighten turn (more bank)</div>
                      <div>• <strong>Right of radial?</strong> → Shallow turn (less bank)</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                    <h3 className="mt-0 mb-3 text-lg font-semibold">Step 2 — Target</h3>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                      <div><strong>Goal:</strong> Roll out <strong>30° off</strong> the outbound track</div>
                      <div>Outbound course: {Math.round(results.outboundCourse)}°</div>
                      <div>Target rollout: ~<strong>{Math.round(normalizeAngle(results.outboundCourse + 30))}°</strong></div>
                      <div className="pt-2">This is predictive — don't wait for CDI!</div>
                      <div className="pt-2">✅ <strong>Result:</strong> Perfect outbound leg setup</div>
                    </div>
                  </div>
                </div>
              </ResultCard>

              {/* GATE 2 */}
              <ResultCard
                title="Gate 2"
                value={`${Math.round(results.gate2Heading)}°M`}
                expanded={!!expanded.gate2}
                onToggle={() => toggleExpanded("gate2")}
                subtitle="At 60° before inbound: check radial and roll out 10° early."
              >
                <div className="text-sm leading-relaxed text-gray-700 dark:text-neutral-200">
                  <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5 mb-4">
                    <h3 className="mt-0 mb-3 text-lg font-semibold">Step 1 — When to check</h3>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                      <div><strong>Inbound course:</strong> {Math.round(normalizeAngle(inboundCourseNum || 0))}°</div>
                      <div><strong>60° before inbound:</strong> {Math.round(normalizeAngle((inboundCourseNum || 0) + 60))}°</div>
                      <div className="pt-2">At heading <strong>{Math.round(normalizeAngle((inboundCourseNum || 0) + 60))}°</strong>, check radial:</div>
                      <div className="pt-2">• <strong>Overshooting?</strong> (radial inside) → More bank</div>
                      <div>• <strong>Undershooting?</strong> (radial outside) → Less bank</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-neutral-600 rounded-xl p-5">
                    <h3 className="mt-0 mb-3 text-lg font-semibold">Step 2 — Target rollout</h3>
                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-1">
                      <div><strong>Goal:</strong> Roll out <strong>10° before</strong> inbound course</div>
                      <div className="pt-2">Inbound course: {Math.round(normalizeAngle(inboundCourseNum || 0))}°</div>
                      <div>Target rollout: <strong>{Math.round(results.gate2Heading)}°</strong></div>
                      <div className="pt-2">CDI will center naturally as you align</div>
                      <div className="pt-2">✅ <strong>Result:</strong> Perfect inbound, no overshoot!</div>
                    </div>
                  </div>
                </div>
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
