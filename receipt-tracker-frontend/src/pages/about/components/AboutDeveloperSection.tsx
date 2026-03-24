import profileImage from '@/assets/images/profile.jpeg';

export const AboutDeveloperSection = () => {
  const skills = [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind CSS',
    'REST APIs',
    'UI/UX Design',
    'Git & GitHub',
  ];

  return (
    <div
      className="mb-24 rounded-[20px] border border-teal-500/[0.12] p-10 text-center sm:p-14"
      style={{
        background: 'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(6,182,212,0.03) 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Avatar */}
      <div className="relative mx-auto mb-8 flex h-[140px] w-[140px] items-center justify-center">
        <div
          className="relative z-[2] h-[140px] w-[140px] overflow-hidden rounded-full border-2 border-teal-500/40"
          style={{
            boxShadow: '0 0 0 8px rgba(20,184,166,0.1), 0 8px 32px rgba(20,184,166,0.15)',
          }}
        >
          <img src={profileImage} alt="Developer" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Name */}
      <h3 className="mb-2 text-[28px] font-extrabold text-slate-100">Ali Shoja</h3>
      <p
        className="mb-6 text-sm font-bold uppercase tracking-[1px]"
        style={{
          background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Front-end Developer
      </p>

      {/* Bio */}
      <div className="mx-auto mb-7 max-w-[600px] space-y-4 text-[15px] leading-[1.8] text-slate-300">
        <p>
          Hi, I’m Ali — a front-end focused developer with hands-on experience in building
          responsive web applications using React and TypeScript. I enjoy turning ideas into real
          products by designing clean user interfaces, creating reusable components, and integrating
          APIs. Recently, I’ve been expanding my skills into full-stack development using
          technologies like Next.js and backend systems.
        </p>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-3">
        {skills.map(skill => (
          <span
            key={skill}
            className="rounded-full border border-teal-500/20 px-4 py-2 text-[13px] font-semibold text-teal-400 transition-all duration-250 hover:-translate-y-0.5 hover:border-teal-500/35 hover:shadow-[0_0_12px_rgba(20,184,166,0.1)]"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(6,182,212,0.05) 100%)',
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};
