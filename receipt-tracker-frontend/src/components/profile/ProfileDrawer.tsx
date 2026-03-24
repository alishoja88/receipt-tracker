import { useState, useEffect } from 'react';
import { X, Edit2, Check, Mail, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useUiStore } from '@/store';

export const ProfileDrawer = () => {
  const { user, logout, updateUserName, fetchUserProfile } = useAuthStore();
  const { profileDrawerOpen, setProfileDrawerOpen } = useUiStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profileDrawerOpen && user) {
      fetchUserProfile().catch(console.error);
    }
  }, [profileDrawerOpen, fetchUserProfile]);

  useEffect(() => {
    if (user) {
      setNameValue(user.name || user.email.split('@')[0]);
    }
  }, [user]);

  const handleClose = () => {
    setProfileDrawerOpen(false);
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue === user?.name) {
      setIsEditingName(false);
      return;
    }
    setIsSaving(true);
    try {
      await updateUserName(nameValue.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.name || user?.email.split('@')[0] || '';

  if (!profileDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        style={{ animation: 'drawerFadeIn 0.3s ease-out' }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col overflow-hidden sm:w-[420px]"
        style={{
          background: 'linear-gradient(180deg, #0c1422 0%, #0a1018 100%)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          animation: 'drawerSlideIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-7 py-5">
          <h2 className="text-2xl font-extrabold text-slate-100">Profile</h2>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-7 overflow-y-auto px-7 py-6">
          {/* ── User Card ── */}
          <div
            className="flex items-center gap-4 rounded-2xl border border-teal-500/[0.12] p-5"
            style={{
              background:
                'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(30,41,59,0.15) 100%)',
            }}
          >
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-teal-500/40 text-xl font-bold text-teal-400"
              style={{
                background:
                  'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.1) 100%)',
                boxShadow: '0 0 0 6px rgba(20,184,166,0.08)',
              }}
            >
              {getUserInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-slate-100">{displayName}</p>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          {/* ── Account Settings ── */}
          <div>
            <h3
              className="mb-4 text-xs font-bold uppercase tracking-[1px]"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Account Settings
            </h3>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500">
                  Full Name
                </label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      className="flex-1 rounded-xl border border-teal-500/20 bg-[rgba(15,23,42,0.5)] px-4 py-3 text-sm font-medium text-slate-100 outline-none transition-all duration-250 placeholder:text-slate-600 focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.15)]"
                      placeholder="Enter your name"
                      disabled={isSaving}
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving}
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-teal-500 text-[#0f172a] transition-all duration-200 hover:bg-teal-400 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <span className="animate-spin text-sm">⏳</span>
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNameValue(displayName);
                      }}
                      disabled={isSaving}
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-400 transition-all duration-200 hover:bg-white/[0.08] hover:text-slate-200 disabled:opacity-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200">
                      {displayName}
                    </div>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/[0.08] text-teal-400 transition-all duration-200 hover:border-teal-500/30 hover:bg-teal-500/[0.12]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.5px] text-slate-500">
                  Email Address
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                  <span className="flex-1 text-sm font-medium text-slate-300">{user?.email}</span>
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Read-Only
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sign-in Method ── */}
          <div>
            <h3
              className="mb-4 text-xs font-bold uppercase tracking-[1px]"
              style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sign-In Method
            </h3>
            <div
              className="flex items-center gap-4 rounded-2xl border border-teal-500/[0.1] p-4"
              style={{
                background:
                  'linear-gradient(135deg, rgba(20,184,166,0.04) 0%, rgba(30,41,59,0.12) 100%)',
              }}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(6,182,212,0.06) 100%)',
                }}
              >
                <Mail className="h-5 w-5 text-teal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-200">Email & Password</p>
                <p className="text-xs text-slate-500">Your primary sign-in method</p>
              </div>
              <span className="rounded-full border border-teal-500/25 bg-teal-500/[0.12] px-3 py-1 text-[11px] font-bold text-teal-400">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="space-y-3 border-t border-white/[0.06] px-7 py-6">
          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(20,184,166,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #2dd4bf 0%, #06defa 100%)',
              boxShadow: '0 4px 16px rgba(20,184,166,0.2)',
            }}
          >
            <LogOut className="h-4 w-4" />
            LOG OUT
          </button>

          {/* Version / Links */}
          <p className="pt-2 text-center text-[11px] text-slate-600">
            ReceiptTrack v1.0.0 ·{' '}
            <span className="cursor-pointer text-teal-500/60 transition-colors hover:text-teal-400">
              Privacy Policy
            </span>
            {' · '}
            <span className="cursor-pointer text-teal-500/60 transition-colors hover:text-teal-400">
              Terms of Service
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
