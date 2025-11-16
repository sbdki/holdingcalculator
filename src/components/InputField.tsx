import React from "react";
import type { InputFieldProps } from "../types";

/**
 * InputField Component
 * 
 * Purpose: Reusable numeric input field with label
 * Usage: For collecting wind, course, and speed values
 */
const InputField: React.FC<InputFieldProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-50"
      />
    </div>
  );
};

export default InputField;
