# Struct — Fresh Setup & Clean Checkout Guide

Follow these exact steps to clone, configure, and build Struct on a fresh developer workstation.

---

## 1. Prerequisites Installation
- **Git**: `>= 2.38`
- **Flutter SDK**: `>= 3.22.0` (`flutter doctor` must show Android toolchain valid)
- **Node.js**: `>= 20.x` (for running the built-in browser mesh simulator harness)

---

## 2. Step-by-Step Setup

```bash
# 1. Clone repository
git clone https://github.com/dipakbhondekar/struct.git
cd struct

# 2. Install Flutter packages
flutter pub get

# 3. Generate Drift SQLite database classes
dart run build_runner build --delete-conflicting-outputs

# 4. Run automated test suite
flutter test

# 5. Run static analysis
flutter analyze

# 6. Launch on connected physical test smartphone
flutter run --release
```

---

## 3. Running the Interactive Web Mesh Simulator

Struct includes an integrated interactive multi-device simulator allowing developers to test $A \to B \to C$ packet routing without requiring 3 physical phones:

```bash
# Install npm dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```
Open `http://localhost:3000` to inspect live packets, TTL decrements, and cryptographic handshakes.
