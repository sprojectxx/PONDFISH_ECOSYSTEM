# PondFish Customer Mobile Application (React Native)

## Development Configuration & Physical Device Setup

This application supports development on both **Android Emulators** and **Physical Android Devices** via USB ADB reverse port forwarding.

### 1. Connecting Physical Android Device (USB ADB)

1. Connect your Android device via USB with **USB Debugging** enabled.
2. Verify device connectivity:
   ```bash
   adb devices
   ```
3. Execute ADB reverse commands to route local backend (port 5000) and Metro bundler (port 8081) from the phone to your development PC:
   ```bash
   adb reverse tcp:5000 tcp:5000
   adb reverse tcp:8081 tcp:8081
   ```
4. Verify port reversal:
   ```bash
   adb reverse --list
   # Output should display:
   # UsbFfs tcp:5000 tcp:5000
   # UsbFfs tcp:8081 tcp:8081
   ```

### 2. API Endpoint Modes

The application dynamically selects its API base endpoint based on environment configuration:

| Mode / Environment | Trigger | Target Endpoint |
| :--- | :--- | :--- |
| **Physical Android Device (ADB Reverse)** | `USE_PHYSICAL_DEVICE=true` or `DEV_TARGET=physical` | `http://127.0.0.1:5000/api/v1` |
| **Android Emulator** *(Default)* | Default fallback (no flags set) | `http://10.0.2.2:5000/api/v1` |
| **Custom / Production** | `API_BASE_URL=https://api.pondfish.com/api/v1` | `https://api.pondfish.com/api/v1` |

### 3. Running Development Commands

#### Running for Physical Android Device:
```bash
# Windows PowerShell / CMD:
$env:USE_PHYSICAL_DEVICE="true"; npm run android

# Or set DEV_TARGET:
$env:DEV_TARGET="physical"; npm run start
```

#### Running for Android Emulator:
```bash
# Default behavior:
npm run android
```

### 4. Verification Commands

```bash
# Typecheck
npm run typecheck

# Execute Test Suite
npm test
```
