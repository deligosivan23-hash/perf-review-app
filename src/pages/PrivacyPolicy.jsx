export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#FAFAF8", minHeight:"100vh", padding:"60px 24px" }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        <a href="/" style={{ fontSize:13, color:"#B45309", textDecoration:"none", fontWeight:600 }}>← Back to ReviewAI</a>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:"2.2rem", color:"#0C0A09", margin:"24px 0 8px" }}>Privacy Policy</h1>
        <p style={{ fontSize:13, color:"#78716C", marginBottom:40 }}>Last updated: May 2026</p>

        {[
          {
            title:"What we collect",
            body:"ReviewAI does not collect, store, or transmit any personal information. The text you enter into the tool (job roles, accomplishments, improvement notes) is sent directly to the Anthropic API to generate your review and is not stored on our servers."
          },
          {
            title:"How we use your data",
            body:"Your inputs are used solely to generate the performance review you requested. We do not log, analyze, sell, or share your inputs with any third party beyond Anthropic's API, which processes your request and returns the generated text."
          },
          {
            title:"Anthropic's data handling",
            body:"Text sent to the Anthropic API is subject to Anthropic's privacy policy and terms of service. We encourage you to review their policies at anthropic.com. Do not include personally identifiable information (full names, ID numbers, contact details) in your review inputs."
          },
          {
            title:"Cookies and analytics",
            body:"This site may use basic analytics (such as Vercel Analytics) to understand aggregate traffic patterns — page views, country of origin, device type. No personally identifiable information is collected through analytics."
          },
          {
            title:"Advertising",
            body:"This site uses Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings."
          },
          {
            title:"Children",
            body:"This tool is intended for professional use by adults. We do not knowingly collect information from anyone under 13 years of age."
          },
          {
            title:"Contact",
            body:"If you have questions about this privacy policy, you may contact us through our <a href="https://github.com/deligosivan23-hash/perf-review-app" target="_blank" rel="noopener noreferrer" style={{ color:"#B45309", textDecoration:"none" }}>GitHub repository</a>.
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom:32 }}>
            <h2 style={{ fontFamily:"'Lora',serif", fontSize:"1.2rem", color:"#1C1917", margin:"0 0 10px" }}>{section.title}</h2>
            <p style={{ fontSize:14, color:"#44403C", lineHeight:1.75, margin:0 }}>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}