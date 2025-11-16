/**
 * Type definitions for Holding Calculator
 */

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
  children: React.ReactNode;
}
