import { useState, useRef, useEffect } from "react";

const C = {
  amber: "#B45309",
  amberLight: "#FEF3C7",
  amberMid: "#D97706",
  ink: "#0C0A09",
  inkSoft: "#1C1917",
  cream: "#FAFAF8",
  creamDark: "#F5F4F0",
  slate: "#44403C",
  slateLight: "#78716C",
  border: "#E7E5E4",
  white: "#FFFFFF",
  red: "#DC2626",
  green: "#16A34A",
};

const styles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .rv-input {
    width:100%; box-sizing:border-box;
    padding:11px 15px; border-radius:10px;
    border:1.5px solid ${C.border}; background:${C.cream};
    font-size:14px; font-family:'DM Sans',sans-serif; color:${C.ink};
    outline:none; transition:border-color 0.15s, background 0.15s;
  }
  .rv-input::placeholder { color:${C.slateLight}; }
  .rv-input:focus { border-color:${C.amber}; background:${C.white}; }

  .rv-tone {
    padding:12px 6px; border-radius:10px; cursor:pointer;
    border:1.5px solid ${C.border}; background:${C.white};
    transition:all 0.15s; text-align:center;
    font-family:'DM Sans',sans-serif;
  }
  .rv-tone:hover { border-color:${C.amberMid}; }
  .rv-tone.active { border-color:${C.amber}; background:${C.amberLight}; }

  .rv-btn {
    width:100%; padding:15px; border-radius:12px; border:none;
    background:${C.amber}; color:${C.white};
    font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif;
    letter-spacing:0.02em; cursor:pointer;
    transition:all 0.2s;
    box-shadow:0 2px 12px rgba(180,83,9,0.3);
  }
  .rv-btn:hover:not(:disabled) {
    background:${C.amberMid};
    transform:translateY(-1px);
    box-shadow:0 6px 20px rgba(180,83,9,0.38);
  }
  .rv-btn:disabled { opacity:0.55; cursor:not-allowed; }

  .rv-copy {
    font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;
    padding:6px 14px; border-radius:8px; cursor:pointer;
    transition:all 0.15s; border:1.5px solid ${C.border};
    background:${C.white}; color:${C.slate};
  }
  .rv-copy:hover { border-color:${C.amber}; color:${C.amber}; }
  .rv-copy.copied { border-color:#BBF7D0; background:#F0FDF4; color:${C.green}; }

  .rv-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:24px;
    align-items:start;
  }
  @media(max-width:860px){
    .rv-grid { grid-template-columns:1fr; }
  }

  .rv-steps {
    display:flex; align-items:center; justify-content:center;
    gap:12px; flex-wrap:wrap;
  }
  @media(max-width:600px){
    .rv-steps { gap:8px; }
  }

  .rv-hero-title {
    font-size:clamp(2rem,5vw,3.6rem);
  }
  .rv-trust {
    display:flex; align-items:center; justify-content:center;
    gap:28px; flex-wrap:wrap;
  }
  @media(max-width:500px){
    .rv-trust { gap:14px; }
  }
