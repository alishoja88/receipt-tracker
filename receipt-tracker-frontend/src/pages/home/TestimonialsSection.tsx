import { Quote, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

export const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      company: 'Creative Studio',
      content:
        'ReceiptTrack has completely transformed how I manage my business expenses. The AI scanning is incredibly accurate, saving me hours every week!',
      rating: 5,
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Designer',
      company: 'Independent',
      content:
        'As a freelancer, tracking receipts was always a headache. This app makes it effortless. The categorization is spot-on and the reports are fantastic.',
      rating: 5,
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Finance Manager',
      company: 'Tech Solutions Inc',
      content:
        'Our team loves how easy it is to scan and organize receipts on the go. The analytics help us identify spending patterns we never noticed before.',
      rating: 5,
      avatar: 'ER',
    },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32" style={{ backgroundColor: '#0F172A' }}>
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
            style={{ color: '#F1F5F9' }}
          >
            What Our Users Say
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl" style={{ color: '#94A3B8' }}>
            Join thousands of satisfied users managing their expenses smarter
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
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
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote
                  className="w-8 h-8 sm:w-10 sm:h-10"
                  style={{ color: 'rgba(59, 130, 246, 0.3)' }}
                />
              </div>

              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="#3B82F6"
                    style={{ color: '#3B82F6' }}
                  />
                ))}
              </div>

              {/* Content */}
              <p
                className="text-sm sm:text-base md:text-lg leading-relaxed mb-6"
                style={{ color: '#94A3B8' }}
              >
                "{testimonial.content}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#3B82F6',
                  }}
                >
                  {testimonial.avatar}
                </div>

                {/* Name & Role */}
                <div>
                  <p className="font-semibold text-base sm:text-lg" style={{ color: '#F1F5F9' }}>
                    {testimonial.name}
                  </p>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    {testimonial.role}
                  </p>
                  <p className="text-xs sm:text-sm" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
