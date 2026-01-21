import { useState, useEffect } from 'react';
import { X, Edit2, Check, Mail, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useUiStore } from '@/store';
import { Button } from '@/components/ui/button';

export const ProfileDrawer = () => {
  const { user, logout, updateUserName, fetchUserProfile } = useAuthStore();
  const { profileDrawerOpen, setProfileDrawerOpen } = useUiStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile when drawer opens
  useEffect(() => {
    if (profileDrawerOpen && user) {
      console.log('🎨 PROFILE DRAWER - Opening with user:', {
        id: user.id,
        email: user.email,
        name: user.name,
      });
      fetchUserProfile().catch(console.error);
    }
  }, [profileDrawerOpen, fetchUserProfile]);

  // Update name value when user changes
  useEffect(() => {
    if (user) {
      console.log('🎨 PROFILE DRAWER - User changed, updating display:', {
        id: user.id,
        email: user.email,
        name: user.name,
      });
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
      // Optionally show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!profileDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#1E293B] shadow-2xl z-50 flex flex-col"
        style={{ animation: 'slideIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Account Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Account Information</h3>

            {/* Avatar and User Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {getUserInitials()}
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-white">
                  {user?.name || user?.email.split('@')[0]}
                </p>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700" />

            {/* Name Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                  Name
                </label>
                {!isEditingName && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your name"
                    disabled={isSaving}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNameValue(user?.name || user?.email.split('@')[0] || '');
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="px-4 py-2 rounded-lg bg-gray-700/50 text-white">
                  {user?.name || user?.email.split('@')[0]}
                </div>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Email
              </label>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Sign-in Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Sign-in Method
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-700/50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-white font-medium">Signed in with Google</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-6 border-t border-gray-700">
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center">
              Ready to leave? You can sign back in anytime with your Google account.
            </p>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};
