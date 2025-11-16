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
 * Computes single drift angle (maximum wind correction angle)
 * Formula: Wind Speed (kt) / Groundspeed (NM/min)
 * 
 * @param windSpeed - Wind speed in knots
 * @param groundspeed - Groundspeed in knots
 * @returns Drift angle in degrees
 */
export function computeSingleDrift(windSpeed: number, groundspeed: number): number {
  const gsNmPerMin = groundspeed / 60;
  if (gsNmPerMin <= 0) return 0;
  return windSpeed / gsNmPerMin;
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
  inboundHeading: number;
  outboundHeading: number;
  outboundTime: number;
  headTailComponentKt: number;
  outboundAngleFromTrack: number;
}

export function calculateHoldingPattern(
  windDirection: number,
  windSpeed: number,
  inboundCourse: number,
  groundspeed: number
): HoldingCalculation {
  // Normalize inputs
  const windDirNorm = normalizeAngle(windDirection);
  const inboundCourseNorm = normalizeAngle(inboundCourse);
  
  // Outbound course is 180° opposite
  const outboundCourse = normalizeAngle(inboundCourseNorm + 180);
  
  // Calculate single drift (max WCA)
  const singleDrift = computeSingleDrift(windSpeed, groundspeed);
  
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
  
  // Compute outbound timing adjustment
  const absLegDiff = Math.abs(outboundDiff);
  const angleFromNose = absLegDiff <= 90 ? absLegDiff : 180 - absLegDiff;
  const factor = computeQuarterClockFactor(angleFromNose);
  const headTailComponentKt = windSpeed * factor;
  const isHeadwind = absLegDiff <= 90;
  const signedHeadTailKt = isHeadwind ? headTailComponentKt : -headTailComponentKt;
  
  // Start with 60s, adjust by head/tail component, clamp to reasonable range
  let outboundTime = 60 - signedHeadTailKt;
  outboundTime = Math.max(10, Math.min(180, outboundTime));
  
  return {
    outboundCourse,
    singleDrift,
    inboundHeading,
    outboundHeading,
    outboundTime: Math.round(outboundTime),
    headTailComponentKt,
    outboundAngleFromTrack: absLegDiff,
  };
}
