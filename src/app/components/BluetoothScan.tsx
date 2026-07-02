import { useState, useEffect, useRef } from "react";
import { Bluetooth, Wifi, ChevronRight, RefreshCw, AlertTriangle, CheckCircle2, ServerCrash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import mbsLogo from "@/imports/MBS_-_fundo_Preto.png";

interface Device {
  id: string;
  name: string;
  address: string;
  rssi: number;
  type: string;
  paired: boolean;
  addressValid: boolean;
}

const BT_DEVICES: Device[] = [
  { id: "1", name: "Estação Styllus", address: "Farmacia Central · End: 1.01", rssi: -42, type: "Estação", paired: true, addressValid: true },
  { id: "2", name: "Estação Styllus", address: "Setor Farmacia · End: 1.02", rssi: -55, type: "Estação", paired: false, addressValid: true },
  { id: "3", name: "Derivador grande: Shaft", address: "End: 1.02", rssi: -67, type: "Derivador", paired: false, addressValid: true },
  { id: "4", name: "Derivador grande: sem nome", address: "Endereço: inválido", rssi: -78, type: "Derivador", paired: false, addressValid: false },
];

const WIFI_DEVICES: Device[] = [
  { id: "w1", name: "Estação Styllus", address: "Farmacia Central · End: 1.01", rssi: -48, type: "Estação", paired: true, addressValid: true },
  { id: "w2", name: "Estação Styllus", address: "Setor Farmacia · End: 1.02", rssi: -61, type: "Estação", paired: false, addressValid: true },
];

type WifiStep = "idle" | "connecting" | "connected" | "scanning";

function signalStrength(rssi: number) {
  if (rssi >= -50) return 4;
  if (rssi >= -60) return 3;
  if (rssi >= -70) return 2;
  return 1;
}

function SignalBars({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          style={{ height: `${bar * 4}px` }}
          className={`w-1 rounded-sm transition-colors ${bar <= level ? color : "bg-slate-700"}`}
        />
      ))}
    </div>
  );
}

interface Props {
  onSelectDevice: (device: Device) => void;
}

