export const AboutDescriptionSection = () => {
  return (
    <div
      className="rounded-2xl p-8 sm:p-10 md:p-12 lg:p-16 max-w-4xl mx-auto"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="space-y-6 text-base sm:text-lg md:text-xl text-white leading-relaxed">
        <p>
          ReceiptTrack is a simple, modern web application that helps you track your expenses by
          scanning and organizing your receipts. Instead of manually typing every purchase into a
          spreadsheet, you just upload a photo of your receipt and let the app do the heavy lifting.
        </p>
        <p>
          Using a combination of cloud OCR and AI, ReceiptTrack recognizes key details like the
          store, date, total amount, and category. You can then review your spending over time,
          filter by category, and start making better decisions about where your money goes.
        </p>
      </div>
    </div>
  );
};
