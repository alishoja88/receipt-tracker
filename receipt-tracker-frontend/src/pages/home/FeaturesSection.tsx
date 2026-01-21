import { Cpu, LayoutGrid, BarChart3 } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeaturesSection = () => {
  const features: Feature[] = [
    {
      icon: <Cpu className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" style={{ color: '#3B82F6' }} />,
      title: 'Automatic Receipt Scanning',
      description:
        'AI-powered scanning extracts data instantly from any receipt. Date, merchant, amount, and items are captured automatically.',
    },
    {
      icon: (
        <LayoutGrid
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
          style={{ color: '#3B82F6' }}
        />
      ),
      title: 'Smart Categorization',
      description:
        'Organize expenses automatically with intelligent category detection. Custom categories and tags make finding receipts effortless.',
    },
    {
      icon: (
        <BarChart3 className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" style={{ color: '#3B82F6' }} />
      ),
      title: 'Expense Analytics',
      description:
        'Track spending with visual reports and insights. Understand your spending patterns and identify opportunities to save.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32" style={{ backgroundColor: '#1E293B' }}>
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
            style={{ color: '#F1F5F9' }}
          >
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl" style={{ color: '#94A3B8' }}>
            Everything you need to manage receipts effortlessly
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 p-6 sm:p-8"
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon Container */}
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4"
                style={{ color: '#F1F5F9' }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm sm:text-base md:text-lg leading-relaxed"
                style={{ color: '#94A3B8' }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
