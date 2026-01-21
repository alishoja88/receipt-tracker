import logoImage from '@/assets/images/logo.png';

export const AboutTopSection = () => {
  return (
    <div className="text-center mb-12">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-lg">
          <img
            src={logoImage}
            alt="ReceiptTrack Logo"
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
        About ReceiptTrack
      </h1>

      {/* Tagline */}
      <p className="text-lg sm:text-xl md:text-2xl text-white max-w-2xl mx-auto">
        Turn messy paper receipts into clear, visual insights about your spending.
      </p>
    </div>
  );
};
