import type { ResultCardProps } from "../types";

/**
 * ResultCard Component
 * 
 * Purpose: Displays a calculated result with expandable math details
 * Features:
 * - Large value display
 * - Subtitle description
 * - Expandable/collapsible math breakdown
 * - Responsive layout
 */
const ResultCard = ({
  title,
  subtitle,
  value,
  expanded,
  onToggle,
  children,
}: ResultCardProps) => {
  return (
    <div className="p-5 bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-700/30 dark:border-neutral-700">
      <div className="grid sm:grid-cols-12 gap-4">
        {/* Value display - larger on right */}
        <div className="sm:col-span-5 sm:order-2">
          <div className="bg-gray-100 rounded-lg overflow-hidden dark:bg-neutral-700/50 h-full flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-neutral-50">
              {value}
            </span>
          </div>
        </div>
        
        {/* Title and toggle - left side */}
        <div className="sm:col-span-7 sm:order-1">
          <div className="h-full flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">{subtitle}</p>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex items-center gap-x-1 text-sm text-gray-800 decoration-2 hover:underline font-medium focus:outline-none dark:text-neutral-200"
              >
                {expanded ? "Hide math" : "Show math"}
                <svg
                  className={`shrink-0 size-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expandable math details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
