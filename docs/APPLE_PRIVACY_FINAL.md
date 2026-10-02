# Apple Privacy Nutrition Labels Final Declaration — Struct

This document outlines the exact questionnaire responses to submit in **App Store Connect > App Privacy**.

---

## 1. Data Collection Question

**"Do you or your third-party partners collect data from this app?"**
- Select: **No, we do not collect data from this app.**

---

## 2. Privacy Manifest Audit (`ios/Runner/PrivacyInfo.xcprivacy`)

The following APIs and reasons are declared in Struct's Privacy Manifest:

```xml
<dict>
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>
    <key>NSPrivacyCollectedDataTypes</key>
    <array/>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <!-- File Timestamp API for local SQLite file synchronization -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>C617.1</string>
            </array>
        </dict>
        <!-- UserDefaults API for local app settings storage -->
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array>
                <string>CA92.1</string>
            </array>
        </dict>
    </array>
</dict>
```

---

## 3. Third-Party Tracking
- **Third-party SDKs**: Zero commercial analytics, ads, or crash reporting SDKs included.
- **Tracking Domains**: None.
