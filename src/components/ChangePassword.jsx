import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword, clearPasswordChangeState } from '../store/slices/authSlice';
import {
  MdLock, MdLockReset, MdVisibility, MdVisibilityOff, MdCheckCircle, MdError, MdClose,
} from 'react-icons/md';

const PasswordField = ({ label, value, onChange, show, onToggle, autoComplete, minLength }) => (
  <div>
    <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
      <MdLock className="text-indigo-500" size="1.1em" /> {label}
    </label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <MdVisibilityOff size="1.3em" /> : <MdVisibility size="1.3em" />}
      </button>
    </div>
  </div>
);

/**
 * Change Password form — usable from every panel. Reads auth state from Redux,
 * dispatches the changePassword thunk, shows inline success / error banners.
 *
 * Props:
 *   - panelLabel: optional title text shown above the form (e.g. "Admin Panel")
 *   - inModal: when true, renders without the outer max-width wrapper and inner card —
 *     suitable for embedding inside a modal that already provides those.
 *   - onClose: when provided (typically with inModal), renders a close × button in the header.
 */
const ChangePassword = ({ panelLabel, inModal = false, onClose }) => {
  const dispatch = useDispatch();
  const { passwordChangeLoading, passwordChangeError, passwordChangeSuccess } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearPasswordChangeState());
    };
  }, [dispatch]);

  const update = (field) => (v) => {
    setForm((f) => ({ ...f, [field]: v }));
    if (localError) setLocalError('');
    if (passwordChangeError || passwordChangeSuccess) dispatch(clearPasswordChangeState());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setLocalError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError('New password and confirmation do not match.');
      return;
    }
    if (oldPassword === newPassword) {
      setLocalError('New password must be different from the current password.');
      return;
    }

    const result = await dispatch(changePassword({ oldPassword, newPassword }));
    if (result.meta.requestStatus === 'fulfilled') {
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const rawMsg = passwordChangeError?.message;
  const apiError = passwordChangeError
    ? (typeof rawMsg === 'string' && rawMsg.trim() ? rawMsg : 'Failed to change password')
    : null;
  const apiErrorList = Array.isArray(passwordChangeError?.errors) ? passwordChangeError.errors : [];

  const header = (
    <div className={`flex items-start justify-between ${inModal ? 'mb-3' : 'mb-1'}`}>
      <h3 className={`${inModal ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 flex items-center gap-2`}>
        <MdLockReset className="text-indigo-500" size="1.3em" /> Change Password
      </h3>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <MdClose size="1.4em" />
        </button>
      )}
    </div>
  );

  const description = (
    <p className={`text-sm text-gray-500 ${inModal ? 'mb-5' : 'mb-6'}`}>
      {panelLabel ? `${panelLabel}: ` : ''}Update your account password. You will keep your current
      login session — no logout required.
    </p>
  );

  const formMarkup = (
    <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label="Current Password"
            value={form.oldPassword}
            onChange={update('oldPassword')}
            show={showOld}
            onToggle={() => setShowOld((s) => !s)}
            autoComplete="current-password"
          />

          <PasswordField
            label="New Password"
            value={form.newPassword}
            onChange={update('newPassword')}
            show={showNew}
            onToggle={() => setShowNew((s) => !s)}
            autoComplete="new-password"
            minLength={6}
          />

          <PasswordField
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            show={showConfirm}
            onToggle={() => setShowConfirm((s) => !s)}
            autoComplete="new-password"
            minLength={6}
          />

          {(localError || apiError) && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <MdError className="text-red-500 mt-0.5 shrink-0" size="1.2em" />
              <div className="text-sm text-red-700">
                <p>{localError || apiError}</p>
                {apiErrorList.length > 0 && (
                  <ul className="list-disc list-inside mt-1 text-xs">
                    {apiErrorList.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {passwordChangeSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <MdCheckCircle className="text-green-600 mt-0.5 shrink-0" size="1.2em" />
              <p className="text-sm text-green-700 font-medium">{passwordChangeSuccess}</p>
            </div>
          )}

      <button
        type="submit"
        disabled={passwordChangeLoading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {passwordChangeLoading ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );

  if (inModal) {
    return (
      <div>
        {header}
        {description}
        {formMarkup}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {header}
      {description}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        {formMarkup}
      </div>
    </div>
  );
};

export default ChangePassword;
