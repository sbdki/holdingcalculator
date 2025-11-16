import { ThemeProvider } from "./contexts/ThemeContext";
import HoldingCalculator from "./components/HoldingCalculator";

/**
 * App - Root Component
 * 
 * Purpose: Main application entry point with theme provider
 */
function App() {
  return (
    <ThemeProvider>
      <HoldingCalculator />
    </ThemeProvider>
  );
}

export default App;
