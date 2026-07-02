import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BluetoothScan, type Device } from "./components/BluetoothScan";
import { LoginScreen, type AccessLevel } from "./components/LoginScreen";
import { HomeScreen } from "./components/HomeScreen";
import { SplashScreen } from "./components/SplashScreen";

type Screen = "splash" | "scan" | "login" | "home";

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loggedUser, setLoggedUser]       = useState<string>("");
  const [accessLevel, setAccessLevel]     = useState<AccessLevel>("tecnico");

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setScreen("login");
  };

  const handleLogin = (user: string, level: AccessLevel) => {
    setLoggedUser(user);
    setAccessLevel(level);
    setScreen("home");
  };

  const handleLogout = () => {
    setLoggedUser("");
    setSelectedDevice(null);
    setScreen("scan");
  };

  const handleBack = () => {
    setSelectedDevice(null);
    setScreen("scan");
  };

  return (
    /* MARKER-MAKE-KIT-INVOKED */
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-[390px] h-[780px] rounded-[2.5rem] overflow-hidden border border-blue-900/40"
        style={{
          background: "var(--background)",
          boxShadow: "0 0 60px rgba(37,99,235,0.15), 0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Splash — absolute overlay, exits cleanly */}
        {screen === "splash" && (
          <SplashScreen onFinish={() => setScreen("scan")} />
        )}

        {/* App screens */}
        <div className="h-[calc(100%-48px)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {screen === "scan" && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 overflow-y-auto"
              >
                <BluetoothScan onSelectDevice={handleDeviceSelect} />
              </motion.div>
            )}

            {screen === "login" && selectedDevice && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 overflow-y-auto"
              >
                <LoginScreen device={selectedDevice} onLogin={handleLogin} onBack={handleBack} />
              </motion.div>
            )}

            {screen === "home" && selectedDevice && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 overflow-y-auto"
              >
                <HomeScreen device={selectedDevice} username={loggedUser} accessLevel={accessLevel} onLogout={handleLogout} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
