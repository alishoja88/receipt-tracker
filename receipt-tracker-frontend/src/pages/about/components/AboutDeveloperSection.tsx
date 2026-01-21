import profileImage from '@/assets/images/profile.jpeg';

export const AboutDeveloperSection = () => {
  return (
    <div className="mt-16 sm:mt-20 md:mt-24">
      {/* Title */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-8">
        About the Developer
      </h2>

      {/* Developer Card */}
      <div
        className="rounded-2xl p-8 sm:p-10 md:p-12 lg:p-16 max-w-4xl mx-auto"
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          {/* Profile Image */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-offset-2 ring-offset-[#1E293B]"
            style={{
              ringColor: '#8B5CF6',
            }}
          >
            <img
              src={profileImage}
              alt="Ali - Full-Stack Developer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and Title */}
          <div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">Ali</h3>
            <p className="text-base sm:text-lg text-gray-300">Full-Stack Developer</p>
          </div>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-5 text-base sm:text-lg text-white leading-relaxed">
          <p>
            Hi, I'm Ali - a full-stack developer with a strong focus on front-end UX and TypeScript.
          </p>
          <p>
            I enjoy taking an idea from a rough sketch all the way to a working product: designing
            the user experience, building React components, structuring a clean backend (for example
            with NestJS), and connecting everything to real APIs and databases.
          </p>
          <p>
            ReceiptTrack started as a side project, but I treated it like a real product. I wanted
            to show how I think about architecture, data modeling, and clean code, not just UI
            layouts. In this app I combined a modern React + TypeScript front end with a
            Node.js/NestJS backend, a relational database, and AI integrations.
          </p>
          <p>
            In my work I'm comfortable using both traditional tooling and AI tools. I use AI to
            speed up development (scaffolding, refactoring, documentation) and also inside the
            product itself — for example, integrating cloud OCR services and LLM APIs to turn
            unstructured data into something useful.
          </p>
          <p>
            Outside of this project, I have experience with REST APIs, authentication, state
            management, and basic DevOps (Docker and deployments). ReceiptTrack is a good example of
            the kind of full-stack, real-world problems I like to work on.
          </p>
        </div>
      </div>
    </div>
  );
};
