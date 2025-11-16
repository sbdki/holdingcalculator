/**
 * Type definitions for Holding Calculator
 */

import type { ReactNode } from "react";

export interface HoldingInputs {
  windDirection: string;
  windSpeed: string;
  inboundCourse: string;
  groundspeed: string;
}

export interface HoldingResults {
  outboundCourse: number;
  singleDrift: number;
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
}

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export interface ResultCardProps {
  title: string;
  subtitle?: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}
