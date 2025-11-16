/**
 * Holding Pattern Calculator - Mathematical Utilities
 * 
 * Purpose: Pure calculation functions for holding pattern wind corrections
 * Logic: Uses standard aviation formulas for drift, wind correction angles, and timing
 * Assumptions: All angles in degrees (0-359), speeds in knots
 */

/**
 * Normalizes an angle to 0-359° range
 * @param angle - Any angle in degrees
 * @returns Normalized angle between 0 and 359
 */
export function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

/**
 * Computes the signed difference between wind direction and course
 * Negative = wind from left, Positive = wind from right
 * 
 * @param windDir - Wind direction in degrees (0-359)
 * @param course - Course in degrees (0-359)
 * @returns Signed angle difference (-180 to +180)
 */
export function signedAngleDiff(windDir: number, course: number): number {
  const raw = normalizeAngle(windDir - course);
  return raw > 180 ? raw - 360 : raw;
}

/**
 * Computes crosswind component using clock system
 * Clock system rounds to CLOSEST quarter marker:
 * - Closest to 0° → 0 (no crosswind)
 * - Closest to 15° → 1/4 crosswind
 * - Closest to 30° → 1/2 crosswind
 * - Closest to 45° → 3/4 crosswind
 * - Closest to 60°+ → Full crosswind
 * 
 * @param angle - Angle between wind and course (0-90°)
 * @param windSpeed - Wind speed in knots
 * @returns Crosswind component in knots
 */
export function computeCrosswindComponent(angle: number, windSpeed: number): number {
  const absAngle = Math.abs(angle);
  
  // Round to closest quarter marker
  // 0-7.5° → 0, 7.5-22.5° → 15°, 22.5-37.5° → 30°, 37.5-52.5° → 45°, 52.5+ → 60°
  if (absAngle < 7.5) return 0;                    // Closest to 0°
  if (absAngle < 22.5) return windSpeed * 0.25;   // Closest to 15° → 1/4 crosswind
  if (absAngle < 37.5) return windSpeed * 0.5;    // Closest to 30° → 1/2 crosswind
  if (absAngle < 52.5) return windSpeed * 0.75;   // Closest to 45° → 3/4 crosswind
  return windSpeed;                                 // Closest to 60°+ → Full crosswind
}

/**
 * Computes single drift angle using clock system
 * 
 * Steps:
 * 1. Find which leg (inbound or outbound) is closer to wind direction
 * 2. Calculate angle between wind and that leg
 * 3. Use clock system to find crosswind component
 * 4. Calculate drift: (60 × crosswind) / TAS
 * 
 * @param windDirection - Wind direction in degrees (0-359)
 * @param inboundCourse - Inbound course in degrees (0-359)
 * @param outboundCourse - Outbound course in degrees (0-359)
 * @param windSpeed - Wind speed in knots
 * @param tas - True airspeed in knots
 * @returns Object with drift angle and which leg was used
 */
export function computeSingleDrift(
  windDirection: number,
  inboundCourse: number,
  outboundCourse: number,
  windSpeed: number,
  tas: number
): { drift: number; angleToInbound: number; angleToOutbound: number; usedLeg: 'inbound' | 'outbound'; relativeAngle: number; crosswind: number } {
  // Calculate angles to both legs
  const angleToInbound = Math.abs(signedAngleDiff(windDirection, inboundCourse));
  const angleToOutbound = Math.abs(signedAngleDiff(windDirection, outboundCourse));
  
  // Use whichever leg is closer
  const usedLeg = angleToInbound <= angleToOutbound ? 'inbound' : 'outbound';
  const relativeAngle = usedLeg === 'inbound' ? angleToInbound : angleToOutbound;
  
  // Get crosswind component using clock system
  const crosswind = computeCrosswindComponent(relativeAngle, windSpeed);
  
  // Calculate drift: (60 × crosswind) / TAS
  const drift = tas > 0 ? (60 * crosswind) / tas : 0;
  
  return {
    drift,
    angleToInbound,
    angleToOutbound,
    usedLeg,
    relativeAngle,
    crosswind
  };
}

/**
 * Estimates head/tail wind component using quarter-clock method
 * 
 * Logic:
 * - 0-15° from nose: 100% component (factor = 1.0)
 * - 15-45°: 75% component (factor = 0.75)
 * - 45-75°: 50% component (factor = 0.5)
 * - 75-90°: 25% component (factor = 0.25)
 * 
 * @param angleFromNose - Angle from aircraft nose (0-90°)
 * @returns Factor to multiply wind speed by (0.25-1.0)
 */
export function computeQuarterClockFactor(angleFromNose: number): number {
  const absAngle = Math.abs(angleFromNose);
  if (absAngle < 15) return 1.0;
  if (absAngle < 45) return 0.75;
  if (absAngle < 75) return 0.5;
  return 0.25;
}

/**
 * Computes all holding pattern corrections
 * 
 * @param windDirection - Wind direction in degrees magnetic
 * @param windSpeed - Wind speed in knots
 * @param inboundCourse - Inbound course in degrees magnetic
 * @param groundspeed - Aircraft groundspeed in knots
 * @returns Complete set of holding pattern calculations
 */
export interface HoldingCalculation {
  outboundCourse: number;
  singleDrift: number;
  maxDrift: number;
  inboundHeading: number;
  outboundHeading: number;
  outboundTime: number;
  headTailComponentKt: number;
  outboundAngleFromTrack: number;
  // Single drift calculation details
  driftAngleToInbound: number;
  driftAngleToOutbound: number;
  driftUsedLeg: 'inbound' | 'outbound';
  driftRelativeAngle: number;
  driftCrosswind: number;
  // Timing calculation details
  timingAngleFromTail: number;
  timingAngleFromHead: number;
  timingIsTailwind: boolean;
  timingEffectiveAngle: number;
  timingAlongTrackWind: number;
}

