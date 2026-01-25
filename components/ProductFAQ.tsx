import { ChevronDown } from 'lucide-react';

interface ProductFAQProps {
  productName: string;
  categoryName: string;
  items?: { question: string; answer: string }[];
}

export default function ProductFAQ({ productName, categoryName, items }: ProductFAQProps) {
  // 优先使用传入的特定 FAQ，否则使用基于产品名生成的通用问题
  const faqs = items && items.length > 0 ? items : [
    {
      question: `What is the lead time for the ${productName}?`,
      answer: `Our standard manufacturing lead time for the ${productName} is typically 2-4 weeks, depending on customization requirements and current production capacity. Please contact our sales team for a precise timeline.`
    },
    {
      question: `Does the ${productName} support custom voltage requirements?`,
      answer: `Yes, as a factory-direct manufacturer, we can customize the electrical system of the ${categoryName} to match your local voltage standards (e.g., 220V/380V/415V/440V, 50Hz/60Hz).`
    },
    {
      question: `What kind of after-sales support is provided for this machine?`,
      answer: `We provide comprehensive after-sales support including remote technical assistance, video installation guides, and a 12-month warranty on core components. Spare parts are available for global shipping.`
    },
    {
      question: `Can this machine be integrated into an existing packing line?`,
      answer: `Absolutely. The ${productName} is designed with flexible PLC controls and conveyor interfaces, making it suitable for both standalone operation and integration into automated packaging lines.`
    }
  ];

  // 生成 Schema.org FAQPage 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="my-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600">Common questions about {productName} and our services.</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-start gap-3">
              <span className="text-blue-600 font-bold">Q:</span>
              {faq.question}
            </h3>
            <div className="text-gray-600 leading-relaxed pl-8">
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

