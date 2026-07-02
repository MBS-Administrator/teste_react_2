import { useState, useEffect } from "react";
import {
  Bluetooth, Bell, LogOut, AlertTriangle, CheckCircle2,
  Settings, TrendingUp, Activity, Thermometer,
  ChevronRight, Circle, X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import mbsLogo from "@/imports/MBS_-_fundo_Preto.png";
import type { Device } from "./BluetoothScan";
import type { AccessLevel } from "./LoginScreen";

// ─── types ────────────────────────────────────────────────────────────────────

export type SystemStatus =
  | "livre"
  | "em uso"
  | "em manutenção"
  | "offline"
  | "em varredura";

type SensorStatus = "desativado" | "ativado" | "foi ativado";
type PosStatus    = "ativo" | "não ativo";

interface Props {
  device: Device;
  username: string;
  accessLevel: AccessLevel;
  onLogout: () => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function systemColor(s: SystemStatus): { label: string; text: string; bar: string; bg: string; border: string; dot: string } {
  switch (s) {
    case "livre":         return { label: "Sistema livre",         text: "text-green-400",  bar: "bg-green-500",  bg: "bg-green-950/20",   border: "border-green-800/30",  dot: "bg-green-400" };
    case "em uso":        return { label: "Sistema em uso",        text: "text-orange-400", bar: "bg-orange-500", bg: "bg-orange-950/20",  border: "border-orange-800/30", dot: "bg-orange-400" };
    case "em manutenção": return { label: "Sistema em manutenção", text: "text-cyan-400",   bar: "bg-cyan-500",   bg: "bg-cyan-950/20",    border: "border-cyan-800/30",   dot: "bg-cyan-400" };
    case "offline":       return { label: "Sistema offline",       text: "text-red-400",    bar: "bg-red-500",    bg: "bg-red-950/20",     border: "border-red-800/30",    dot: "bg-red-500" };
    case "em varredura":  return { label: "Sistema em varredura",  text: "text-purple-400", bar: "bg-purple-500", bg: "bg-purple-950/20",  border: "border-purple-800/30", dot: "bg-purple-400" };
  }
}

const SENSOR_CYCLE: SensorStatus[] = ["desativado", "ativado", "foi ativado"];

function statusPill(status: SensorStatus) {
  const map: Record<SensorStatus, { bg: string; text: string; dot: string }> = {
    "ativado":     { bg: "bg-green-900/40 border-green-800/50",   text: "text-green-400",  dot: "bg-green-400" },
    "foi ativado": { bg: "bg-yellow-900/40 border-yellow-800/50", text: "text-yellow-400", dot: "bg-yellow-400" },
    "desativado":  { bg: "bg-slate-800/60 border-slate-700/50",   text: "text-slate-500",  dot: "bg-slate-600" },
  };
  const s = map[status];
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function posPill(status: PosStatus) {
  const active = status === "ativo";
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs ${
      active ? "bg-blue-900/40 border-blue-800/50 text-blue-400" : "bg-slate-800/60 border-slate-700/50 text-slate-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-blue-400" : "bg-slate-600"}`} />
      {status}
    </span>
  );
}

// ─── dialogs ──────────────────────────────────────────────────────────────────

type ChangeableStatus = "em manutenção" | "em varredura" | "livre";

const STATUS_OPTIONS: Array<{ value: ChangeableStatus; label: string; color: string; dot: string }> = [
  { value: "em manutenção", label: "Em Manutenção", color: "text-cyan-400",   dot: "bg-cyan-400" },
  { value: "em varredura",  label: "Em Varredura",  color: "text-purple-400", dot: "bg-purple-400" },
  { value: "livre",         label: "Sistema livre", color: "text-green-400",  dot: "bg-green-400" },
];

function SystemStatusDialog({
  open,
  currentStatus,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  currentStatus: SystemStatus;
  onConfirm: (next: ChangeableStatus) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<ChangeableStatus>("em manutenção");

  const notice =
    currentStatus === "em uso"
      ? "O sistema mudará o status ao final do envio em andamento."
      : undefined;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

          <motion.div key="dlg"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-600 hover:text-slate-400">
              <X className="w-4 h-4" />
            </button>

            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Alterar status</p>
            <p className="text-white text-sm leading-relaxed mb-4">
              Deseja mudar o status do sistema para:
            </p>

            {/* Status selector */}
            <div className="space-y-2 mb-4">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                    selected === opt.value
                      ? "border-blue-600/60 bg-blue-900/20"
                      : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                  }`}
                >
                  {/* Radio circle */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === opt.value ? "border-blue-500" : "border-slate-600"
                  }`}>
                    {selected === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                  <span className={`text-sm ${selected === opt.value ? opt.color : "text-slate-400"}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            {notice && (
              <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-xs leading-relaxed">{notice}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={() => onConfirm(selected)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm">
                OK
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function UnitModeDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

          <motion.div key="dlg"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-5 top-1/2 -translate-y-1/2 z-50 bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-600 hover:text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Modo manual</p>
            <p className="text-white text-sm leading-relaxed mb-5">
              Deseja entrar em modo manual na unidade?
            </p>
            <div className="flex gap-2">
              <button onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm">
                OK
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── cards ────────────────────────────────────────────────────────────────────

function SystemStatusCard({
  status,
  onRequestChange,
}: {
  status: SystemStatus;
  onRequestChange: () => void;
}) {
  const c = systemColor(status);
  const barWidth: Record<SystemStatus, string> = {
    livre: "w-1/5", "em uso": "w-3/4", "em manutenção": "w-2/5", offline: "w-0", "em varredura": "w-full",
  };

  return (
    <div className={`p-4 rounded-xl border ${c.border} ${c.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Circle className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Status do Sistema</p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${c.dot} ${status === "em uso" ? "animate-pulse" : ""}`} />
          <span className={`text-base ${c.text}`}>{c.label}</span>
        </div>
        <button
          onClick={onRequestChange}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-700 hover:border-slate-500 px-2.5 py-1 rounded-lg"
        >
          Alterar
        </button>
      </div>

      <div className="h-1.5 rounded-full bg-slate-800">
        <motion.div
          layout
          className={`h-full rounded-full transition-all duration-700 ${c.bar} ${barWidth[status]}`}
        />
      </div>
    </div>
  );
}

function UnitStatusCard({
  systemStatus,
  onRequestChange,
}: {
  systemStatus: SystemStatus;
  onRequestChange: () => void;
}) {
  const blocked = systemStatus === "em uso" || systemStatus === "em varredura";

  return (
    <div className="p-4 rounded-xl border border-green-800/30 bg-green-950/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-green-900/40 border border-green-800/50 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Status da Unidade</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400">Sem erro</span>
        </div>
        <button
          onClick={onRequestChange}
          disabled={blocked}
          className={`text-xs transition-colors border px-2.5 py-1 rounded-lg ${
            blocked
              ? "text-slate-700 border-slate-800 cursor-not-allowed"
              : "text-slate-500 hover:text-slate-300 border-slate-700 hover:border-slate-500"
          }`}
        >
          {blocked ? "Bloqueado" : "Alterar"}
        </button>
      </div>

      {blocked && (
        <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-slate-700" />
          Indisponível com sistema {systemStatus === "em uso" ? "em uso" : "em varredura"}
        </p>
      )}

      {!blocked && (
        <p className="text-xs text-slate-600 mt-1">Todos os subsistemas operando normalmente</p>
      )}
    </div>
  );
}

const isDerivador = (d: Device) => d.type === "Derivador";
const isVersalles = (d: Device) => d.name.toLowerCase().includes("versalles");
const hasPositionD = (d: Device) => isDerivador(d) || isVersalles(d);

function PositionSensorsCard({ device }: { device: Device }) {
  const positions: Array<{ label: string; key: string }> = [
    { label: "Posição A", key: "A" },
    { label: "Posição B", key: "B" },
    { label: "Posição C", key: "C" },
    { label: "Posição D", key: "D" },
  ];
  const [states, setStates] = useState<Record<string, PosStatus>>({
    A: "ativo", B: "não ativo", C: "não ativo", D: "não ativo",
  });

  const toggle = (key: string) =>
    setStates(s => ({ ...s, [key]: s[key] === "ativo" ? "não ativo" : "ativo" }));

  const visible = positions.filter(p => p.key !== "D" || hasPositionD(device));

  return (
    <div className="p-4 rounded-xl border border-blue-900/30 bg-blue-950/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-800/50 flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Sensores de Posição</p>
      </div>
      <div className="space-y-2">
        {visible.map(p => (
          <button
            key={p.key}
            onClick={() => toggle(p.key)}
            className="w-full flex items-center justify-between py-1 group"
          >
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{p.label}</span>
            {posPill(states[p.key])}
          </button>
        ))}
      </div>
    </div>
  );
}

const CAPSULE_SENSORS = [
  { label: "Sensor de porta",    key: "porta" },
  { label: "Sensor de passagem", key: "passagem" },
  { label: "Sensor de chegada",  key: "chegada" },
];

function CapsuleSensorsCard() {
  const [states, setStates] = useState<Record<string, SensorStatus>>({
    porta: "desativado", passagem: "ativado", chegada: "foi ativado",
  });

  const toggle = (key: string) =>
    setStates(s => {
      const idx = SENSOR_CYCLE.indexOf(s[key]);
      return { ...s, [key]: SENSOR_CYCLE[(idx + 1) % SENSOR_CYCLE.length] };
    });

  return (
    <div className="p-4 rounded-xl border border-purple-900/30 bg-purple-950/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-800/50 flex items-center justify-center">
          <Bluetooth className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Sensores de Detecção</p>
      </div>
      <div className="space-y-2">
        {CAPSULE_SENSORS.map(s => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className="w-full flex items-center justify-between py-1 group"
          >
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{s.label}</span>
            {statusPill(states[s.key])}
          </button>
        ))}
      </div>
    </div>
  );
}

const ALERTS = [
  { id: 1, type: "warning", message: "Temperatura próxima ao limite máximo", time: "2 min atrás" },
  { id: 2, type: "ok",      message: "Sistema operando em modo normal",       time: "15 min atrás" },
  { id: 3, type: "warning", message: "Verificar filtro de ventilação",         time: "1h atrás" },
];

const MENU_ITEMS = [
  { label: "Parâmetros",  icon: Settings,   desc: "Configurar parâmetros do equipamento" },
  { label: "Histórico",   icon: TrendingUp, desc: "Ver logs e histórico de operação" },
  { label: "Diagnóstico", icon: Activity,   desc: "Executar diagnóstico completo" },
];

// ─── main ─────────────────────────────────────────────────────────────────────

export function HomeScreen({ device, username, accessLevel, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<"monitor" | "alerts" | "menu">("monitor");
  const [systemStatus, setSystemStatus] = useState<SystemStatus>("livre");

  const [sysDialog, setSysDialog]   = useState(false);
  const [unitDialog, setUnitDialog] = useState(false);

  const now         = useNow();
  const temperature = 74.2;

  const handleSysConfirm = (next: ChangeableStatus) => {
    setSystemStatus(next);
    setSysDialog(false);
  };

  const handleUnitConfirm = () => {
    setUnitDialog(false);
  };

  return (
    <div className="flex flex-col h-full relative">

      {/* ── Dialogs ── */}
      <SystemStatusDialog
        open={sysDialog}
        currentStatus={systemStatus}
        onConfirm={handleSysConfirm}
        onCancel={() => setSysDialog(false)}
      />
      <UnitModeDialog
        open={unitDialog}
        onConfirm={handleUnitConfirm}
        onCancel={() => setUnitDialog(false)}
      />

      {/* ── Header ── */}
      <div className="px-4 pt-8 pb-3 shrink-0">

        <div className="flex items-center justify-between mb-1">
          <div className="w-24">
            <ImageWithFallback src={mbsLogo} alt="MBS Correio Pneumático" className="w-full object-contain" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-900/30 border border-orange-800/40">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-orange-300 text-xs">{temperature}°C</span>
            </div>
            <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center relative">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
            </button>
            <button onClick={onLogout} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-xs mb-3">
          Olá, <span className="text-slate-300 capitalize">{username}</span>
        </p>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-700/40 bg-blue-900/20 mb-2">
          <div className="w-9 h-9 rounded-lg bg-blue-700/40 flex items-center justify-center shrink-0">
            <Bluetooth className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm truncate">{device.name}</p>
            <p className="text-xs text-slate-500 truncate">{device.address} · {device.type}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-600">{formatDate(now)}</span>
          <span className="text-xs text-blue-500 tabular-nums">{formatTime(now)}</span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <AnimatePresence mode="wait">

          {activeTab === "monitor" && (
            <motion.div key="monitor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-2">
              <p className="text-xs text-slate-600 uppercase tracking-wider">Leituras em tempo real</p>
              <SystemStatusCard status={systemStatus} onRequestChange={() => setSysDialog(true)} />
              <UnitStatusCard systemStatus={systemStatus} onRequestChange={() => setUnitDialog(true)} />
              <PositionSensorsCard device={device} />
              <CapsuleSensorsCard />
            </motion.div>
          )}

          {activeTab === "alerts" && (
            <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-2">
              <p className="text-xs text-slate-600 uppercase tracking-wider">Alertas do sistema</p>
              {ALERTS.map(a => (
                <div key={a.id} className={`flex items-start gap-3 p-4 rounded-xl border ${
                  a.type === "warning" ? "border-orange-800/40 bg-orange-900/20" : "border-green-800/40 bg-green-900/20"
                }`}>
                  {a.type === "warning"
                    ? <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    : <CheckCircle2  className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="text-white text-sm">{a.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-2">
              <p className="text-xs text-slate-600 uppercase tracking-wider">Opções</p>
              {MENU_ITEMS.map(item => (
                <button key={item.label} className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:bg-blue-900/10 transition-all text-left">
                  <div className="w-10 h-10 rounded-lg bg-blue-900/40 border border-blue-800/40 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                </button>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom tab bar ── */}
      <div className="shrink-0 px-4 pb-6 pt-2 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="flex gap-1">
          {(["monitor", "alerts", "menu"] as const).map(tab => {
            const Icon  = tab === "monitor" ? Activity : tab === "alerts" ? AlertTriangle : Settings;
            const label = tab === "monitor" ? "Monitor"  : tab === "alerts" ? "Alertas"     : "Menu";
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all ${
                  active ? "bg-blue-600/20 text-blue-400" : "text-slate-600 hover:text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
                {active && <div className="w-4 h-0.5 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
