# Holding Calculator

**Version 1.0.0**

An interactive aviation holding pattern wind correction calculator built with React, TypeScript, and Tailwind CSS. Calculate drift angles, corrected headings, and outbound timing for holding patterns with detailed mathematical breakdowns.

![Holding Calculator](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🎯 Features

- **Real-time Calculations**: Instant computation of holding pattern corrections
- **Interactive Math Breakdowns**: Expandable cards showing step-by-step formulas
- **Dark Mode Support**: Automatic dark/light theme switching
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Input Validation**: Clear error messages for invalid inputs
- **Aviation Standard**: Uses industry-standard quarter-clock method and triple drift technique

### What It Calculates

1. **Outbound Course** - Reciprocal of inbound course (180° opposite)
2. **Single Drift** - Maximum wind correction angle based on wind speed and groundspeed
3. **Inbound Heading** - Course corrected by single drift into the wind
4. **Outbound Heading** - Course corrected by triple drift (3× single drift)
5. **Outbound Timing** - Adjusted timing based on head/tail wind component (starts at 60s)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/sbdki/holdingcalculator.git
cd holdingcalculator

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Building for Production

```bash
# Type check
npm run type-check

# Build
npm run build

# Preview production build
npm run preview
```

---

## 📖 Usage

### Basic Workflow

1. **Enter Inputs**:
   - Wind Direction (°M) - Magnetic wind direction (0-359°)
   - Wind Speed (kt) - Wind speed in knots
   - Inbound Course (°M) - Magnetic inbound course to the holding fix
   - Groundspeed (kt) - Aircraft groundspeed

2. **Click CALCULATE**: Results appear instantly below the input section

3. **Expand Math Details**: Click "Show math" on any result card to see the complete calculation breakdown

### Example

**Scenario**: Holding pattern with strong crosswind

- Wind Direction: 170°M
- Wind Speed: 16 kt
- Inbound Course: 048°M
- Groundspeed: 120 kt

**Results**:
- Outbound Course: 228°M
- Single Drift: 8.0°
- Inbound Heading: 040°M
- Outbound Heading: 204°M
- Outbound Time: 64 seconds

---

## 🏗️ Project Structure

```
holdingcalculator/
├── src/
│   ├── components/          # React components
│   │   ├── HoldingCalculator.tsx  # Main calculator component
│   │   ├── InputField.tsx         # Reusable input field
│   │   └── ResultCard.tsx         # Expandable result display
│   ├── utils/               # Utility functions
│   │   └── calculations.ts        # Core calculation logic
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── styles/              # CSS styles
│   │   └── index.css
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

### Key Files

- **`src/utils/calculations.ts`**: All mathematical functions for holding pattern calculations
- **`src/components/HoldingCalculator.tsx`**: Main UI logic and state management
- **`src/types/index.ts`**: TypeScript interfaces for type safety

---

## 🧮 Calculation Methods

### Single Drift (Maximum Wind Correction Angle)

```
Single Drift = Wind Speed (kt) / Groundspeed (NM/min)
```

This represents the maximum wind correction angle needed to maintain track.

### Inbound Heading

```
Inbound Heading = Inbound Course ± Single Drift
```

- Subtract drift if wind is from the left
- Add drift if wind is from the right

### Outbound Heading (Triple Drift Method)

```
Outbound Heading = Outbound Course ± (3 × Single Drift)
```

The triple drift method compensates for:
- Wind effect during the turn
- Initial displacement from course
- Time to stabilize on outbound leg

### Outbound Timing (Quarter-Clock Method)

The timing adjustment uses a simplified quarter-clock rule:

| Angle from Nose | Factor | Component |
|----------------|--------|-----------|
| 0-15°          | 100%   | 1.0       |
| 15-45°         | 75%    | 0.75      |
| 45-75°         | 50%    | 0.5       |
| 75-90°         | 25%    | 0.25      |

```
Head/Tail Component = Wind Speed × Quarter-Clock Factor
Outbound Time = 60 seconds - Head/Tail Component (in kt)
```

- Headwind: Reduces time (subtract from 60s)
- Tailwind: Increases time (add to 60s)
- Result is clamped between 10s and 180s

---

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (includes type checking) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run type-check` | Run TypeScript type checking |

### Technology Stack

- **React 18.2** - UI framework
- **TypeScript 5.2** - Type safety and better developer experience
- **Vite 5** - Fast build tool and dev server
- **Tailwind CSS 3.3** - Utility-first styling
- **ESLint** - Code linting

### Code Style

- **Early returns** for error handling (reduces nesting)
- **Clear comments** explaining purpose, logic, and edge cases
- **Type safety** with TypeScript interfaces
- **Modular architecture** with separated concerns

---

## 📝 Aviation Background

### Holding Patterns

A holding pattern is a racetrack-shaped maneuver flown by aircraft awaiting further clearance. The pattern consists of:

1. **Inbound leg** - Towards the holding fix (typically 1 minute)
2. **Turn** - Standard rate turn (3°/second)
3. **Outbound leg** - Away from the holding fix (timing adjusted for wind)
4. **Turn** - Return turn to rejoin inbound leg

### Why Wind Corrections Matter

Wind significantly affects holding patterns:

- **Drift**: Wind pushes the aircraft off the desired ground track
- **Groundspeed variations**: Headwinds/tailwinds change the time to fly each leg
- **Pattern distortion**: Without corrections, the pattern becomes elongated or compressed

This calculator helps pilots pre-compute the necessary corrections for precise holding pattern flying.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes with clear messages
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Guidelines

- Describe **what** changed and **why**
- Include **how** to test the changes
- Update documentation if needed
- Ensure all tests pass and linting is clean

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔮 Future Enhancements

Potential features for future versions:

- [ ] Save/load preset scenarios
- [ ] Multiple holding patterns comparison
- [ ] Export results to PDF
- [ ] Turn radius calculations
- [ ] Protected vs non-protected side visualization
- [ ] Different entry procedures (direct, parallel, teardrop)
- [ ] Unit tests for calculation functions
- [ ] Mobile app version (React Native)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sbdki/holdingcalculator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sbdki/holdingcalculator/discussions)

---

## 🙏 Acknowledgments

- Aviation calculation methods based on standard pilot training materials
- UI inspired by modern aviation planning tools
- Built with modern web technologies for optimal performance

---

**Happy Flying! ✈️**
