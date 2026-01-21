import { Upload, Sparkles, CheckCircle, BarChart3 } from 'lucide-react';

interface StepCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard = ({ number, icon, title, description }: StepCardProps) => {
  return (
    <div
      className="rounded-2xl p-6 sm:p-8 h-full"
      style={{
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="relative mb-4">
        <div
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          }}
        >
          {icon}
        </div>
        <div
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{
            backgroundColor: '#8B5CF6',
          }}
        >
          {number}
        </div>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
};

export const HowItWorksSection = () => {
  const steps = [
    {
      number: 1,
      icon: <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      title: 'Upload Receipt',
      description:
        'Take a photo or upload an image of your receipt. The app accepts common formats like JPG and PNG.',
    },
    {
      number: 2,
      icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      title: 'AI Extracts Data',
      description:
        'Cloud OCR and AI analyze the receipt to extract store name, date, amount, and category automatically.',
    },
    {
      number: 3,
      icon: <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      title: 'Review & Organize',
      description:
        'Check the extracted data, make edits if needed, and organize receipts by category or date range.',
    },
    {
      number: 4,
      icon: <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
      title: 'Get Insights',
      description:
        'View spending trends, charts, and summaries to understand where your money goes each month.',
    },
  ];

  return (
    <div className="mt-16 sm:mt-20 md:mt-24">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 sm:mb-12">
        How ReceiptTrack Works
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <StepCard
            key={step.number}
            number={step.number}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
        {/* Empty div for spacing in 3-column layout */}
        <div className="hidden lg:block"></div>
      </div>
    </div>
  );
};
