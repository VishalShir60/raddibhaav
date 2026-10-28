'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Banknote, Scale, MapPin } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: 'How do I receive my payment? Does the platform hold my money?',
    answer: 'No! RaddiBhaav never touches or holds your payout. The winning dealer pays you directly on your doorstep via Cash or instant UPI (Google Pay, PhonePe, Paytm QR). You only hand over the scrap once you confirm receipt of payment on your phone.',
    icon: <Banknote className="w-4 h-4 text-primary dark:text-accent" />,
  },
  {
    question: 'What if my actual scrap weights differ from my estimate?',
    answer: 'The offer you accept locks in the guaranteed rate per kilogram. When the dealer arrives with their certified electronic scale, each category is weighed in your presence. The final payout is automatically computed using the winning per-kg rates. If weight differs by >15%, you can cancel without any penalty.',
    icon: <Scale className="w-4 h-4 text-primary dark:text-accent" />,
  },
  {
    question: 'Is RaddiBhaav really 100% free for households?',
    answer: 'Yes! Household sellers pay ₹0. There are no listing fees, no convenience charges, and no platform commissions deducted from your payout. You keep 100% of the money the dealer pays.',
    icon: <ShieldCheck className="w-4 h-4 text-primary dark:text-accent" />,
  },
  {
    question: 'When is my complete address shared with dealers?',
    answer: 'To protect your privacy, only your approximate neighborhood (e.g., College Road, Nashik) is visible during the 2-hour bidding window. Your precise building name and flat number are only revealed to the single winning dealer whose offer you explicitly accept.',
    icon: <MapPin className="w-4 h-4 text-primary dark:text-accent" />,
  },
  {
    question: 'What happens during doorstep pickup? What is the 4-digit code?',
    answer: 'When you accept an offer, a private 4-digit doorstep security OTP is generated in your app. The dealer must enter this code when they arrive with their scale, ensuring that only the verified assigned partner picks up your scrap.',
    icon: <ShieldCheck className="w-4 h-4 text-primary dark:text-accent" />,
  },
  {
    question: 'How do local kabadiwalas partner with RaddiBhaav?',
    answer: 'Local scrap dealers can register in minutes with basic KYC verification. During our launch phase, platform commission is 100% waived (₹0 fee), giving you direct access to high-volume household pickups in your operating radius.',
    icon: <HelpCircle className="w-4 h-4 text-primary dark:text-accent" />,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="card-premium p-6 sm:p-10 lg:p-12 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint text-primary dark:text-accent text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Got Questions?</span>
        </div>
        <h2 className="type-h2 font-serif text-text">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-muted">
          Everything you need to know about selling scrap safely, weighing transparently, and receiving top rupee value.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3.5 pt-2">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`rounded-[16px] border transition-all ${
                isOpen
                  ? 'border-primary/40 bg-primary-tint/20 dark:bg-primary-tint/10 shadow-xs'
                  : 'border-border bg-surface hover:border-primary/30'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full min-h-[52px] px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-text text-sm sm:text-base focus:outline-hidden"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-[10px] bg-primary-tint/80 border border-primary/20 shrink-0">
                    {faq.icon}
                  </div>
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-primary dark:text-accent' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/60 animate-in fade-in-50">
                  <div className="pl-12 sm:pl-13">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
