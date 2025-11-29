/**
 * Footer Component
 * 
 * Purpose: Display creator attribution and version
 */
import packageJson from '../../package.json';

const Footer = () => {
  return (
    <footer className="mt-12 pb-8">
      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-center dark:bg-neutral-700/30 dark:border-neutral-700">
        <p className="text-sm text-gray-600 dark:text-neutral-300">
          Made by <span className="font-semibold text-gray-900 dark:text-neutral-50">Geoffrey Baldet</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
          Holding Calculator - v{packageJson.version}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
