import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { getRoleBySlug } from './roleData';
import PerformanceReviewTool from '../components/PerformanceReviewTool';

const C = {
  amber: "#B45309", amberLight: "#FEF3C7", amberMid: "#D97706",
  ink: "#0C0A09", inkSoft: "#1C1917", cream: "#FAFAF8",
  slate: "#44403C", slateLight: "#78716C", border: "#E7E5E4", white: "#FFFFFF",
};

function FaqSchema({ faqs }) {
  if (!faqs?.length) return null;
  const schema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question", "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a }
    }))
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function RolePage() {
  const { role: roleSlug } = useParams();
  const data = getRoleBySlug(roleSlug);

  useEffect(() => {
    if (data) {
      document.title = `${data.h1} — Free AI Tool | ReviewAI`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', data.metaDescription);
    }
  }, [data]);

  if (!data) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", color:C.slateLight }}>
      Role not found. <Link to="/" style={{ color:C.amber, marginLeft:8 }}>Go home →</Link>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:C.cream, minHeight:"100vh" }}>
      <FaqSchema faqs={data.faqs} />

      {/* Navbar */}
      <nav style={{ background:C.white, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
            <div style={{ width:32, height:32, borderRadius:9, background:C.amber, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(180,83,9,0.3)" }}>
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M3 4h11M3 8h7M3 12h9M3 16h5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:17, color:C.ink, letterSpacing:"-0.02em" }}>ReviewAI</span>
          </Link>
          <Link to="/" style={{ fontSize:12, color:C.slateLight, textDecoration:"none", fontWeight:500 }}>← All roles</Link>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ background:`linear-gradient(160deg, ${C.inkSoft} 0%, #0C0A09 100%)`, padding:"60px 24px 70px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:`radial-gradient(ellipse 50% 60% at 50% 100%, rgba(180,83,9,0.15) 0%, transparent 70%)` }}/>
        <div style={{ position:"relative", maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(180,83,9,0.15)", border:"1px solid rgba(217,119,6,0.3)", borderRadius:100, padding:"5px 16px", marginBottom:22 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:C.amberMid, display:"inline-block" }}/>
            <span style={{ fontSize:10.5, fontWeight:700, letterSpacing:"0.14em", color:"#FCD34D", textTransform:"uppercase" }}>Free AI Tool</span>
          </div>
          <h1 style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:"clamp(1.8rem,4vw,2.8rem)", color:C.white, lineHeight:1.15, letterSpacing:"-0.02em", margin:"0 0 16px" }}>
            {data.h1}
          </h1>
          <p style={{ fontSize:16, color:"#A8A29E", fontWeight:300, lineHeight:1.65, margin:0, maxWidth:560 }}>
            {data.intro}
          </p>
        </div>
      </header>

      {/* Body points */}
      {data.bodyPoints?.length > 0 && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"44px 24px 0" }}>
          <p style={{ fontSize:10.5, fontWeight:800, letterSpacing:"0.16em", textTransform:"uppercase", color:C.slateLight, marginBottom:16 }}>
            What this review covers
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:12, marginBottom:8 }}>
            {data.bodyPoints.map((point, i) => (
              <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px", display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:26, height:26, borderRadius:7, background:C.amberLight, border:`1px solid #FDE68A`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.amber, flexShrink:0 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p style={{ fontSize:13, color:C.slate, lineHeight:1.6, margin:0 }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool */}
      <PerformanceReviewTool embedded />

      {/* FAQs */}
      {data.faqs?.length > 0 && (
        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 24px 80px" }}>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:"1.8rem", fontWeight:700, color:C.inkSoft, marginBottom:32 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {data.faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom:`1px solid ${C.border}`, padding:"22px 0" }}>
                <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:700, color:C.inkSoft, margin:"0 0 10px" }}>{faq.q}</h3>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.75, margin:0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background:C.inkSoft, padding:"36px 24px", textAlign:"center", borderTop:`1px solid #292524` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:C.amber, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M3 4h11M3 8h7M3 12h9M3 16h5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:17, color:C.white, letterSpacing:"-0.02em" }}>ReviewAI</span>
        </div>
        <p style={{ fontSize:12, color:"#57534E", marginTop:12, marginBottom:0 }}>
          © 2026 ReviewAI · Free forever · Built with Claude AI ·{" "}
          <Link to="/privacy" style={{ color:"#78716C", textDecoration:"none" }}>Privacy Policy</Link>
        </p>
      </footer>
    </div>
  );
}