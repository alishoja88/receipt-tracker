import { useEffect, useState } from 'react';
import { Mail, MapPin, Linkedin, Github, User, AtSign, MessageCircle, Send } from 'lucide-react';
import { contactApi } from '@/api/contact.api';

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Please fill out this field.';
    if (!formData.email.trim()) {
      newErrors.email = 'Please fill out this field.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) newErrors.message = 'Please fill out this field.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await contactApi.sendMessage({
        name: formData.name,
        email: formData.email,
        message: formData.subject ? `[${formData.subject}] ${formData.message}` : formData.message,
      });
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setErrors({
        submit: error?.response?.data?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactBlocks = [
    {
      icon: Mail,
      label: 'EMAIL',
      value: 'alishojaa88@gmail.com',
      desc: "We'll get back to you within 24 hours",
    },
    {
      icon: MapPin,
      label: 'LOCATION',
      value: 'Canada',
      desc: 'Based in Canada',
    },
  ];

  const socialLinks = [
    { icon: Linkedin, href: 'https://www.linkedin.com/in/alias-shoja/', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/alishoja88', label: 'GitHub' },
  ];

  const inputBase =
    'w-full rounded-[10px] border bg-[rgba(15,23,42,0.5)] px-4 py-3.5 pl-12 text-sm font-medium text-slate-200 outline-none transition-all duration-250 placeholder:text-slate-500';
  const inputBorder = (field: string) =>
    errors[field]
      ? 'border-red-500/40 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
      : 'border-teal-500/[0.18] focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.15),inset_0_1px_4px_rgba(20,184,166,0.12)]';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)' }}
        />
        <div
          className="absolute -right-40 -top-20 h-[500px] w-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Hero */}
        <div className="mb-16 text-center sm:mb-20">
          <h1
            className="mb-3 text-4xl font-extrabold sm:text-5xl"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Get in Touch
          </h1>
          <p className="mx-auto max-w-lg text-base text-slate-400">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-stretch gap-14 lg:grid-cols-[1fr_1.3fr]">
          {/* Left — Contact Info */}
          <div className="flex flex-col gap-6">
            {/* Intro */}
            <p
              className="rounded-xl border border-teal-500/[0.08] px-4 py-4 text-sm leading-relaxed text-slate-300 transition-all duration-300 hover:border-teal-500/[0.15]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(20,184,166,0.02) 0%, rgba(30,41,59,0.06) 100%)',
              }}
            >
              Feel free to reach out for collaboration or questions. We're here to help.
            </p>

            {/* Contact Blocks */}
            {contactBlocks.map(b => (
              <div
                key={b.label}
                className="group rounded-xl border border-teal-500/[0.08] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-500/[0.15] hover:shadow-[0_2px_12px_rgba(20,184,166,0.04)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(20,184,166,0.02) 0%, rgba(30,41,59,0.12) 100%)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] border border-teal-500/[0.12] transition-all duration-250 group-hover:scale-[1.03] group-hover:shadow-[0_0_8px_rgba(20,184,166,0.08)]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                    }}
                  >
                    <b.icon className="h-[18px] w-[18px] text-teal-400" />
                  </div>
                  <p className="text-[13px] font-bold uppercase tracking-[0.5px] text-slate-400">
                    {b.label}
                  </p>
                </div>
                <p className="text-base font-semibold text-slate-100">{b.value}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{b.desc}</p>
              </div>
            ))}

            {/* Social Links */}
            <div>
              <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.5px] text-slate-400">
                Follow Us
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-teal-500/[0.12] text-teal-400 no-underline transition-all duration-250 hover:-translate-y-0.5 hover:scale-[1.08] hover:border-teal-500/25 hover:shadow-[0_0_16px_rgba(20,184,166,0.12)]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(6,182,212,0.04) 100%)',
                    }}
                    title={s.label}
                  >
                    <s.icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Contact Form */}
          <div
            className="flex min-h-full flex-col rounded-2xl border-[1.5px] p-8 transition-all duration-300 hover:shadow-[0_20px_56px_rgba(20,184,166,0.24),inset_0_1px_2px_rgba(255,255,255,0.12)] sm:p-10"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.16) 0%, rgba(30,41,59,0.6) 100%)',
              borderColor: 'rgba(20,184,166,0.32)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 16px 48px rgba(20,184,166,0.18), inset 0 1px 2px rgba(255,255,255,0.1)',
            }}
          >
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
              {/* Name + Email row */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.5px] text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-teal-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`peer ${inputBase} ${inputBorder('name')}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.5px] text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <AtSign className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`${inputBase} ${inputBorder('email')}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.5px] text-slate-400">
                  Subject
                </label>
                <div className="relative">
                  <MessageCircle className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className={`${inputBase} ${inputBorder('subject')}`}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-1 flex-col">
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.5px] text-slate-400">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us what's on your mind..."
                  className={`min-h-[128px] flex-1 resize-y rounded-[10px] border bg-[rgba(15,23,42,0.5)] px-4 py-3.5 text-sm font-medium text-slate-200 outline-none transition-all duration-250 placeholder:text-slate-500 ${
                    errors.message
                      ? 'border-red-500/40 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
                      : 'border-teal-500/[0.18] focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.15),inset_0_1px_4px_rgba(20,184,166,0.12)]'
                  }`}
                />
                {errors.message && <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>}
              </div>

              {/* Error */}
              {errors.submit && (
                <div className="rounded-[10px] border border-red-500/30 bg-red-500/[0.08] p-4">
                  <p className="text-sm font-medium text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Success */}
              {submitSuccess && (
                <div
                  className="animate-[slideDown_300ms_cubic-bezier(0.34,1.56,0.64,1)] rounded-[10px] border border-emerald-500/30 p-4 text-center text-sm font-semibold text-emerald-300"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.08) 100%)',
                  }}
                >
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group/btn relative mt-1 inline-flex w-auto items-center gap-2 self-start overflow-hidden rounded-[10px] border-none px-10 py-4 text-sm font-bold uppercase tracking-[0.6px] text-[#0f172a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(20,184,166,0.36)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                style={{
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
                  boxShadow: '0 6px 24px rgba(20,184,166,0.28)',
                }}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
