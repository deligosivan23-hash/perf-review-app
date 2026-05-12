import { useState, useRef, useEffect } from "react";

function AdLeaderboard() {
  return (
    <div className="w-full flex justify-center py-2 bg-gray-50 border-b border-gray-200">
      <div
        style={{ width: 728, height: 90, maxWidth: "100%" }}
        className="bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-mono rounded"
      >
        Advertisement — Leaderboard 728×90
      </div>
    </div>
  );
}

function AdRectangle() {
  return (
    <div className="flex justify-center mt-10">
      <div
        style={{ width: 336, height: 280 }}
        className="bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs font-mono rounded"
      >
        Advertisement — Rectangle 336×280
      </div>
    </div>
  );
}

function ReviewOutput({ text }) {
  const paragraphs = text.split("\n").filter((l) => l !== undefined);
  return (
    <div className="space-y-1">
      {paragraphs.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="text-base font-semibold text-slate-800 mt-6 mb-2 pb-2 border-b border-slate-200 first:mt-0"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {line.slice(3)}
            </h3>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p
            key={i}
            className="text-slate-700 leading-relaxed text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function PerformanceReviewTool() {
  const [role, setRole] = useState("");
  const [accomplishments, setAccomplishments] = useState("");
  const [improvements, setImprovements] = useState("");
  const [tone, setTone] = useState("constructive");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current && loading) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, loading]);

  const generate = async () => {
    if (!role.trim()) {
      setError("Please enter the employee's role.");
      return;
    }
    if (!accomplishments.trim()) {
      setError("Please describe at least one key accomplishment.");
      return;
    }
    setError("");
    setOutput("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, accomplishments, improvements, tone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const { text, error: streamErr } = JSON.parse(payload);
            if (streamErr) throw new Error(streamErr);
            if (text) setOutput((prev) => prev + text);
          } catch (parseErr) {}
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tones = [
    { id: "constructive", label: "Constructive", desc: "Growth-focused" },
    { id: "direct", label: "Direct", desc: "Candid & clear" },
    { id: "formal", label: "Formal", desc: "HR-grade language" },
  ];

  return (
    <div
      className="min-h-screen bg-[#f8f7f4]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <AdLeaderboard />
      <header className="max-w-5xl mx-auto px-6 pt-12 pb-10 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3 font-medium">
          Free AI Tool
        </p>
        <h1
          className="text-[2.6rem] font-bold text-slate-900 leading-tight tracking-tight"
          style={{ fontFamily: "'Lora', serif" }}
        >
          Performance Review Generator
        </h1>
        <p className="mt-3 text-slate-500 text-lg font-light max-w-lg mx-auto">
          Structured, professional performance reviews — written by AI, ready for HR.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-7">
              Employee Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Job Role / Title <span className="text-rose-400 font-normal">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Key Accomplishments <span className="text-rose-400 font-normal">*</span>
                </label>
                <textarea
                  value={accomplishments}
                  onChange={(e) => setAccomplishments(e.target.value)}
                  rows={6}
                  placeholder="Describe specific achievements, projects led, metrics improved, and business impact during this review period."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Areas for Improvement{" "}
                  <span className="text-slate-400 font-normal text-xs">optional</span>
                </label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  rows={3}
                  placeholder="Skills to develop, behaviors to address, or gaps in performance…"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`flex flex-col items-center py-3 px-2 rounded-xl border text-center transition ${
                        tone === t.id
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <span className="text-sm font-medium">{t.label}</span>
                      <span className={`text-[10px] mt-0.5 ${tone === t.id ? "text-slate-300" : "text-slate-400"}`}>
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              <button
                onClick={generate}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold text-sm tracking-wide hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Writing Review…
                  </span>
                ) : (
                  "Generate Performance Review →"
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col min-h-[580px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Generated Review
              </h2>
              {output && !loading && (
                <button
                  onClick={copyToClipboard}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition"
                >
                  {copied ? "✓ Copied" : "Copy Text"}
                </button>
              )}
            </div>
            {!output && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">Fill in the form and click Generate</p>
                <p className="text-slate-300 text-xs mt-1">Your review will stream in here</p>
              </div>
            )}
            {loading && !output && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Writing your review…</p>
                </div>
              </div>
            )}
            {output && (
              <div ref={outputRef} className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: 520 }}>
                <ReviewOutput text={output} />
                {loading && (
                  <span className="inline-block w-1.5 h-4 bg-slate-800 ml-0.5 animate-pulse rounded-sm align-middle" />
                )}
              </div>
            )}
          </div>
        </div>
        <AdRectangle />
        <div className="mt-10 text-center text-xs text-slate-400 space-y-1">
          <p>Powered by Claude AI · No data stored · Reviews are a starting point — always apply human judgment</p>
        </div>
      </main>
    </div>
  );
}