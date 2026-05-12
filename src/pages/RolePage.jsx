import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { getRoleBySlug } from './roleData';
import PerformanceReviewTool from '../components/PerformanceReviewTool';

function FaqSchema({ faqs }) {
  if (!faqs?.length) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RolePage() {
  const { role: roleSlug } = useParams();
  const data = getRoleBySlug(roleSlug);

  useEffect(() => {
    if (data) {
      document.title = `${data.h1} — Free AI Tool`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', data.metaDescription);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Role not found.
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <FaqSchema faqs={data.faqs} />
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">
          Free AI Tool
        </p>
        <h1
          className="text-4xl font-bold text-slate-900 mb-4"
          style={{ fontFamily: "'Lora', serif" }}
        >
          {data.h1}
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-8">
          {data.intro}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {data.bodyPoints.map((point, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-700"
            >
              <span className="text-slate-400 font-mono mr-2">
                {String(i + 1).padStart(2, '0')}
              </span>
              {point}
            </div>
          ))}
        </div>
      </div>
      <PerformanceReviewTool />
      {data.faqs?.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h2
            className="text-2xl font-bold text-slate-900 mb-8"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {data.faqs.map((faq, i) => (
              <div key={i} className="border-b border-slate-200 pb-6">
                <h3 className="font-semibold text-slate-800 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}