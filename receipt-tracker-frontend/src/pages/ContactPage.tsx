import { useEffect, useState } from 'react';
import { Mail, Users, Linkedin, Instagram } from 'lucide-react';
import { contactApi } from '@/api/contact.api';

const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Please fill out this field.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Please fill out this field.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Please fill out this field.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await contactApi.sendMessage(formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setErrors({});

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setErrors({
        submit: error?.response?.data?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F172A' }}>
      <section className="py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                style={{ color: '#3B82F6' }}
              >
                Get in Touch
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                We'd love to hear from you. Let's create something amazing together.
              </p>
            </div>

            {/* Main Content - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Contact Information */}
              <div className="space-y-6">
                {/* Email Section */}
                <div
                  className="group relative rounded-xl p-[2px] transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 100%)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Inner Content */}
                  <div
                    className="rounded-xl p-6 h-full w-full"
                    style={{
                      backgroundColor: '#1E293B',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      <h3 className="text-white font-semibold text-lg">Email</h3>
                    </div>
                    <a
                      href="mailto:alishojaa88@gmail.com"
                      className="text-lg block"
                      style={{ color: '#3B82F6' }}
                    >
                      alishojaa88@gmail.com
                    </a>
                  </div>
                </div>

                {/* Connect With Us Section */}
                <div
                  className="group relative rounded-xl p-[2px] transition-all duration-300"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 100%)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Inner Content */}
                  <div
                    className="rounded-xl p-6 h-full w-full"
                    style={{
                      backgroundColor: '#1E293B',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      <h3 className="text-white font-semibold text-lg">Connect With Us</h3>
                    </div>
                    <div className="space-y-3">
                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/in/alias-shoja/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-105"
                        style={{
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        <Linkedin className="w-5 h-5" style={{ color: '#3B82F6' }} />
                        <span className="text-white">LinkedIn - Alishoja</span>
                      </a>
                      {/* Instagram */}
                      <a
                        href="https://instagram.com/alishoja.photography"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-105"
                        style={{
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                        }}
                      >
                        <Instagram className="w-5 h-5" style={{ color: '#3B82F6' }} />
                        <span className="text-white">Instagram - Alishoja Photography</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div
                className="rounded-xl p-6 sm:p-8"
                style={{
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-white font-medium mb-2 text-sm uppercase tracking-wide"
                    >
                      YOUR NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: '#0F172A',
                        border: errors.name
                          ? '1px solid rgba(239, 68, 68, 0.5)'
                          : '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = errors.name
                          ? 'rgba(239, 68, 68, 0.8)'
                          : 'rgba(59, 130, 246, 0.6)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = errors.name
                          ? 'rgba(239, 68, 68, 0.5)'
                          : 'rgba(59, 130, 246, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder=""
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-white font-medium mb-2 text-sm uppercase tracking-wide"
                    >
                      YOUR EMAIL
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                      style={{
                        backgroundColor: '#0F172A',
                        border: errors.email
                          ? '1px solid rgba(239, 68, 68, 0.5)'
                          : '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = errors.email
                          ? 'rgba(239, 68, 68, 0.8)'
                          : 'rgba(59, 130, 246, 0.6)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = errors.email
                          ? 'rgba(239, 68, 68, 0.5)'
                          : 'rgba(59, 130, 246, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder=""
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-white font-medium mb-2 text-sm uppercase tracking-wide"
                    >
                      YOUR MESSAGE
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all resize-y"
                      style={{
                        backgroundColor: '#0F172A',
                        border: errors.message
                          ? '1px solid rgba(239, 68, 68, 0.5)'
                          : '1px solid rgba(59, 130, 246, 0.3)',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = errors.message
                          ? 'rgba(239, 68, 68, 0.8)'
                          : 'rgba(59, 130, 246, 0.6)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = errors.message
                          ? 'rgba(239, 68, 68, 0.5)'
                          : 'rgba(59, 130, 246, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder=""
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                    )}
                  </div>

                  {/* Error Message */}
                  {errors.submit && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {submitSuccess && (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <p className="text-green-400 text-sm font-semibold">
                        Thank you for your message! We will get back to you soon.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-lg font-semibold text-white uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    }}
                  >
                    {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
