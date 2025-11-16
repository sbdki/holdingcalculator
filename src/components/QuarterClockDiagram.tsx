/**
 * QuarterClockDiagram Component
 * 
 * Purpose: Visual representation of the quarter-clock method
 * Shows the angle between WIND DIRECTION and OUTBOUND COURSE
 * (NOT the aircraft nose - heading is irrelevant!)
 */

interface QuarterClockDiagramProps {
  windDirection: number;
  outboundCourse: number;
  angleWindToCourse: number;
  windSpeed: number;
  component: number;
}

const QuarterClockDiagram = ({ windDirection, outboundCourse, angleWindToCourse, windSpeed, component }: QuarterClockDiagramProps) => {
  // Determine which zone the angle falls into
  const getZone = (angle: number) => {
    if (angle < 15) return 0;
    if (angle < 45) return 1;
    if (angle < 75) return 2;
    return 3;
  };

  const currentZone = getZone(angleWindToCourse);
  
  const zones = [
    { label: '0-15°', factor: '×1.0', color: 'from-red-500 to-orange-500', textColor: 'text-red-600' },
    { label: '15-45°', factor: '×0.75', color: 'from-orange-400 to-yellow-400', textColor: 'text-orange-600' },
    { label: '45-75°', factor: '×0.5', color: 'from-yellow-400 to-green-400', textColor: 'text-yellow-600' },
    { label: '75-90°', factor: '×0.25', color: 'from-green-400 to-blue-400', textColor: 'text-green-600' },
  ];

  // Normalize angles to 0-360
  const normWind = windDirection % 360;
  const normCourse = outboundCourse % 360;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Clock Circle */}
      <div className="relative w-80 h-80">
        <svg className="w-full h-full" viewBox="0 0 240 240">
          {/* Define gradients for each zone */}
          <defs>
            {zones.map((zone, idx) => (
              <linearGradient key={idx} id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={zone.color.includes('red') ? '#ef4444' : 
                                              zone.color.includes('orange') ? '#f97316' :
                                              zone.color.includes('yellow') ? '#facc15' : '#22c55e'} 
                      stopOpacity={currentZone === idx ? "0.5" : "0.2"} />
                <stop offset="100%" stopColor={zone.color.includes('orange') && !zone.color.includes('red') ? '#fb923c' :
                                                zone.color.includes('yellow') && !zone.color.includes('orange') ? '#fde047' :
                                                zone.color.includes('green') ? '#4ade80' : '#60a5fa'} 
                      stopOpacity={currentZone === idx ? "0.5" : "0.2"} />
              </linearGradient>
            ))}
          </defs>

          {/* Full circle background (light gray) */}
          <circle cx="120" cy="120" r="100" fill="#f3f4f6" className="dark:fill-neutral-800" />
          
          {/* Quarter-clock zones radiating FROM outbound course */}
          {[0, 1, 2, 3].map((idx) => {
            const startAngle = idx === 0 ? 0 : idx === 1 ? 15 : idx === 2 ? 45 : 75;
            const endAngle = idx === 0 ? 15 : idx === 1 ? 45 : idx === 2 ? 75 : 90;
            
            // These angles are relative to outbound course, not north
            // Add outbound course to rotate zones
            const absStart = (normCourse + startAngle) % 360;
            const absEnd = (normCourse + endAngle) % 360;
            
            // Convert to SVG path (0° = top = -90° in standard coords)
            const start = ((absStart - 90) * Math.PI) / 180;
            const end = ((absEnd - 90) * Math.PI) / 180;
            
            const x1 = 120 + 100 * Math.cos(start);
            const y1 = 120 + 100 * Math.sin(start);
            const x2 = 120 + 100 * Math.cos(end);
            const y2 = 120 + 100 * Math.sin(end);
            
            const largeArc = 0; // Always small arcs (15°, 30°, 30°, 15°)
            
            return (
              <path
                key={idx}
                d={`M 120 120 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={`url(#gradient-${idx})`}
                stroke={currentZone === idx ? '#3b82f6' : '#d1d5db'}
                strokeWidth={currentZone === idx ? '3' : '1.5'}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Clock circle outline */}
          <circle cx="120" cy="120" r="100" fill="none" stroke="#9ca3af" strokeWidth="2" className="dark:stroke-neutral-600" />

          {/* Cardinal direction markers - only show quarter */}
          <g className="fill-gray-700 dark:fill-gray-300">
            {/* 0° - North (top) */}
            <text x="120" y="22" textAnchor="middle" className="text-sm font-bold">0°</text>
            {/* 90° - East (right) */}
            <text x="215" y="125" textAnchor="middle" className="text-sm font-bold">90°</text>
            {/* 180° - South (bottom) */}
            <text x="120" y="220" textAnchor="middle" className="text-sm font-bold">180°</text>
            {/* 270° - West (left) */}
            <text x="25" y="125" textAnchor="middle" className="text-sm font-bold">270°</text>
          </g>

          {/* Quarter-clock labels (15°, 45°, 75° marks) */}
          <g className="fill-gray-700 dark:fill-gray-300 text-xs font-semibold" transform={`rotate(${normCourse}, 120, 120)`}>
            {/* 15° mark - rotated with course */}
            <text x="190" y="70" textAnchor="middle">
              <tspan x="190" dy="0">15°</tspan>
              <tspan x="190" dy="12">3/4</tspan>
            </text>
            {/* 45° mark */}
            <text x="200" y="120" textAnchor="middle">
              <tspan x="200" dy="0">45°</tspan>
              <tspan x="200" dy="12">1/2</tspan>
            </text>
            {/* 75° mark */}
            <text x="190" y="170" textAnchor="middle">
              <tspan x="190" dy="0">75°</tspan>
              <tspan x="190" dy="12">1/4</tspan>
            </text>
          </g>

          {/* Center circle */}
          <circle cx="120" cy="120" r="12" fill="#1f2937" stroke="#6b7280" strokeWidth="2" />
          
          {/* Outbound course line (reference axis) */}
          <g transform={`rotate(${normCourse}, 120, 120)`}>
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="25"
              stroke="#10b981"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="6,4"
            />
            {/* Outbound label on the line */}
            <text x="120" y="18" textAnchor="middle" className="text-xs font-bold fill-green-600 dark:fill-green-400">
              <tspan x="120" dy="0">OUTBOUND</tspan>
            </text>
            {/* Full label at 0° */}
            <text x="120" y="38" textAnchor="middle" className="text-xs font-bold fill-gray-700 dark:fill-gray-300">
              <tspan x="120" dy="0">Full</tspan>
              <tspan x="120" dy="12">60s</tspan>
            </text>
          </g>
          
          {/* Wind direction pointer */}
          <g transform={`rotate(${normWind}, 120, 120)`}>
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="30"
              stroke="#ef4444"
              strokeWidth="5"
              strokeLinecap="round"
              className="drop-shadow-lg"
            />
            {/* Arrow head */}
            <polygon
              points="120,25 113,38 127,38"
              fill="#ef4444"
              className="drop-shadow-lg"
            />
            <text x="120" y="50" textAnchor="middle" className="text-xs font-bold fill-red-600 dark:fill-red-400">
              WIND
            </text>
          </g>
        </svg>

      </div>

      {/* Angle display - moved to the right side */}
      <div className="bg-white dark:bg-neutral-800 px-4 py-3 rounded-lg shadow-lg border-2 border-blue-500">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Wind to Course Angle</div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
          {angleWindToCourse.toFixed(0)}°
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-md text-sm">
        {zones.map((zone, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg border-2 transition-all ${
              currentZone === idx
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={currentZone === idx ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-neutral-400'}>
                {zone.label}
              </span>
              <span className={`font-mono font-bold ${currentZone === idx ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-neutral-300'}`}>
                {zone.factor}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Calculation summary */}
      <div className="w-full max-w-md p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-neutral-300">Wind Speed:</span>
            <span className="font-semibold text-gray-900 dark:text-neutral-100">{windSpeed} kt</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-neutral-300">Factor:</span>
            <span className="font-semibold text-gray-900 dark:text-neutral-100">{zones[currentZone].factor}</span>
          </div>
          <div className="border-t border-blue-300 dark:border-blue-700 my-1"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-neutral-300">Wind Effect:</span>
            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{component.toFixed(0)} kt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterClockDiagram;
