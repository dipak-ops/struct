# Apple TestFlight Beta Distribution Checklist

---

## Step-by-Step Operator Instructions for macOS Workstation

1. **Open Project in Xcode**:
   ```bash
   open ios/Runner.xcworkspace
   ```
2. **Set Build Scheme & Configuration**:
   - Scheme: `Runner`
   - Destination: `Any iOS Device (arm64)`
   - Build Configuration: `Release`
3. **Configure Code Signing**:
   - Target `Runner` > **Signing & Capabilities**
   - Team: Select your active Apple Developer Account Team
   - Provisioning Profile: Automatic or App Store Distribution Profile
4. **Archive Build**:
   - Menu: **Product > Archive**
   - Once compilation finishes, the Xcode Organizer window opens.
5. **Validate & Upload**:
   - Click **Validate App** to run automated pre-flight checks (verifies `PrivacyInfo.xcprivacy` and entitlements).
   - Click **Distribute App** > Select **App Store Connect** > **Upload**.
6. **App Store Connect Setup**:
   - Go to: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Navigate to: **TestFlight > Internal Testing**
   - Select the uploaded build once processing finishes (~10–15 mins).
   - Add internal tester Apple IDs.
   - Install build from TestFlight app on physical iPhones.
