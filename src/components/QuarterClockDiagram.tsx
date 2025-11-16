/**
 * QuarterClockDiagram Component
 * 
 * Purpose: Visual representation of the quarter-clock method
 * Shows wind angle zones with color-coded multiplier factors
 */

interface QuarterClockDiagramProps {
  angleFromNose: number;
  windSpeed: number;
  component: number;
}

const QuarterClockDiagram = ({ angleFromNose, windSpeed, component }: QuarterClockDiagramProps) => {
  // Determine which zone the angle falls into
  const getZone = (angle: number) => {
    if (angle < 15) return 0;
    if (angle < 45) return 1;
    if (angle < 75) return 2;
    return 3;
  };

  const currentZone = getZone(angleFromNose);
  
  const zones = [
    { label: '0-15°', factor: '×1.0', color: 'from-red-500 to-orange-500', textColor: 'text-red-600' },
    { label: '15-45°', factor: '×0.75', color: 'from-orange-400 to-yellow-400', textColor: 'text-orange-600' },
    { label: '45-75°', factor: '×0.5', color: 'from-yellow-400 to-green-400', textColor: 'text-yellow-600' },
    { label: '75-90°', factor: '×0.25', color: 'from-green-400 to-blue-400', textColor: 'text-green-600' },
  ];

  // Calculate pointer rotation (0° = top, clockwise)
  const pointerRotation = angleFromNose;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Clock Circle */}
      <div className="relative w-64 h-64">
        {/* Background circle with zones */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Define gradients for each zone */}
          <defs>
            {zones.map((zone, idx) => (
              <linearGradient key={idx} id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={zone.color.includes('red') ? '#ef4444' : 
                                              zone.color.includes('orange') ? '#f97316' :
                                              zone.color.includes('yellow') ? '#facc15' : '#22c55e'} 
                      stopOpacity={currentZone === idx ? "0.4" : "0.15"} />
                <stop offset="100%" stopColor={zone.color.includes('orange') && !zone.color.includes('red') ? '#fb923c' :
                                                zone.color.includes('yellow') && !zone.color.includes('orange') ? '#fde047' :
                                                zone.color.includes('green') ? '#4ade80' : '#60a5fa'} 
                      stopOpacity={currentZone === idx ? "0.4" : "0.15"} />
              </linearGradient>
            ))}
          </defs>

          {/* Quarter circle zones (0° at top, clockwise to 90°) */}
          {[0, 1, 2, 3].map((idx) => {
            const startAngle = idx === 0 ? 0 : idx === 1 ? 15 : idx === 2 ? 45 : 75;
            const endAngle = idx === 0 ? 15 : idx === 1 ? 45 : idx === 2 ? 75 : 90;
            
            // Convert to SVG path (0° = top = -90° in standard coords)
            const start = ((startAngle - 90) * Math.PI) / 180;
            const end = ((endAngle - 90) * Math.PI) / 180;
            
            const x1 = 100 + 90 * Math.cos(start);
            const y1 = 100 + 90 * Math.sin(start);
            const x2 = 100 + 90 * Math.cos(end);
            const y2 = 100 + 90 * Math.sin(end);
            
            const largeArc = endAngle - startAngle > 180 ? 1 : 0;
            
            return (
              <path
                key={idx}
                d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={`url(#gradient-${idx})`}
                stroke={currentZone === idx ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={currentZone === idx ? '3' : '1'}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Center circle (aircraft nose point) */}
          <circle cx="100" cy="100" r="8" fill="#1f2937" />
          
          {/* Wind direction pointer */}
          <g transform={`rotate(${pointerRotation}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="20"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeLinecap="round"
              className="drop-shadow-lg"
            />
            {/* Arrow head */}
            <polygon
              points="100,15 95,25 105,25"
              fill="#3b82f6"
              className="drop-shadow-lg"
            />
          </g>

          {/* Angle labels */}
          <text x="100" y="15" textAnchor="middle" className="text-xs font-semibold fill-gray-700 dark:fill-gray-300">0°</text>
          <text x="185" y="105" textAnchor="middle" className="text-xs font-semibold fill-gray-700 dark:fill-gray-300">90°</text>
          
          {/* Center label */}
          <text x="100" y="103" textAnchor="middle" className="text-xs font-bold fill-white">YOU</text>
        </svg>

        {/* Angle display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16 bg-white dark:bg-neutral-800 px-3 py-1 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700">
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {angleFromNose.toFixed(0)}°
          </div>
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
