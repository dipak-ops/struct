# Struct — Beta Release Master Checklist

Use this master release gate checklist to confirm all operational requirements prior to broad distribution:

```text
[x] Android release build configuration verified (compileSdk 36, targetSdk 36, minSdk 26)
[x] ProGuard/R8 optimization rules verified
[x] Automated test suites passing (100% test pass rate)
[x] TypeScript / Vite simulator passing lint and compilation
[ ] Android physical testing executed on hardware (Awaiting lab run)
[ ] iOS release build signed in Xcode on macOS (Manual action required)
[ ] iOS physical testing executed on iPhone (Awaiting lab run)
[ ] Android <-> Android physical link verified
[ ] Android <-> iOS cross-platform link verified
[ ] iOS <-> iOS link verified
[ ] Multi-hop relay (A -> B -> C) physically demonstrated
[ ] Store-and-forward retention verified across device reboot
[ ] Background relay verified on Android Foreground Service
[ ] Least-privilege permissions verified (Zero location GPS requests)
[ ] Bluetooth off/on radio toggle recovery verified
[ ] App process death and SQLite database recovery verified
[ ] Security code-level review completed (Zero plaintext/key leakage)
[ ] Privacy policy prepared for hosting at https://struct.network/privacy
[ ] Google Play Internal Testing release created
[ ] Apple TestFlight internal testing release created
[ ] Final release approval signed off by Dipak Bhondekar
```
