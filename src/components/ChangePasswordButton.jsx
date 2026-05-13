import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MdLockReset } from 'react-icons/md';
import ChangePassword from './ChangePassword';
import { clearPasswordChangeState } from '../store/slices/authSlice';

/**
 * Button that opens a Change Password modal. Designed to live in a sidebar
 * footer next to the Logout button. Modern, low-emphasis styling so the
 * red destructive Logout stays visually dominant.
 */
const ChangePasswordButton = ({ panelLabel }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  // Lock body scroll while modal is open + close on Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false);
    dispatch(clearPasswordChangeState());
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-indigo-400 hover:text-indigo-700 transition-colors shadow-sm"
      >
        <MdLockReset size="1.15em" className="text-indigo-500" />
        Change Password
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Change Password"
          >
            <ChangePassword inModal panelLabel={panelLabel} onClose={close} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordButton;
