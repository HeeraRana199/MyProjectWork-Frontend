import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { getAllCandidates, uploadExcel, registerLeader, clearLeaderRegistration, deleteCandidate } from '../store/slices/adminSlice';
import { FcComboChart, FcConferenceCall, FcDocument, FcUpload, FcBusinessman } from 'react-icons/fc';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle, MdError, MdDelete, MdWarning, MdCloudUpload, MdClose, MdListAlt, MdAddCircleOutline, MdSync, MdBlock } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';
import ChangePasswordButton from '../components/ChangePasswordButton';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentPage, setCurrentPage] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { candidates, loading, pagination } = useSelector((state) => state.admin);
  const { role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (activeTab === 'trainees') {
      dispatch(getAllCandidates({ page: currentPage }));
    }
  }, [activeTab, dispatch, currentPage]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleViewTalentCard = (candidateId) => {
    navigate(`/admin/talent-card/${candidateId}`);
  };

  const handleDeleteCandidate = async (candidateId) => {
    const result = await dispatch(deleteCandidate(candidateId));
    if (result.meta.requestStatus === 'fulfilled') {
      // Refetch in case the current page is now empty / pagination shifted
      dispatch(getAllCandidates({ page: currentPage }));
    }
  };

  const menuItems = [
    { id: 'upload', label: 'Upload Excel' },
    { id: 'trainees', label: 'All Trainees' },
    { id: 'register-leader', label: 'Register Leader' },
    { id: 'logs', label: 'Ingestion Logs' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
                activeTab === item.id ? 'bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700' : 'text-gray-600'
              }`}
            >
                {item.label === 'Upload Excel' && <FcUpload size="1.5em" />}
                {item.label === 'All Trainees' && <FcConferenceCall size="1.5em" />}
                {item.label === 'Register Leader' && <FcBusinessman size="1.5em" />}
                {item.label === 'Ingestion Logs' && <FcComboChart size="1.5em" />}
              <p className='ml-3'>{item.label}</p>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-6 space-y-2 bg-white border-t border-gray-100">
          <ChangePasswordButton panelLabel="Admin Panel" />
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'upload' && <ExcelUpload />}
        {activeTab === 'trainees' && (
          <TraineesList
            candidates={candidates}
            loading={loading}
            onViewTalentCard={handleViewTalentCard}
            onDeleteCandidate={handleDeleteCandidate}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {activeTab === 'register-leader' && <RegisterLeader />}
        {activeTab === 'logs' && <IngestionLogs />}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Excel Upload Component
// ─────────────────────────────────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const isExcelFile = (f) => {
  if (!f) return false;
  const name = f.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls');
};

const StatCard = ({ Icon, label, value, color }) => (
  <div className={`rounded-xl border ${color.border} ${color.bg} p-4`}>
    <div className="flex items-center justify-between">
      <span className={`text-xs font-semibold uppercase tracking-wide ${color.text}`}>{label}</span>
      <Icon className={color.text} size="1.2em" />
    </div>
    <p className={`text-3xl font-bold mt-2 ${color.text}`}>{value ?? 0}</p>
  </div>
);

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const acceptFile = (f) => {
    if (!f) return;
    if (!isExcelFile(f)) {
      setLocalError('Only .xlsx and .xls files are supported.');
      return;
    }
    setFile(f);
    setUploadResult(null);
    setLocalError('');
  };

  const handleFileChange = (e) => acceptFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadResult(null);
    setLocalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    const result = await dispatch(uploadExcel(file));
    if (result.meta.requestStatus === 'fulfilled') {
      setUploadResult(result.payload);
    } else {
      setUploadResult(null);
    }
  };

  const apiErrorMessage =
    typeof error === 'string'
      ? error
      : error?.message || (error ? JSON.stringify(error) : null);
  const apiErrorList = Array.isArray(error?.errors) ? error.errors : [];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FcUpload size="1.2em" /> Upload Excel File
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Import a candidate roster. New rows are inserted; existing rows are merged.
          Accepted formats: <span className="font-medium">.xlsx</span>, <span className="font-medium">.xls</span>.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        {/* Drop zone OR file preview */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all px-6 py-12 flex flex-col items-center justify-center text-center
              ${isDragging
                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/40'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
              <MdCloudUpload className={isDragging ? 'text-indigo-600' : 'text-indigo-500'} size="2.2em" />
            </div>
            <p className="text-base font-semibold text-gray-700">
              {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <span className="text-indigo-600 font-medium underline-offset-2 hover:underline">browse from your computer</span>
            </p>
            <p className="text-xs text-gray-400 mt-3">XLSX or XLS</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <FaFileExcel className="text-emerald-600" size="1.6em" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatFileSize(file.size)} • Ready to upload
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              disabled={loading}
              className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors p-1"
              aria-label="Remove file"
              title="Remove file"
            >
              <MdClose size="1.4em" />
            </button>
          </div>
        )}

        {/* Local validation error (e.g. wrong file type) */}
        {localError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <MdError className="text-red-500 mt-0.5 shrink-0" size="1.2em" />
            <p className="text-sm text-red-700">{localError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClearFile}
            disabled={!file || loading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <MdCloudUpload size="1.2em" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      {/* API error */}
      {error && apiErrorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <MdError className="text-red-600" size="1.3em" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800">Upload Failed</h4>
              <p className="text-sm text-red-700 mt-1">{apiErrorMessage}</p>
              {apiErrorList.length > 0 && (
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-0.5">
                  {apiErrorList.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success result */}
      {uploadResult && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-white shadow-md p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <MdCheckCircle className="text-emerald-600" size="1.5em" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Upload Complete</h4>
              <p className="text-xs text-gray-500">
                {uploadResult.schemaValidationMessage || 'File processed successfully.'}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              Icon={MdListAlt}
              label="Total"
              value={uploadResult.totalRecords}
              color={{ bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }}
            />
            <StatCard
              Icon={MdAddCircleOutline}
              label="New / Saved"
              value={uploadResult.savedRecords}
              color={{ bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }}
            />
            <StatCard
              Icon={MdSync}
              label="Merged"
              value={uploadResult.mergedRecords}
              color={{ bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }}
            />
            <StatCard
              Icon={MdBlock}
              label="Rejected"
              value={uploadResult.rejectedRecords}
              color={{ bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' }}
            />
          </div>

          {/* Inline errors from the result (rows that failed) */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MdWarning className="text-amber-600" size="1.1em" />
                <h5 className="text-sm font-semibold text-amber-800">
                  {uploadResult.errors.length} row{uploadResult.errors.length > 1 ? 's' : ''} had issues
                </h5>
              </div>
              <ul className="list-disc list-inside text-sm text-amber-900 space-y-0.5 max-h-48 overflow-y-auto">
                {uploadResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Trainees List Component
const TraineesList = ({ candidates, loading, onViewTalentCard, onDeleteCandidate, pagination, currentPage, onPageChange }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (loading) {
    return <div className="text-center py-8">Loading trainees...</div>;
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteCandidate(deleteTarget.associateId);
    setDeleteTarget(null);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!pagination.isLast) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageNumberClick = (pageNum) => {
    onPageChange(pageNum);
  };

  return (
    <div className="max-w-6xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">All Trainees</h3>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Track
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate.cognizantCandidateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {candidate.cognizantCandidateId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.candidateName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.cognizantEmailID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.trackName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewTalentCard(candidate.associateId)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100"
                      >
                        View Talent Card
                      </button>
                      <button
                        onClick={() => setDeleteTarget(candidate)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 flex items-center gap-1"
                        title="Delete talent card"
                      >
                        <MdDelete size="1.1em" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {candidates.length > 0 ? currentPage * pagination.pageSize + 1 : 0} to{' '}
          {Math.min((currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
          {pagination.totalElements} trainees (Page {currentPage + 1} of {pagination.totalPages})
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageNumberClick(pageNum)}
              className={`px-3 py-2 rounded-md ${
                currentPage === pageNum
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {pageNum + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={pagination.isLast}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-2 shrink-0">
                <MdWarning className="text-red-600" size="1.6em" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">Delete Talent Card?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This will permanently delete <span className="font-medium">{deleteTarget.candidateName}</span>{' '}
                  (ID {deleteTarget.cognizantCandidateId}) and all associated skills, projects, certifications,
                  achievements, and scores. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1.5"
              >
                <MdDelete size="1.1em" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Register Leader Component — Admin creates a new Leader account with email + password
const RegisterLeader = () => {
  const dispatch = useDispatch();
  const { leaderRegistrationLoading, leaderRegistrationError, leaderRegistrationResult } = useSelector(
    (state) => state.admin
  );

  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearLeaderRegistration());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
    if (leaderRegistrationError || leaderRegistrationResult) {
      dispatch(clearLeaderRegistration());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const { email, password, confirmPassword } = formData;

    if (!email || !password) {
      setValidationError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const result = await dispatch(registerLeader({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      setFormData({ email: '', password: '', confirmPassword: '' });
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <FcBusinessman size="1.2em" /> Register Leader
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Create a new Leader account. Leaders can search and filter candidates from the Leader Panel.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdEmail className="text-indigo-500" size="1.1em" /> Leader Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="leader@cognizant.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdLock className="text-indigo-500" size="1.1em" /> Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <MdVisibilityOff size="1.3em" /> : <MdVisibility size="1.3em" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MdLock className="text-indigo-500" size="1.1em" /> Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <MdVisibilityOff size="1.3em" /> : <MdVisibility size="1.3em" />}
              </button>
            </div>
          </div>

          {/* Validation / API error */}
          {(validationError || leaderRegistrationError) && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <MdError className="text-red-500 mt-0.5 shrink-0" size="1.2em" />
              <p className="text-sm text-red-700">
                {validationError || leaderRegistrationError}
              </p>
            </div>
          )}

          {/* Success */}
          {leaderRegistrationResult && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <MdCheckCircle className="text-green-600 mt-0.5 shrink-0" size="1.2em" />
              <div className="text-sm text-green-700">
                <p className="font-semibold">Leader registered successfully.</p>
                <p className="text-xs mt-0.5">
                  Email: <span className="font-medium">{leaderRegistrationResult.email}</span> · Role:{' '}
                  <span className="font-medium">{leaderRegistrationResult.role}</span>
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={leaderRegistrationLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {leaderRegistrationLoading ? 'Creating leader…' : 'Create Leader Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Ingestion Logs Component (placeholder)
const IngestionLogs = () => {
  return (
    <div className="max-w-4xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Ingestion Logs</h3>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600">Ingestion logs feature coming soon...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;