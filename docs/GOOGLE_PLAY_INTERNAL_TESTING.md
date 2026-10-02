# Google Play Internal Testing Walkthrough

---

## Step-by-Step Operator Instructions for Dipak Bhondekar

1. **Sign the Release Artifact**:
   ```bash
   flutter build appbundle --release
   ```
   *Ensure `android/key.properties` points to your production release keystore.*

2. **Access Google Play Console**:
   - Go to: [play.google.com/console](https://play.google.com/console)
   - Select or Create the application: **Struct**

3. **Configure Internal Testing Track**:
   - Navigate to: **Testing > Internal testing**
   - Click **Create new release**
   - Upload `build/app/outputs/bundle/release/struct-1.0.0-beta.aab`
   - Release name: `1.0.0-beta.1 (Build 1)`
   - Release notes: Copy content from `docs/RELEASE_NOTES_1.0.0.md`
   - Save and click **Review release**

4. **Add Internal Testers**:
   - In the **Testers** tab, create or select an internal email list (e.g., `struct.support@gmail.com` and initial cohort devices).
   - Copy the join link and distribute to physical test devices.

5. **Execute Physical Test Run on Distributed Build**:
   - Download the app from the Google Play Store via the join link.
   - Run the full verification suite in `docs/ANDROID_DEVICE_TEST_PROTOCOL.md`.
   - Confirm that Play Feature Delivery and App Signing do not alter BLE radio behavior.