`;

function Wordmark({ light = false }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
      <div style={{
        width:32, height:32, borderRadius:9,
        background:C.amber, display:"flex",
        alignItems:"center", justifyContent:"center",
        boxShadow:"0 2px 8px rgba(180,83,9,0.3)"
      }}>
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
          <path d="M3 4h11M3 8h7M3 12h9M3 16h5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{
        fontFamily:"'Lora',serif", fontWeight:700, fontSize:17,
        color: light ? C.white : C.ink, letterSpacing:"-0.02em"
      }}>
        ReviewAI
      </span>
    </div>
  );
}

function ReviewOutput({ text }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return (
          <h3 key={i} style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700,
            color:C.amber, textTransform:"uppercase", letterSpacing:"0.12em",
            margin:"20px 0 8px", paddingBottom:8,
            borderBottom:`1px solid ${C.amberLight}`
          }}>{line.slice(3)}</h3>
        );
        if (line.trim() === "") return <div key={i} style={{ height:4 }} />;
        return (
          <p key={i} style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:13.5,
            color:C.slate, lineHeight:1.75, margin:0
          }}>{line}</p>
        );
      })}
    </div>
  );
}

export default function PerformanceReviewTool({ embedded = false }) {
  const [role, setRole] = useState("");
  const [accomplishments, setAccomplishments] = useState("");
  const [improvements, setImprovements] = useState("");
  const [tone, setTone] = useState("constructive");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const outputRef = useRef(null);
  const toolRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (outputRef.current && loading)
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output, loading]);

  const scrollToTool = () => toolRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  const generate = async () => {
    if (!role.trim()) { setError("Please enter the employee's role."); return; }
    if (!accomplishments.trim()) { setError("Please describe at least one key accomplishment."); return; }
    setError(""); setOutput(""); setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ role, accomplishments, improvements, tone }),
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
        buffer += decoder.decode(value, { stream:true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") continue;
          try {
            const { text, error: e } = JSON.parse(payload);
            if (e) throw new Error(e);
            if (text) setOutput(p => p + text);
          } catch (_) {}
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tones = [
    { id:"constructive", label:"Constructive", desc:"Growth-focused" },
    { id:"direct", label:"Direct", desc:"Candid & clear" },
    { id:"formal", label:"Formal", desc:"HR-grade" },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream, minHeight:"100vh" }}>
      <style>{styles}</style>

      {/* Navbar */}
      <nav style={{
        background:C.white, borderBottom:`1px solid ${C.border}`,
        position:"sticky", top:0, zIndex:100,
        boxShadow:"0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{
          maxWidth:1100, margin:"0 auto", padding:"0 24px",
          height:56, display:"flex", alignItems:"center",
          justifyContent:"space-between"
        }}>
          <Wordmark />
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:12, color:C.slateLight, fontWeight:500 }}>
              Free · No signup required
            </span>
            <button
              onClick={scrollToTool}
              style={{
                padding:"8px 18px", borderRadius:8, border:"none",
                background:C.amber, color:C.white,
                fontSize:12, fontWeight:700, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                boxShadow:"0 2px 8px rgba(180,83,9,0.25)",
                transition:"all 0.15s"
              }}
            >
              Try it free ↓
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={{
        background:`linear-gradient(160deg, ${C.inkSoft} 0%, #0C0A09 100%)`,
        padding:"80px 24px 90px",
        textAlign:"center", position:"relative", overflow:"hidden"
      }}>
        {/* Grain texture */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04, pointerEvents:"none" }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)"/>
        </svg>
        {/* Warm glow */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:`radial-gradient(ellipse 50% 60% at 50% 100%, rgba(180,83,9,0.18) 0%, transparent 70%)`
        }}/>

        <div style={{
          position:"relative", maxWidth:680, margin:"0 auto",
          animation: mounted ? "fadeUp 0.55s ease both" : "none"
        }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(180,83,9,0.15)",
            border:"1px solid rgba(217,119,6,0.3)",
            borderRadius:100, padding:"5px 16px", marginBottom:26
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.amberMid, display:"inline-block" }}/>
            <span style={{
              fontSize:10.5, fontWeight:700,
              letterSpacing:"0.14em", color:"#FCD34D",
              textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif"
            }}>Free AI Tool</span>
          </div>

          <h1 className="rv-hero-title" style={{
            fontFamily:"'Lora',serif", fontWeight:700,
            color:C.white, lineHeight:1.1,
            letterSpacing:"-0.025em", margin:"0 0 20px"
          }}>
            Performance Reviews,<br/>
            <em style={{ color:C.amberMid, fontStyle:"normal" }}>Written by AI.</em>
          </h1>

          <p style={{
            fontSize:17, color:"#A8A29E", fontWeight:300,
            lineHeight:1.65, margin:"0 auto 18px",
            maxWidth:460
          }}>
            Structured, HR-ready reviews built from your notes — in under 30 seconds.
          </p>

          <p style={{
            fontSize:13, color:"#78716C", margin:"0 auto 36px",
            fontStyle:"italic"
          }}>
            Trusted by managers and HR teams across 10+ role types
          </p>

          <div className="rv-trust">
            {["No signup", "No data stored", "10 role types", "Rate limited & secure"].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:7, color:"#78716C", fontSize:13 }}>
                <span style={{ color:C.amberMid, fontWeight:700 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* How it works */}
      <div style={{
        background:C.white, borderBottom:`1px solid ${C.border}`,
        padding:"20px 24px"
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="rv-steps">
            {[
              { n:"01", label:"Describe the employee's role & accomplishments" },
              { n:"02", label:"Choose your review tone" },
              { n:"03", label:"Generate, review, and copy to HR system" },
            ].map((s, i, arr) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{
                    width:28, height:28, borderRadius:8,
                    background:C.amberLight, border:`1px solid #FDE68A`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, color:C.amber,
                    flexShrink:0
                  }}>{s.n}</div>
                  <span style={{ fontSize:12.5, fontWeight:500, color:C.slate, maxWidth:180 }}>{s.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color:C.border, fontSize:20, flexShrink:0 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tool */}
      <main ref={toolRef} style={{ maxWidth:1100, margin:"0 auto", padding:"44px 24px 64px" }}>
        <div className="rv-grid">

          {/* Left — Form */}
          <div style={{
            background:C.white, borderRadius:18,
            border:`1px solid ${C.border}`, padding:32,
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:26 }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:C.amber }}/>
              <span style={{
                fontSize:10, fontWeight:800, letterSpacing:"0.16em",
                textTransform:"uppercase", color:C.slateLight
              }}>Employee Details</span>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:7 }}>
                  Job Role / Title <span style={{ color:C.red }}>*</span>
                </label>
                <input
                  className="rv-input"
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:7 }}>
                  Key Accomplishments <span style={{ color:C.red }}>*</span>
                </label>
                <textarea
                  className="rv-input"
                  value={accomplishments}
                  onChange={e => setAccomplishments(e.target.value)}
                  rows={6}
                  placeholder="Describe specific achievements, projects led, metrics improved, and business impact during this review period. The more specific, the better the output."
                  style={{ resize:"none" }}
                />
                <p style={{ fontSize:11, color:C.slateLight, margin:"5px 0 0", fontStyle:"italic" }}>
                  Tip: Include numbers where possible — "increased revenue by 18%" beats "improved sales."
                </p>
              </div>

              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:7 }}>
                  Areas for Improvement{" "}
                  <span style={{ fontSize:11, fontWeight:400, color:C.slateLight }}>optional</span>
                </label>
                <textarea
                  className="rv-input"
                  value={improvements}
                  onChange={e => setImprovements(e.target.value)}
                  rows={3}
                  placeholder="Skills to develop, behaviors to address, or performance gaps to note…"
                  style={{ resize:"none" }}
                />
              </div>

              <div>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.inkSoft, marginBottom:10 }}>
                  Review Tone
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {tones.map(t => (
                    <button
                      key={t.id}
                      className={`rv-tone${tone === t.id ? " active" : ""}`}
                      onClick={() => setTone(t.id)}
                    >
                      <div style={{
                        fontSize:12, fontWeight:700,
                        color: tone === t.id ? C.amber : C.inkSoft,
                        marginBottom:3
                      }}>{t.label}</div>
                      <div style={{
                        fontSize:10, color: tone === t.id ? C.amberMid : C.slateLight
                      }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{
                  background:"#FEF2F2", border:"1px solid #FECACA",
                  color:C.red, fontSize:13, padding:"11px 15px", borderRadius:9
                }}>{error}</div>
              )}

              <button className="rv-btn" onClick={generate} disabled={loading}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <span style={{
                      width:15, height:15, borderRadius:"50%",
                      border:"2px solid rgba(255,255,255,0.3)",
                      borderTopColor:"#fff", display:"inline-block",
                      animation:"spin 0.7s linear infinite"
                    }}/>
                    Writing Review…
                  </span>
                ) : "Generate Performance Review →"}
              </button>

              <p style={{ fontSize:11, color:C.slateLight, textAlign:"center", margin:0 }}>
                Free · Rate limited to prevent abuse · No data stored
              </p>
            </div>
          </div>

          {/* Right — Output */}
          <div style={{
            background:C.white, borderRadius:18,
            border:`1px solid ${C.border}`, padding:32,
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            display:"flex", flexDirection:"column", minHeight:540
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{
                  width:5, height:5, borderRadius:"50%",
                  background: output && !loading ? C.green : C.border,
                  transition:"background 0.4s"
                }}/>
                <span style={{
                  fontSize:10, fontWeight:800, letterSpacing:"0.16em",
                  textTransform:"uppercase", color:C.slateLight
                }}>Generated Review</span>
              </div>
              {output && !loading && (
                <button
                  className={`rv-copy${copied ? " copied" : ""}`}
                  onClick={copyToClipboard}
                >
                  {copied ? "✓ Copied to clipboard" : "Copy text"}
                </button>
              )}
            </div>

            {/* Empty state */}
            {!output && !loading && (
              <div style={{
                flex:1, border:`1.5px dashed ${C.border}`,
                borderRadius:12, overflow:"hidden", position:"relative",
                background:C.creamDark
              }}>
                {/* Blurred sample */}
                <div style={{
                  padding:"20px 20px 0",
                  filter:"blur(4px)", opacity:0.3,
                  userSelect:"none", pointerEvents:"none"
                }}>
                  <div style={{ fontSize:10, fontWeight:800, color:C.amber, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.amberLight}` }}>Overall Performance</div>
                  <p style={{ fontSize:13, color:C.slate, lineHeight:1.7, marginBottom:16 }}>
                    Jordan exceeded expectations across all three product initiatives this quarter, delivering the analytics dashboard two weeks ahead of schedule while simultaneously reducing on-call incidents by 34%.
                  </p>
                  <div style={{ fontSize:10, fontWeight:800, color:C.amber, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.amberLight}` }}>Key Strengths</div>
                  <p style={{ fontSize:13, color:C.slate, lineHeight:1.7 }}>
                    Jordan's ability to translate ambiguous business requirements into precise technical specifications was most evident in the Q3 platform migration, where clear documentation prevented three potential integration failures…
                  </p>
                </div>
                {/* Overlay */}
                <div style={{
                  position:"absolute", inset:0,
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  background:"rgba(250,250,248,0.72)"
                }}>
                  <div style={{
                    width:50, height:50, borderRadius:14,
                    background:C.amber,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    marginBottom:14,
                    boxShadow:"0 4px 16px rgba(180,83,9,0.28)"
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.inkSoft, margin:0 }}>Your review appears here</p>
                  <p style={{ fontSize:12, color:C.slateLight, marginTop:5, marginBottom:0 }}>Fill in the form and click Generate</p>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && !output && (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{
                    width:40, height:40,
                    border:`3px solid ${C.amberLight}`,
                    borderTopColor:C.amber,
                    borderRadius:"50%", margin:"0 auto 14px",
                    animation:"spin 0.7s linear infinite"
                  }}/>
                  <p style={{ fontSize:14, color:C.slateLight, margin:0 }}>Writing your review…</p>
                  <p style={{ fontSize:12, color:C.border, margin:"5px 0 0", fontStyle:"italic" }}>Usually takes 8–12 seconds</p>
                </div>
              </div>
            )}

            {/* Output */}
            {output && (
              <div ref={outputRef} style={{ flex:1, overflowY:"auto", paddingRight:4, maxHeight:520 }}>
                <ReviewOutput text={output} />
                {loading && (
                  <span style={{
                    display:"inline-block", width:7, height:18,
                    background:C.amber, marginLeft:2, borderRadius:2,
                    verticalAlign:"middle", animation:"blink 1s ease infinite"
                  }}/>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign:"center", fontSize:12, color:C.slateLight,
          marginTop:36, marginBottom:0, lineHeight:1.6
        }}>
          Powered by Claude AI · Reviews are a starting point — always apply human judgment before submitting to HR ·{" "}
          <a href="/privacy" style={{ color:C.amber, textDecoration:"none" }}>Privacy Policy</a>
        </p>
      </main>

      {/* Footer — only shown on homepage, not when embedded in RolePage */}
      {!embedded && (
        <footer style={{
          background:C.inkSoft,
          padding:"36px 24px",
          textAlign:"center",
          borderTop:`1px solid #292524`
        }}>
          <Wordmark light />
          <p style={{ fontSize:12, color:"#57534E", marginTop:12, marginBottom:0 }}>
          © 2026 ReviewAI · Free forever · Built with Claude AI ·{" "}
          <a href="https://github.com/deligosivan23-hash/perf-review-app" target="_blank" rel="noopener noreferrer" style={{ color:"#78716C", textDecoration:"none" }}>GitHub</a>
          {" "}·{" "}
          <a href="/privacy" style={{ color:"#78716C", textDecoration:"none" }}>Privacy Policy</a>
        </p>
        </footer>
      )}
    </div>
  );
}