export function BluetoothScan({ onSelectDevice }: Props) {
  const [mode, setMode] = useState<"bluetooth" | "wifi">("bluetooth");
  const [scanning, setScanning] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wifiStep, setWifiStep] = useState<WifiStep>("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const accentColor = mode === "bluetooth" ? "text-blue-400" : "text-cyan-400";
  const accentBg = mode === "bluetooth" ? "bg-blue-600/20 border-blue-500/40" : "bg-cyan-600/20 border-cyan-500/40";
  const accentBtn = mode === "bluetooth" ? "bg-blue-600 hover:bg-blue-500 active:bg-blue-700" : "bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700";
  const barColor = mode === "bluetooth" ? "bg-blue-400" : "bg-cyan-400";

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  // Bluetooth scan
  useEffect(() => {
    if (mode !== "bluetooth") return;
    if (!scanning) return;
    setDevices([]);
    setSelectedId(null);
    clearTimers();
    const source = BT_DEVICES;
    const ts = source.map((d, i) =>
      setTimeout(() => setDevices((prev) => [...prev, d]), 500 + i * 650)
    );
    const done = setTimeout(() => setScanning(false), 500 + source.length * 650 + 300);
    timersRef.current = [...ts, done];
    return clearTimers;
  }, [scanning, mode]);

  // WiFi flow: connecting → connected → scanning units
  useEffect(() => {
    if (mode !== "wifi") return;
    clearTimers();
    setDevices([]);
    setSelectedId(null);
    setWifiStep("connecting");

    const t1 = setTimeout(() => setWifiStep("connected"), 2200);
    const t2 = setTimeout(() => {
      setWifiStep("scanning");
      // reveal units one by one
      WIFI_DEVICES.forEach((d, i) => {
        const t = setTimeout(() => setDevices((prev) => [...prev, d]), 600 + i * 700);
        timersRef.current.push(t);
      });
    }, 3200);
    timersRef.current = [t1, t2];
    return clearTimers;
  }, [mode]);

  const switchToMode = (m: "bluetooth" | "wifi") => {
    if (m === mode) return;
    clearTimers();
    setDevices([]);
    setScanning(true);
    setMode(m);
  };

  const handleRescan = () => {
    if (mode === "bluetooth") {
      setDevices([]);
      setScanning(true);
    } else {
      setMode("wifi"); // re-trigger wifi effect via key change trick — reset by toggling
      clearTimers();
      setDevices([]);
      setSelectedId(null);
      setWifiStep("connecting");
      const t1 = setTimeout(() => setWifiStep("connected"), 2200);
      const t2 = setTimeout(() => {
        setWifiStep("scanning");
        WIFI_DEVICES.forEach((d, i) => {
          const t = setTimeout(() => setDevices((prev) => [...prev, d]), 600 + i * 700);
          timersRef.current.push(t);
        });
      }, 3200);
      timersRef.current = [t1, t2];
    }
  };

  const handleSelect = (device: Device) => {
    if (!device.addressValid) return;
    setSelectedId(device.id);
    setTimeout(() => onSelectDevice(device), 280);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -60 && mode === "bluetooth") switchToMode("wifi");
    else if (info.offset.x > 60 && mode === "wifi") switchToMode("bluetooth");
  };

  // Derived state
  const isBtScanning = mode === "bluetooth" && scanning;
  const isWifiConnecting = mode === "wifi" && (wifiStep === "connecting" || wifiStep === "connected");
  const isWifiScanning = mode === "wifi" && wifiStep === "scanning";
  const showDevices = devices.length > 0;
  const scanDone = mode === "bluetooth" ? !scanning : wifiStep === "scanning";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-5 px-6">

        {/* MBS Logo */}
        <div className="w-36 mb-5">
          <ImageWithFallback
            src={mbsLogo}
            alt="MBS Correio Pneumático"
            className="w-full object-contain"
          />
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-700/60 mb-6 select-none">
          <button
            onClick={() => switchToMode("bluetooth")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              mode === "bluetooth" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span className="text-sm">Bluetooth</span>
          </button>

          {/* Draggable grip */}
          <motion.div
            drag="x"
            dragConstraints={{ left: -80, right: 80 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing px-2"
            whileTap={{ scale: 1.15 }}
          >
            <div className="flex flex-col gap-[3px] opacity-40">
              <div className="w-3 h-0.5 rounded bg-slate-400" />
              <div className="w-3 h-0.5 rounded bg-slate-400" />
              <div className="w-3 h-0.5 rounded bg-slate-400" />
            </div>
          </motion.div>

          <button
            onClick={() => switchToMode("wifi")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              mode === "wifi" ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span className="text-sm">Wi-Fi</span>
          </button>
        </div>

        {/* Central icon */}
        <div className="relative mb-5">
          <div className={`w-20 h-20 rounded-full border flex items-center justify-center ${accentBg}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mode === "bluetooth"
                  ? <Bluetooth className={`w-9 h-9 ${accentColor}`} />
                  : <Wifi className={`w-9 h-9 ${accentColor}`} />
                }
              </motion.div>
            </AnimatePresence>
          </div>
          {(isBtScanning || isWifiConnecting || isWifiScanning) && (
            <>
              <motion.div
                className={`absolute inset-0 rounded-full border ${mode === "bluetooth" ? "border-blue-400/40" : "border-cyan-400/40"}`}
                animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full border ${mode === "bluetooth" ? "border-blue-400/25" : "border-cyan-400/25"}`}
                animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </>
          )}
        </div>

        <h1 className="text-white mb-1">
          {mode === "bluetooth" ? "Bluetooth" : "Wi-Fi"}
        </h1>
        <p className="text-slate-400 text-sm text-center">
          {isBtScanning && "Escaneando dispositivos Bluetooth..."}
          {!isBtScanning && mode === "bluetooth" && `${devices.length} dispositivo${devices.length !== 1 ? "s" : ""} encontrado${devices.length !== 1 ? "s" : ""}`}
          {wifiStep === "connecting" && "Conectando ao servidor..."}
          {wifiStep === "connected" && "Conexão estabelecida!"}
          {isWifiScanning && `${devices.length} unidade${devices.length !== 1 ? "s" : ""} encontrada${devices.length !== 1 ? "s" : ""}`}
        </p>
        <p className="text-xs text-slate-600 mt-1">Arraste o divisor ou toque para alternar</p>
      </div>

      {/* WiFi connecting state */}
      <AnimatePresence>
        {isWifiConnecting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4 rounded-xl border border-cyan-800/40 bg-cyan-900/20 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-800/40 border border-cyan-700/40 flex items-center justify-center shrink-0">
                <ServerCrash className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white text-sm">Correio Pneumático MBS</p>
                <p className="text-xs text-slate-500">Servidor central</p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                {wifiStep === "connecting" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-cyan-700 border-t-cyan-400 rounded-full shrink-0"
                  />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                )}
                <span className={`text-sm ${wifiStep === "connecting" ? "text-cyan-300" : "text-green-400"}`}>
                  Conectando ao servidor MBS...
                </span>
              </div>

              {/* Step 2 */}
              {wifiStep === "connected" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-green-400">Conexão com êxito · Escaneando unidades...</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device list */}
      <div className="flex-1 overflow-y-auto px-4">
        <AnimatePresence>
          {devices.map((device) => (
            <motion.button
              key={device.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              onClick={() => handleSelect(device)}
              disabled={!device.addressValid}
              className={`w-full flex items-center gap-4 p-4 mb-3 rounded-xl border transition-all text-left ${
                !device.addressValid
                  ? "border-red-900/40 bg-red-950/20 opacity-70 cursor-not-allowed"
                  : selectedId === device.id
                  ? mode === "bluetooth"
                    ? "border-blue-500 bg-blue-600/20"
                    : "border-cyan-500 bg-cyan-600/20"
                  : mode === "bluetooth"
                  ? "border-blue-900/40 bg-card hover:border-blue-500/50 hover:bg-blue-900/10"
                  : "border-cyan-900/40 bg-card hover:border-cyan-500/50 hover:bg-cyan-900/10"
              }`}
            >
              <div className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${
                !device.addressValid
                  ? "bg-red-900/20 border-red-800/40"
                  : mode === "bluetooth"
                  ? "bg-blue-900/40 border-blue-800/50"
                  : "bg-cyan-900/40 border-cyan-800/50"
              }`}>
                {mode === "bluetooth"
                  ? <Bluetooth className={`w-5 h-5 ${device.addressValid ? "text-blue-400" : "text-red-500"}`} />
                  : <Wifi className={`w-5 h-5 ${device.addressValid ? "text-cyan-400" : "text-red-500"}`} />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white text-sm truncate">{device.name}</p>
                  {device.paired && (
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      mode === "bluetooth" ? "text-blue-400 bg-blue-900/40" : "text-cyan-400 bg-cyan-900/40"
                    }`}>
                      Pareado
                    </span>
                  )}
                  {!device.addressValid && (
                    <span className="text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Inválido
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{device.address}</p>
                <p className="text-xs text-slate-600">{device.type}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {device.addressValid && <SignalBars level={signalStrength(device.rssi)} color={barColor} />}
                <ChevronRight className={`w-4 h-4 ${device.addressValid ? "text-slate-600" : "text-slate-700"}`} />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Empty scanning state */}
        {(isBtScanning || isWifiScanning) && devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <RefreshCw className="w-6 h-6 text-slate-500" />
            </motion.div>
            <p className="text-slate-500 text-sm">Iniciando varredura...</p>
          </div>
        )}

        {/* No devices found */}
        {scanDone && devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            {mode === "bluetooth" ? <Bluetooth className="w-8 h-8 text-slate-700" /> : <Wifi className="w-8 h-8 text-slate-700" />}
            <p className="text-slate-500">Nenhum dispositivo encontrado</p>
          </div>
        )}
      </div>

      {/* Rescan button — always visible */}
      <div className="px-4 pb-8 pt-4">
        <button
          onClick={handleRescan}
          disabled={isBtScanning || isWifiConnecting}
          className={`w-full py-3.5 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${accentBtn}`}
        >
          <RefreshCw className={`w-4 h-4 ${(isBtScanning || isWifiConnecting) ? "animate-spin" : ""}`} />
          {(isBtScanning || isWifiConnecting) ? "Aguarde..." : "Escanear Novamente"}
        </button>
      </div>
    </div>
  );
}

export type { Device };
