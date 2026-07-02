import { useState } from "react";
import { Bluetooth, Eye, EyeOff, Lock, User, ArrowLeft, AlertCircle, UserCog, Code2, HardHat } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Device } from "./BluetoothScan";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import mbsLogo from "@/imports/MBS_-_fundo_Preto.png";

export type AccessLevel = "usuario" | "tecnico" | "desenvolvedor";

interface Props {
  device: Device;
  onLogin: (user: string, accessLevel: AccessLevel) => void;
  onBack: () => void;
}

const ACCESS_TYPES: Array<{
  key: AccessLevel;
  label: string;
  desc: string;
  Icon: React.ElementType;
  color: string;
  border: string;
  activeBg: string;
  activeText: string;
}> = [
  {
    key: "usuario",
    label: "Usuário",
    desc: "Acesso básico de operação",
    Icon: User,
    color: "text-green-400",
    border: "border-green-800/40",
    activeBg: "bg-green-900/30",
    activeText: "text-green-300",
  },
  {
    key: "tecnico",
    label: "Técnico",
    desc: "Acesso técnico e diagnóstico",
    Icon: HardHat,
    color: "text-blue-400",
    border: "border-blue-800/40",
    activeBg: "bg-blue-900/30",
    activeText: "text-blue-300",
  },
  {
    key: "desenvolvedor",
    label: "Desenvolvedor",
    desc: "Acesso completo ao sistema",
    Icon: Code2,
    color: "text-purple-400",
    border: "border-purple-800/40",
    activeBg: "bg-purple-900/30",
    activeText: "text-purple-300",
  },
];

const CREDENTIALS: Record<AccessLevel, Array<{ user: string; pass: string }>> = {
  usuario:       [{ user: "operador", pass: "1234" }],
  tecnico:       [{ user: "tecnico",  pass: "tech2024" }, { user: "admin", pass: "admin123" }],
  desenvolvedor: [{ user: "dev",      pass: "dev2024" }],
};

export function LoginScreen({ device, onLogin, onBack }: Props) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("tecnico");
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const selected = ACCESS_TYPES.find(a => a.key === accessLevel)!;

  const handleSelectAccess = (key: AccessLevel) => {
    setAccessLevel(key);
    setError("");
    setUsername("");
    setPassword("");
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 1200));
    const valid = CREDENTIALS[accessLevel].find(
      c => c.user === username.toLowerCase().trim() && c.pass === password
    );
    if (valid) {
      onLogin(username.trim(), accessLevel);
    } else {
      setError("Usuário ou senha incorretos.");
      setLoading(false);
    }
  };

  const hint = CREDENTIALS[accessLevel][0];

  return (
    <div className="flex flex-col h-full px-5">

      {/* Back */}
      <div className="pt-10 pb-3">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-5">
        <div className="w-28">
          <ImageWithFallback src={mbsLogo} alt="MBS Correio Pneumático" className="w-full object-contain" />
        </div>
      </div>

      {/* Device banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-800/50 bg-blue-900/20 mb-5">
        <div className="w-9 h-9 rounded-lg bg-blue-700/40 flex items-center justify-center shrink-0">
          <Bluetooth className="w-4 h-4 text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-sm truncate">{device.name}</p>
          <p className="text-xs text-slate-500 truncate">{device.address} · {device.type}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
      </div>

      {/* Access level selector */}
      <div className="mb-5">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Tipo de acesso</p>
        <div className="grid grid-cols-3 gap-2">
          {ACCESS_TYPES.map(({ key, label, desc, Icon, color, border, activeBg, activeText }) => {
            const active = accessLevel === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectAccess(key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                  active
                    ? `${activeBg} ${border} ring-1 ring-inset ${border.replace("border-", "ring-")}`
                    : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? activeBg : "bg-slate-800"} border ${active ? border : "border-slate-700"}`}>
                  <Icon className={`w-4 h-4 ${active ? color : "text-slate-600"}`} />
                </div>
                <span className={`text-xs leading-tight ${active ? activeText : "text-slate-600"}`}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Access level description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={accessLevel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`text-xs mt-2 text-center flex items-center justify-center gap-1.5 ${selected.color}`}
          >
            <selected.Icon className="w-3 h-3" />
            {selected.desc}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Credentials form */}
      <div className="flex-1">
        <div className="space-y-3">
          <div>
            <label className="text-slate-300 text-sm mb-1.5 block">Usuário</label>
            <div className="relative">
              <UserCog className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder={hint.user}
                className="w-full bg-input-background text-white pl-10 pr-4 py-3 rounded-xl border border-border focus:border-blue-500 focus:outline-none placeholder:text-slate-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-1.5 block">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full bg-input-background text-white pl-10 pr-12 py-3 rounded-xl border border-border focus:border-blue-500 focus:outline-none placeholder:text-slate-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-800/50 rounded-xl px-3 py-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-700 text-center">
          Dica: <span className="text-slate-600">{hint.user} / {hint.pass}</span>
        </p>
      </div>

      {/* Login button */}
      <div className="pb-8 pt-4">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-blue-600 text-white disabled:opacity-70 hover:bg-blue-500 active:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Autenticando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </div>
    </div>
  );
}
