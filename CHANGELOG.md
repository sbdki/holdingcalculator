# Changelog

All notable changes to the Holding Calculator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-16

### Added

#### Core Features
- **Interactive calculator** for holding pattern wind corrections
- **Real-time calculations** with instant results
- **Expandable math breakdowns** showing step-by-step formulas for each result
- **Dark mode support** with automatic theme detection
- **Fully responsive design** for desktop, tablet, and mobile devices

#### Calculations
- **Outbound course** - Reciprocal of inbound course (normalized to 0-359°)
- **Single drift** - Maximum wind correction angle based on wind speed and groundspeed
- **Inbound heading** - Course corrected by single drift into the wind
- **Outbound heading** - Course corrected by triple drift (3× single drift)
- **Outbound timing** - Adjusted timing using quarter-clock head/tail wind estimation

#### Technical Implementation
- **Modular architecture** with clear separation of concerns:
  - `src/components/` - React UI components
  - `src/utils/` - Pure calculation functions
  - `src/types/` - TypeScript type definitions
  - `src/styles/` - CSS styling
- **Type-safe codebase** using TypeScript 5.2
- **Input validation** with clear error messages
- **Aviation-standard formulas** for drift and wind correction
- **Quarter-clock method** for head/tail wind component estimation
- **Comprehensive comments** explaining purpose, logic, and edge cases

#### Development Tools
- **Vite 5** for fast development and optimized builds
- **React 18.2** with hooks for state management
- **Tailwind CSS 3.3** for utility-first styling
- **ESLint** for code quality and consistency
- **TypeScript** for type safety and better developer experience

#### Documentation
- **Comprehensive README** with:
  - Quick start guide
  - Usage examples
  - Project structure overview
  - Calculation method explanations
  - Aviation background information
  - Development guidelines
- **Inline code documentation** with JSDoc-style comments
- **CHANGELOG** for tracking project evolution

#### Configuration Files
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript compiler configuration
- `vite.config.ts` - Vite bundler settings
- `tailwind.config.js` - Tailwind CSS customization
- `.eslintrc.cjs` - ESLint rules
- `.gitignore` - Git exclusions

### Project Structure

```
holdingcalculator/
├── src/
│   ├── components/          # React components
│   │   ├── HoldingCalculator.tsx
│   │   ├── InputField.tsx
│   │   └── ResultCard.tsx
│   ├── utils/               # Calculation utilities
│   │   └── calculations.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── styles/              # CSS styles
│   │   └── index.css
│   ├── App.tsx
│   └── main.tsx
├── public/                  # Static assets
├── Configuration files
└── Documentation
```

### Design Decisions

#### Architecture
- **Component-based design**: Reusable `InputField` and `ResultCard` components
- **Pure functions**: All calculations in `utils/calculations.ts` are side-effect free
- **Single responsibility**: Each module has a clear, focused purpose

#### User Experience
- **Progressive disclosure**: Math details hidden by default, expandable on demand
- **Clear visual hierarchy**: Large result values, descriptive titles, explanatory subtitles
- **Helpful error messages**: Specific validation feedback for invalid inputs
- **Sensible defaults**: Pre-filled example values for immediate testing

#### Code Quality
- **Type safety**: Comprehensive TypeScript interfaces prevent runtime errors
- **Early returns**: Reduced nesting in validation logic
- **Clear naming**: Variables and functions with descriptive, aviation-standard names
- **Extensive comments**: Every function documented with purpose and assumptions

### Notes

This initial release provides a solid foundation for holding pattern calculations with:
- Aviation-standard formulas and methods
- Modern, maintainable codebase
- Excellent user experience
- Room for future enhancements (saved presets, visualizations, etc.)

---

[1.0.0]: https://github.com/sbdki/holdingcalculator/releases/tag/v1.0.0
