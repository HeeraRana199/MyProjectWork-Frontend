import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import {
  filterCandidates,
  exportFilteredCandidates,
  addSkillChip,
  removeSkillChip,
  setFilterField,
  clearFilters,
} from '../store/slices/leaderSlice';
import { FcConferenceCall, FcFilledFilter } from 'react-icons/fc';
import ChangePasswordButton from '../components/ChangePasswordButton';
import { FaCode, FaTools, FaLayerGroup, FaCertificate, FaUsers, FaIdBadge } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdClose, MdSearch, MdRestartAlt, MdFileDownload } from 'react-icons/md';

const SKILL_TYPES = [
  { key: 'programmingSkills', label: 'Programming', Icon: FaCode, color: 'bg-blue-100 text-blue-700 border-blue-300', dot: 'bg-blue-500' },
  { key: 'toolSkills', label: 'Tools', Icon: FaTools, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
  { key: 'frameworkSkills', label: 'Framework', Icon: FaLayerGroup, color: 'bg-purple-100 text-purple-700 border-purple-300', dot: 'bg-purple-500' },
];

const LeaderDashboard = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [currentPage, setCurrentPage] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { candidates, filters, loading, exporting, pagination } = useSelector((state) => state.leader);
  const { role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (role !== 'ROLE_LEADER' && role !== 'ROLE_ADMIN') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (activeTab === 'search') {
      dispatch(filterCandidates({ filters, page: currentPage }));
    }
  }, [activeTab, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = () => {
    setCurrentPage(0);
    dispatch(filterCandidates({ filters, page: 0 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setCurrentPage(0);
    dispatch(filterCandidates({ filters: {}, page: 0 }));
  };

  const handleExportCSV = () => {
    dispatch(exportFilteredCandidates({ filters }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Leader Panel</h2>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
              activeTab === 'search' ? 'bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700' : 'text-gray-600'
            }`}
          >
            <FcFilledFilter size="1.5em" />
            <p className="ml-3">Search Candidates</p>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 ${
              activeTab === 'all' ? 'bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700' : 'text-gray-600'
            }`}
          >
            <FcConferenceCall size="1.5em" />
            <p className="ml-3">All Candidates</p>
          </button>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 space-y-2 bg-white border-t border-gray-100">
          <ChangePasswordButton panelLabel="Leader Panel" />
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FcFilledFilter size="1.2em" /> Candidate Search & Filter
          </h3>
          <button
            onClick={handleExportCSV}
            disabled={exporting || candidates.length === 0}
            title={candidates.length === 0 ? 'No candidates to export' : 'Download CSV of all matching candidates'}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <MdFileDownload size="1.2em" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>

        <FilterPanel
          filters={filters}
          onAddSkill={(type, value) => dispatch(addSkillChip({ type, value }))}
          onRemoveSkill={(type, value) => dispatch(removeSkillChip({ type, value }))}
          onSetField={(field, value) => dispatch(setFilterField({ field, value }))}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          loading={loading}
        />

        <CandidatesTable
          candidates={candidates}
          loading={loading}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onView={(id) => navigate(`/leader/talent-card/${id}`)}
        />
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Filter Panel
// ──────────────────────────────────────────────────────────────
const FilterPanel = ({ filters, onAddSkill, onRemoveSkill, onSetField, onApply, onClear, loading }) => {
  const [skillType, setSkillType] = useState('programmingSkills');
  const [skillInput, setSkillInput] = useState('');
  const [associateIdInput, setAssociateIdInput] = useState('');

  const handleAddAssociateId = () => {
    const v = associateIdInput.trim();
    if (!v) return;
    onAddSkill('associateId', v);
    setAssociateIdInput('');
  };

  const handleAssociateIdKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAssociateId();
    }
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    onAddSkill(skillType, skillInput.trim());
    setSkillInput('');
  };

  const handleSkillKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const activeFilterCount =
    filters.programmingSkills.length +
    filters.toolSkills.length +
    filters.frameworkSkills.length +
    (filters.certificate ? 1 : 0) +
    (filters.cohortCode ? 1 : 0) +
    (filters.deploymentLocation ? 1 : 0) +
    filters.associateId.length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
          <MdSearch className="text-indigo-500" size="1.4em" /> Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </h4>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
        >
          <MdRestartAlt size="1.1em" /> Reset all
        </button>
      </div>

      {/* Primary filter — quick lookup by Associate ID(s) */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
          <FaIdBadge className="text-indigo-600" size="1.05em" /> Associate ID
          <span className="text-xs font-normal text-gray-400 ml-1">
            (add one or more — press Enter to add, finds any of them)
          </span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size="1.1em" />
            <input
              type="text"
              inputMode="numeric"
              value={associateIdInput}
              onChange={(e) => setAssociateIdInput(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={handleAssociateIdKey}
              placeholder="Enter Associate ID and press Enter (e.g. 200023)"
              className="w-full border-2 border-indigo-200 rounded-lg pl-10 pr-3 py-3 text-base bg-indigo-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={handleAddAssociateId}
            className="bg-indigo-600 text-white px-5 rounded-lg font-medium hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Chips */}
        {filters.associateId.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.associateId.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-full px-3 py-1"
              >
                <FaIdBadge className="text-indigo-500" size="0.9em" />
                {id}
                <button
                  type="button"
                  onClick={() => onRemoveSkill('associateId', id)}
                  className="hover:text-red-600"
                  aria-label={`Remove ${id}`}
                >
                  <MdClose size="1em" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 -mx-6 mb-5"></div>

      {/* Skills filter */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <FaCode className="text-indigo-500" /> Skills
          <span className="text-xs font-normal text-gray-400 ml-1">
            (add multiple — candidate must have all)
          </span>
        </label>

        <div className="flex gap-2">
          <select
            value={skillType}
            onChange={(e) => setSkillType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {SKILL_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKey}
            placeholder="e.g. Java, Docker, React — press Enter to add"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Chips grouped by type */}
        <div className="mt-3 space-y-2">
          {SKILL_TYPES.map((t) => {
            const items = filters[t.key];
            if (!items || items.length === 0) return null;
            const Icon = t.Icon;
            return (
              <div key={t.key} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1 min-w-[90px]">
                  <Icon size="0.9em" /> {t.label}:
                </span>
                {items.map((s) => (
                  <span
                    key={s}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 ${t.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                    {s}
                    <button
                      type="button"
                      onClick={() => onRemoveSkill(t.key, s)}
                      className="hover:text-red-600"
                      aria-label={`Remove ${s}`}
                    >
                      <MdClose size="1em" />
                    </button>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Other filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterField
          icon={<FaCertificate className="text-amber-500" />}
          label="Certificate"
          placeholder="Name or provider"
          value={filters.certificate}
          onChange={(v) => onSetField('certificate', v)}
        />
        <FilterField
          icon={<FaUsers className="text-blue-500" />}
          label="Cohort Code"
          placeholder="e.g. GENC-2024-12"
          value={filters.cohortCode}
          onChange={(v) => onSetField('cohortCode', v)}
        />
        <FilterField
          icon={<FaLocationDot className="text-rose-500" />}
          label="Deployment Location"
          placeholder="e.g. Bangalore"
          value={filters.deploymentLocation}
          onChange={(v) => onSetField('deploymentLocation', v)}
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={onApply}
          disabled={loading}
          className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          <MdSearch size="1.1em" />
          {loading ? 'Searching…' : 'Apply Filters'}
        </button>
      </div>
    </div>
  );
};

const FilterField = ({ icon, label, placeholder, value, onChange, inputMode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
      {icon} {label}
    </label>
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  </div>
);

// ──────────────────────────────────────────────────────────────
// Candidates Table
// ──────────────────────────────────────────────────────────────
const CandidatesTable = ({ candidates, loading, pagination, currentPage, onPageChange, onView }) => {
  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading candidates…</div>;
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
        No candidates match the current filters.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cohort</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((c) => (
                <tr key={c.associateId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.associateId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.candidateName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.cognizantEmailID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.trackName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.cohortCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.deploymentLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onView(c.associateId)}
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

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {candidates.length > 0 ? currentPage * pagination.pageSize + 1 : 0} to{' '}
          {Math.min((currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
          {pagination.totalElements} candidates (Page {currentPage + 1} of {Math.max(pagination.totalPages, 1)})
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
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
            onClick={() => onPageChange(currentPage + 1)}
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

export default LeaderDashboard;
