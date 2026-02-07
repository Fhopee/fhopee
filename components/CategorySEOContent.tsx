import React from 'react';
import { HelpCircle, FileText, ChevronDown } from 'lucide-react';
import { CategoryData } from '@/lib/category-data';

interface CategorySEOContentProps {
  data: CategoryData;
  categoryName: string;
}

export default function CategorySEOContent({ data, categoryName }: CategorySEOContentProps) {
  // 如果没有详细内容和 FAQ，则不渲染任何东西
  if (!data.contentHtml && (!data.faq || data.faq.length === 0)) {
    return null;
  }

  // 生成 FAQ 的 JSON-LD 结构化数据
  const faqSchema = data.faq && data.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  } : null;

  return (
    <div className="mt-20 border-t border-gray-200 pt-16">
      
      {/* FAQ Schema Script */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Long Description Section */}
      {data.contentHtml && (
        <section className="mb-16 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Technical Insights: {categoryName}
            </h2>
          </div>
          
          <div 
            className="prose prose-slate prose-lg mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            dangerouslySetInnerHTML={{ __html: data.contentHtml }}
          />
        </section>
      )}

      {/* FAQ Section (Dropdown Style) */}
      {data.faq && data.faq.length > 0 && (
        <section className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {data.faq.map((item, index) => (
              <details 
                key={index} 
                className="group bg-white rounded-xl border border-gray-100 open:shadow-md transition-all duration-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded mt-0.5 border border-blue-100">Q</span>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors text-left">
                      {item.question}
                    </h3>
                  </div>
                  <span className="flex-shrink-0 ml-4 transition-transform duration-300 group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </span>
                </summary>
                
                <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed pl-[3.25rem] border-t border-transparent group-open:border-gray-50 animate-in slide-in-from-top-1 fade-in duration-200">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
