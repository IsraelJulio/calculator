# SimpleCalculator

SimpleCalculator is a small mobile calculator built with React Native and Expo.

## Project Purpose

This project was created as a practical learning exercise. The main idea is to use a real project to train how React Native works in practice and to expand my knowledge by building something functional from scratch.

## Features

- Basic arithmetic operations: addition, subtraction, multiplication, and division
- Support for decimal numbers
- Support for grouped expressions using `()`, `[]`, and `{}`
- Recent calculation history with the last 5 successful expressions and results
- Tap a history item to reuse its result in the calculator
- Validation for invalid expressions
- Graceful division-by-zero handling
- Responsive mobile-friendly layout
- Press feedback animation for buttons
- Tech-inspired visual design with gradient layers

## Recent History

The calculator now includes a recent history section below the display. Every valid calculation is saved in the list, showing both the original expression and its result.

Only the 5 most recent successful calculations are kept on screen, which helps keep the interface clean while still making repeated calculations easier. Tapping a history item loads its result back into the calculator so it can be reused in the next operation.

## Tech Stack

- React Native
- Expo
- expo-linear-gradient
- Functional components
- React Hooks with `useState`

## Styling Library

The app uses `expo-linear-gradient`, an Expo-compatible styling library, to create a more technological visual style with layered gradients in the background, calculator panel, and display area.

Install dependencies with:

```bash
npm install
```

The gradient library is included in the project dependencies, so the app still runs normally with:

```bash
npx expo start
```

## Getting Started

### Prerequisites

- Node.js installed
- npm installed

### Installation

```bash
npm install
```

### Run the App

```bash
npx expo start
```

From the Expo interface, you can open the app on:

- an Android emulator
- an iOS simulator
- Expo Go on a physical device
- the web preview

## Project Structure

```text
.
|-- App.js
|-- components/
|   |-- CalculatorButton.js
|-- app.json
|-- babel.config.js
|-- package.json
```

## Notes

This is intentionally a simple project focused on learning and experimentation rather than production complexity.
