Here is the complete step-by-step guide to run and launch the PondFish Customer App on your physical Android phone after plugging in the USB cable and enabling USB Debugging.

Step 1: Verify Phone Connection
Open a terminal (PowerShell or Command Prompt) in your project root and run:

**powershell** 
adb devices

#You should see your device listed (e.g., 4644ef0d    device).
#Note: If a pop-up appears on your phone screen asking to "Allow USB Debugging?", check "Always allow from this computer" and tap Allow.
Step 2: Set Up ADB Reverse Port Forwarding
Run these two commands so your phone can reach your local PC backend (Port 5000) and the Metro JavaScript bundler (Port 8081):

**powershell**
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081

Verify that both ports are active:

**powershell**
adb reverse --list

(Expected output: UsbFfs tcp:5000 tcp:5000 & UsbFfs tcp:8081 tcp:8081)

Step 3: Build & Launch the App onto Your Phone
Make sure the PondFish backend is running (npm run dev in the root folder).

Then run:

**powershell**
npm run android --workspace=customer-app


This will automatically compile the app, install the APK on your phone, and open it.
Step 4: Login Credentials on Your Phone
Once the app opens on your phone:

Enter Mobile Number: 9876543210
Tap Get OTP
Enter 6-Digit Code: 123456
Tap Verify & Login
You will land directly on the redesigned PondFish Customer App Home Screen!

TIP

Quick Launch Next Time: If the CustomerApp icon is already installed on your phone screen, you only need to run:

adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081

Tap the CustomerApp icon on your phone to open it immediately!
