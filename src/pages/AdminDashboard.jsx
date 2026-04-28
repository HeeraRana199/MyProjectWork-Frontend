import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { getAllCandidates, uploadExcel } from '../store/slices/adminSlice';
import { FcComboChart, FcConferenceCall, FcDocument, FcUpload } from 'react-icons/fc';

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

  const menuItems = [
    { id: 'upload', label: 'Upload Excel' },
    { id: 'trainees', label: 'All Trainees' },
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
                {item.label === 'Ingestion Logs' && <FcComboChart size="1.5em" />}
              <p className='ml-3'>{item.label}</p>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
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
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {activeTab === 'logs' && <IngestionLogs />}
      </div>
    </div>
  );
};

// Excel Upload Component
const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const result = await dispatch(uploadExcel(file));
    if (result.meta.requestStatus === 'fulfilled') {
      setUploadResult(result.payload);
      setErrorResult(null);
    }
    if (result.meta.requestStatus === 'rejected') {
      const payload = result.payload;
      if (payload && typeof payload === 'object') {
        const message = payload.message || 'Failed to upload Excel file. Please try again.';
        const errors = payload.errors?.join(' | ');
      } 
      setUploadResult(null);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Excel File</h3>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="text-red-800 font-semibold">Upload Failed</h4>
            <p className="text-red-700 mt-1">
              {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
            </p>
            {error.errors && error.errors.length > 0 && (
              <ul className="list-disc list-inside text-red-700 mt-2">
                {error.errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {uploadResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-green-800 font-semibold">Upload Successful</h4>
            <div className="mt-2 text-sm text-green-700">
              <p>Total Records: {uploadResult.totalRecords}</p>
              <p>Saved: {uploadResult.savedRecords}</p>
              <p>Updated: {uploadResult.mergedRecords}</p>
              <p>Rejected: {uploadResult.rejectedRecords}</p>
            </div>
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold text-red-800">Errors:</h5>
                <ul className="list-disc list-inside text-red-700 mt-1">
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        

      </div>
    </div>
  );
};

// Trainees List Component
const TraineesList = ({ candidates, loading, onViewTalentCard, pagination, currentPage, onPageChange }) => {
  if (loading) {
    return <div className="text-center py-8">Loading trainees...</div>;
  }

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
                    <button
                      onClick={() => onViewTalentCard(candidate.cognizantCandidateId)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md hover:bg-indigo-100"
                    >
                      View Talent Card
                    </button>
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