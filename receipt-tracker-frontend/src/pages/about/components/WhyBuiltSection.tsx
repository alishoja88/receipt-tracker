import { Lightbulb } from 'lucide-react';

export const WhyBuiltSection = () => {
  return (
    <div className="mt-16 sm:mt-20 md:mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Side - Text */}
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Why I Built ReceiptTrack
          </h2>
          <div className="space-y-5 text-base sm:text-lg text-white leading-relaxed">
            <p>
              I built ReceiptTrack because I was tired of losing track of small daily purchases that
              quietly add up over time. Most budgeting tools expect you to connect your bank
              accounts or enter every expense by hand. I wanted something more visual and more
              flexible — a tool that starts from the receipts we all already get.
            </p>
            <p>
              This project is also my way of exploring how OCR and AI can be used in a real,
              practical product. I wanted to design and build a complete system end-to-end: from
              taking a photo of a receipt, to extracting structured data, to showing meaningful
              charts and summaries.
            </p>
          </div>
        </div>

        {/* Right Side - Graphic */}
        <div className="flex justify-center lg:justify-end">
          <div
            className="rounded-2xl p-12 flex flex-col items-center justify-center"
            style={{
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
            }}
          >
            <div className="mb-4">
              <Lightbulb
                className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400"
                style={{ filter: 'drop-shadow(0 0 20px rgba(250, 204, 21, 0.5))' }}
              />
            </div>
            <p className="text-sm sm:text-base text-white text-center">
              A personal problem solved with modern technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