export function calculateHoldingPattern(
  windDirection: number,
  windSpeed: number,
  inboundCourse: number,
  tas: number
): HoldingCalculation {
  // Normalize inputs
  const windDirNorm = normalizeAngle(windDirection);
  const inboundCourseNorm = normalizeAngle(inboundCourse);
  
  // Outbound course is 180° opposite
  const outboundCourse = normalizeAngle(inboundCourseNorm + 180);
  
  // Calculate single drift using clock system
  const driftResult = computeSingleDrift(windDirNorm, inboundCourseNorm, outboundCourse, windSpeed, tas);
  const singleDrift = driftResult.drift;
  
  // Calculate max drift using simple formula
  const tasNmPerMin = tas / 60;
  const maxDrift = tasNmPerMin > 0 ? windSpeed / tasNmPerMin : 0;
  
  // Inbound heading: course ± single drift
  const inboundDiff = signedAngleDiff(windDirNorm, inboundCourseNorm);
  const inboundWindFromLeft = inboundDiff < 0;
  const inboundHeading = normalizeAngle(
    inboundWindFromLeft
      ? inboundCourseNorm - singleDrift
      : inboundCourseNorm + singleDrift
  );
  
  // Outbound heading: course ± triple drift
  const outboundDiff = signedAngleDiff(windDirNorm, outboundCourse);
  const outboundWindFromLeft = outboundDiff < 0;
  const outboundDrift = 3 * singleDrift;
  const outboundHeading = normalizeAngle(
    outboundWindFromLeft
      ? outboundCourse - outboundDrift
      : outboundCourse + outboundDrift
  );
  
  // Compute outbound timing adjustment using TIMING clock method
  // Different from drift calculation!
  
  // Step 1: Define headwind and tailwind zones using ±90° rule
  // Headwind zone: outbound_heading ± 90°
  const headwindStart = normalizeAngle(outboundCourse - 90);
  const headwindEnd = normalizeAngle(outboundCourse + 90);
  
  // Tailwind zone: opposite direction ± 90°
  const tailDirection = normalizeAngle(outboundCourse + 180);
  
  // Step 2: Check if wind is in headwind or tailwind zone
  function isInRange(value: number, start: number, end: number): boolean {
    if (start <= end) {
      return value >= start && value <= end;
    } else {
      // Range wraps around 360°
      return value >= start || value <= end;
    }
  }
  
  const inHeadwindZone = isInRange(windDirNorm, headwindStart, headwindEnd);
  const isHeadwind = inHeadwindZone;
  const isTailwind = !isHeadwind;
  
  // Step 3: Calculate angle from reference direction
  const referenceDirection = isHeadwind ? outboundCourse : tailDirection;
  let angleFromReference = Math.abs(windDirNorm - referenceDirection);
  if (angleFromReference > 180) angleFromReference = 360 - angleFromReference;
  
  // Use the OPPOSITE angle (90° - angle) for clock method
  const effectiveAngle = 90 - angleFromReference;
  
  // Store detailed angles for display
  let angleFromHead = Math.abs(windDirNorm - outboundCourse);
  if (angleFromHead > 180) angleFromHead = 360 - angleFromHead;
  
  let angleFromTail = Math.abs(windDirNorm - tailDirection);
  if (angleFromTail > 180) angleFromTail = 360 - angleFromTail;
  
  // Timing clock method: round to closest marker (based on 60°)
  // 15°, 30°, 45°, 60°
  let timingFactor: number;
  if (effectiveAngle < 7.5) {
    timingFactor = 0.0;  // 0° = no effect
  } else if (effectiveAngle < 22.5) {
    timingFactor = 0.25;  // 15° = 1/4
  } else if (effectiveAngle < 37.5) {
    timingFactor = 0.5;  // 30° = 1/2
  } else if (effectiveAngle < 52.5) {
    timingFactor = 0.75;  // 45° = 3/4
  } else {
    timingFactor = 1.0;  // 60°+ = full
  }
  
  const alongTrackWind = windSpeed * timingFactor;
  
  // Direct conversion: knots = seconds (no TAS division)
  // Headwind: add time (fly longer), Tailwind: subtract time (fly shorter)
  const timingCorrection = isHeadwind ? alongTrackWind : -alongTrackWind;
  
  let outboundTime = 60 + timingCorrection;
  outboundTime = Math.max(10, Math.min(180, outboundTime));
  
  return {
    outboundCourse,
    singleDrift,
    maxDrift,
    inboundHeading,
    outboundHeading,
    outboundTime: Math.round(outboundTime),
    headTailComponentKt: alongTrackWind,
    outboundAngleFromTrack: effectiveAngle,
    // Single drift details
    driftAngleToInbound: driftResult.angleToInbound,
    driftAngleToOutbound: driftResult.angleToOutbound,
    driftUsedLeg: driftResult.usedLeg,
    driftRelativeAngle: driftResult.relativeAngle,
    driftCrosswind: driftResult.crosswind,
    // Timing details
    timingAngleFromHead: angleFromHead,
    timingAngleFromTail: angleFromTail,
    timingIsTailwind: isTailwind,
    timingEffectiveAngle: effectiveAngle,
    timingAlongTrackWind: alongTrackWind,
  };
}
