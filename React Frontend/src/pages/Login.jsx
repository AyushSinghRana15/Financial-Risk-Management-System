import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {
  Activity,
  ArrowLeft,
  ChartNoAxesCombined,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  TriangleAlert,
  Waves,
  X,
} from "lucide-react";
import FinRiskLogo from "../assets/FinRisk.png";
import { API_ENDPOINTS } from "../config/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const mosaicTiles = [
  { tone: "sky", shape: "quarter-a", content: "bars" },
  { tone: "mint", shape: "circle", content: "empty" },
  { tone: "amber", shape: "half-b", content: "line" },
  { tone: "slate", shape: "quarter-b", content: "empty" },
  { tone: "indigo", shape: "square", content: "ring" },
  { tone: "white", shape: "quarter-c", content: "empty" },
  { tone: "white", shape: "quarter-d", content: "line" },
  { tone: "blue", shape: "square", content: "empty" },
  { tone: "cyan", shape: "circle", content: "pulse" },
  { tone: "green", shape: "quarter-a", content: "bars" },
  { tone: "white", shape: "half-a", content: "empty" },
  { tone: "amber", shape: "circle", content: "empty" },
  { tone: "green", shape: "half-b", content: "line" },
  { tone: "white", shape: "square", content: "ring" },
  { tone: "sky", shape: "quarter-c", content: "empty" },
  { tone: "blue", shape: "quarter-d", content: "bars" },
  { tone: "mint", shape: "circle", content: "empty" },
  { tone: "slate", shape: "half-a", content: "empty" },
  { tone: "indigo", shape: "circle", content: "pulse" },
  { tone: "amber", shape: "quarter-a", content: "empty" },
  { tone: "white", shape: "quarter-b", content: "line" },
  { tone: "green", shape: "square", content: "bars" },
  { tone: "blue", shape: "half-b", content: "empty" },
  { tone: "cyan", shape: "quarter-c", content: "ring" },
  { tone: "white", shape: "half-a", content: "empty" },
  { tone: "mint", shape: "square", content: "line" },
  { tone: "amber", shape: "quarter-d", content: "empty" },
  { tone: "slate", shape: "circle", content: "pulse" },
  { tone: "green", shape: "quarter-b", content: "bars" },
  { tone: "white", shape: "quarter-a", content: "empty" },
];

const riskSignals = [
  { label: "Market VaR", value: "12.8%", tone: "text-cyan-700" },
  { label: "Liquidity", value: "Stable", tone: "text-emerald-700" },
  { label: "Credit", value: "Low", tone: "text-indigo-700" },
];

function OriginHelpModal({ onClose, missingClientId }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <TriangleAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">
              Google Sign-In Setup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Follow the official Google OAuth documentation to configure sign-in.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5 text-sm text-slate-600 dark:text-slate-300">
          {missingClientId && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              Add <code className="font-mono text-xs">VITE_GOOGLE_CLIENT_ID</code> to your frontend environment variables.
            </div>
          )}

          <a
            href="https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Open OAuth documentation <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

function TileContent({ type }) {
  if (type === "bars") {
    return (
      <span className="login-tile-bars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    );
  }

  if (type === "line") {
    return (
      <svg className="login-tile-line" viewBox="0 0 80 80" aria-hidden="true">
        <path d="M8 56 C18 42, 25 48, 34 34 S52 24, 62 30 S72 20, 78 14" />
      </svg>
    );
  }

  if (type === "ring") {
    return <span className="login-tile-ring" aria-hidden="true" />;
  }

  if (type === "pulse") {
    return <span className="login-tile-pulse" aria-hidden="true" />;
  }

  return null;
}

function RiskMosaic() {
  return (
    <div className="login-mosaic-wrap" aria-hidden="true">
      <div className="login-mosaic-grid">
        {mosaicTiles.map((tile, index) => (
          <div
            key={`${tile.tone}-${tile.shape}-${index}`}
            className={`login-mosaic-tile tile-${tile.tone} shape-${tile.shape}`}
            style={{
              animationDelay: `${(index % 8) * 0.18}s`,
              animationDuration: `${5.6 + (index % 5) * 0.35}s`,
            }}
          >
            <TileContent type={tile.content} />
          </div>
        ))}
      </div>

      <div className="login-risk-panel">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Risk pulse
          </span>
          <Activity size={15} className="text-emerald-600" />
        </div>
        <div className="mt-3 h-16 overflow-hidden rounded-lg border border-slate-200 bg-white/70">
          <svg className="login-risk-wave" viewBox="0 0 220 64" preserveAspectRatio="none">
            <path d="M0 42 C20 18, 34 52, 54 34 S94 20, 116 38 S150 58, 170 28 S202 14, 220 31" />
            <path d="M0 48 C26 36, 38 42, 56 30 S88 16, 112 24 S156 54, 176 40 S206 34, 220 22" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(Boolean(GOOGLE_CLIENT_ID));

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    const timeout = setTimeout(() => {
      if (!window.google || !window.google.accounts) {
        setScriptLoaded(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const handleGoogleSuccess = async (res) => {
    try {
      setMessage("");
      const response = await axios.post(API_ENDPOINTS.AUTH.GOOGLE, {
        credential: res.credential,
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setMessage(
        detail
          ? `Google login failed: ${detail}`
          : "Google login failed. Check the deployed API URL, CORS, and Google origin settings."
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-visual">
          <div className="login-brand-chip">
            <img src={FinRiskLogo} alt="FinRisk Logo" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-sm font-semibold text-slate-950">FinRisk</p>
              <p className="text-[11px] text-slate-500">Financial intelligence</p>
            </div>
          </div>

          <RiskMosaic />

          <div className="login-signal-row">
            {riskSignals.map((signal) => (
              <div key={signal.label} className="login-signal">
                <span>{signal.label}</span>
                <strong className={signal.tone}>{signal.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="login-form-panel">
          <Link
            to="/"
            className="inline-flex w-max items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>

          <div className="mt-9">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <img src={FinRiskLogo} alt="FinRisk Logo" className="h-11 w-11 object-contain" />
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">FinRisk</p>
                <p className="text-xs text-slate-400">Financial Risk Management</p>
              </div>
            </div>

            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
              <ShieldCheck size={14} />
              Secure risk workspace
            </p>

            <h1 className="text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
              Welcome back.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              Sign in to monitor portfolio exposure, credit signals, liquidity trends, and live market risk.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2">
            <div className="login-mini-metric">
              <ChartNoAxesCombined size={16} />
              <span>VaR</span>
            </div>
            <div className="login-mini-metric">
              <Waves size={16} />
              <span>Liquidity</span>
            </div>
            <div className="login-mini-metric">
              <Activity size={16} />
              <span>Credit</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {message && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {message}
              </div>
            )}

            <div className="min-h-[44px]">
              {scriptLoaded ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setMessage("Google login failed. Please try again.")}
                  shape="pill"
                  size="large"
                  theme="outline"
                  text="continue_with"
                  width="320"
                />
              ) : (
                <button
                  onClick={() => setShowHelp(true)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                >
                  <TriangleAlert size={16} />
                  Fix Google sign-in
                </button>
              )}
            </div>

            <button
              onClick={() => setShowHelp(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              <HelpCircle size={14} />
              Having trouble signing in?
            </button>
          </div>
        </section>
      </div>

      {showHelp && (
        <OriginHelpModal
          onClose={() => setShowHelp(false)}
          missingClientId={!GOOGLE_CLIENT_ID}
        />
      )}
    </div>
  );
}
