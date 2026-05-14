import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import {
  getAssociateById,
  addProject, updateProject, deleteProject,
  updateSkills,
  addCertification, updateCertification, deleteCertification,
  addAchievement, updateAchievement, deleteAchievement,
  clearError,
} from '../store/slices/candidateSlice';
import TraineeTalentCard from './TraineeTalentCard';
import ChangePasswordButton from '../components/ChangePasswordButton';
import {
  FcPortraitMode, FcBriefcase, FcIdea, FcGraduationCap, FcRating,
} from 'react-icons/fc';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
const TraineeDashboard = () => {
  const [activeSection, setActiveSection] = useState('myTalentCard');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role, associateId } = useSelector((state) => state.auth);
  const { currentCandidate, loading } = useSelector((state) => state.candidate);

  useEffect(() => {
    if (role !== 'ROLE_TRAINEE') navigate('/login');
  }, [role, navigate]);

  useEffect(() => {
    if (associateId) dispatch(getAssociateById(parseInt(associateId)));
  }, [associateId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const refreshCandidate = () => {
    if (associateId) dispatch(getAssociateById(parseInt(associateId)));
  };

  const sidebarItems = [
    { id: 'myTalentCard', label: 'My Talent Card', icon: <FcPortraitMode size="1.5em" /> },
    { id: 'projects',     label: 'Projects',        icon: <FcBriefcase size="1.5em" /> },
    { id: 'skills',       label: 'Skills',           icon: <FcIdea size="1.5em" /> },
    { id: 'certificates', label: 'Certificates',     icon: <FcGraduationCap size="1.5em" /> },
    { id: 'achievements', label: 'Achievements',     icon: <FcRating size="1.5em" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Trainee Panel</h2>
          {currentCandidate && (
            <p className="text-sm text-gray-500 mt-1 truncate">{currentCandidate.candidateName}</p>
          )}
        </div>
        <nav className="mt-4 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
                activeSection === item.id
                  ? 'bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700'
                  : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span className="ml-3 font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-100 space-y-2">
          <ChangePasswordButton panelLabel="Trainee Panel" />
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'myTalentCard' && (
          <TraineeTalentCard candidateIdOverride={associateId} />
        )}
        {activeSection === 'projects' && (
          <ProjectsPanel
            candidateId={parseInt(associateId)}
            projects={currentCandidate?.projects || []}
            loading={loading}
            onRefresh={refreshCandidate}
          />
        )}
        {activeSection === 'skills' && (
          <SkillsPanel
            candidateId={parseInt(associateId)}
            skills={currentCandidate?.skills}
            loading={loading}
            onRefresh={refreshCandidate}
          />
        )}
        {activeSection === 'certificates' && (
          <CertificatesPanel
            candidateId={parseInt(associateId)}
            certificates={currentCandidate?.certificates || []}
            loading={loading}
            onRefresh={refreshCandidate}
          />
        )}
        {activeSection === 'achievements' && (
          <AchievementsPanel
            candidateId={parseInt(associateId)}
            achievements={currentCandidate?.achievement || []}
            loading={loading}
            onRefresh={refreshCandidate}
          />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────
const SectionHeader = ({ title, onAdd, addLabel }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    {onAdd && (
      <button
        onClick={onAdd}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        <FaPlus size="0.8em" /> {addLabel || `Add ${title}`}
      </button>
    )}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
    <MdWork size="3em" className="mx-auto mb-3 text-gray-300" />
    <p>{message}</p>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center py-16">
    <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <FaTimes size="1.1em" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const FormField = ({ label, children, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
const textareaCls = `${inputCls} resize-none`;

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex gap-2">
    <button
      onClick={onEdit}
      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
      title="Edit"
    >
      <FaEdit size="0.9em" />
    </button>
    <button
      onClick={onDelete}
      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
      title="Delete"
    >
      <FaTrash size="0.9em" />
    </button>
  </div>
);

const SaveButton = ({ loading, label = 'Save' }) => (
  <button
    type="submit"
    disabled={loading}
    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
  >
    {loading ? 'Saving...' : label}
  </button>
);

const ErrorBanner = ({ message }) =>
  message ? (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
      {typeof message === 'string' ? message : JSON.stringify(message)}
    </div>
  ) : null;

// ─────────────────────────────────────────────
// Projects Panel
// ─────────────────────────────────────────────
const ProjectsPanel = ({ associateId, projects, loading, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const dispatch = useDispatch();
  const { mutating, error } = useSelector((state) => state.candidate);

  const closeModal = () => { setShowModal(false); setEditItem(null); dispatch(clearError()); };

  const handleAdd = async (data) => {
    const res = await dispatch(addProject({ project: data, associateId: parseInt(associateId) }));
    if (res.meta.requestStatus === 'fulfilled') { onRefresh(); closeModal(); }
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateProject({ project: data, projectId: editItem.projectId }));
    if (res.meta.requestStatus === 'fulfilled') { onRefresh(); closeModal(); }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    const res = await dispatch(deleteProject(projectId));
    if (res.meta.requestStatus === 'fulfilled') onRefresh();
  };

  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Projects" onAdd={() => setShowModal(true)} addLabel="Add Project" />
      {loading ? <LoadingSpinner /> : projects.length === 0 ? (
        <EmptyState message='No projects yet. Click "Add Project" to get started.' />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div key={p.projectId} className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 text-base">{p.projectName}</h3>
                <ActionButtons onEdit={() => setEditItem(p)} onDelete={() => handleDelete(p.projectId)} />
              </div>
              <p className="text-sm text-gray-500 italic">{p.role}</p>
              <p className="text-sm text-gray-700">{p.outcome}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {p.tech?.split(',').map((t, i) => (
                  <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showModal || editItem) && (
        <ProjectModal
          project={editItem}
          error={error}
          mutating={mutating}
          onSave={editItem ? handleUpdate : handleAdd}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const ProjectModal = ({ project, error, mutating, onSave, onClose }) => {
  const [form, setForm] = useState({
    projectName: project?.projectName || '',
    role: project?.role || '',
    tech: project?.tech || '',
    outcome: project?.outcome || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title={project ? 'Edit Project' : 'Add Project'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorBanner message={error} />
        <FormField label="Project Name" required>
          <input className={inputCls} value={form.projectName} onChange={set('projectName')} required />
        </FormField>
        <FormField label="Your Role" required>
          <input className={inputCls} value={form.role} onChange={set('role')} required />
        </FormField>
        <FormField label="Technologies (comma-separated)" required>
          <input className={inputCls} placeholder="React, Spring Boot, MySQL" value={form.tech} onChange={set('tech')} required />
        </FormField>
        <FormField label="Outcome / Description" required>
          <textarea className={textareaCls} rows={3} value={form.outcome} onChange={set('outcome')} required />
        </FormField>
        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <SaveButton loading={mutating} label={project ? 'Update' : 'Add Project'} />
        </div>
      </form>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Skills Panel
// ─────────────────────────────────────────────
const SkillsPanel = ({ associateId, skills, loading, onRefresh }) => {
  const [form, setForm] = useState({
    programmings: '',
    frameworks: '',
    tools: '',
  });
  const [saved, setSaved] = useState(false);
  const dispatch = useDispatch();
  const { mutating, error } = useSelector((state) => state.candidate);

  useEffect(() => {
    setForm({
      programmings: skills?.programmings || '',
      frameworks: skills?.frameworks || '',
      tools: skills?.tools || '',
    });
  }, [skills]);

  const set = (field) => (e) => { setSaved(false); setForm((f) => ({ ...f, [field]: e.target.value })); };

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateSkills({ associateId: parseInt(associateId), skills: form }));
    if (res.meta.requestStatus === 'fulfilled') {
      setSaved(true);
      onRefresh();
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <SectionHeader title="Skills" />
      {loading ? <LoadingSpinner /> : (
        <form onSubmit={handleSave}>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-1">
            <ErrorBanner message={error} />
            {saved && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                Skills updated successfully!
              </div>
            )}

            <FormField label="Programming Languages">
              <input
                className={inputCls}
                placeholder="Java, Python, JavaScript, TypeScript"
                value={form.programmings}
                onChange={set('programmings')}
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple entries with commas</p>
            </FormField>

            <FormField label="Frameworks & Libraries">
              <input
                className={inputCls}
                placeholder="React, Spring Boot, Angular, Node.js"
                value={form.frameworks}
                onChange={set('frameworks')}
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple entries with commas</p>
            </FormField>

            <FormField label="Tools & Platforms">
              <input
                className={inputCls}
                placeholder="Git, Docker, Postman, Jira"
                value={form.tools}
                onChange={set('tools')}
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple entries with commas</p>
            </FormField>

            <div className="flex justify-end mt-2">
              <SaveButton loading={mutating} label="Update Skills" />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Certificates Panel
// ─────────────────────────────────────────────
const CertificatesPanel = ({ associateId, certificates, loading, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const dispatch = useDispatch();
  const { mutating, error } = useSelector((state) => state.candidate);

  const closeModal = () => { setShowModal(false); setEditItem(null); dispatch(clearError()); };

  const handleAdd = async (data) => {
    const res = await dispatch(addCertification({ certification: data, associateId: parseInt(associateId) }));
    if (res.meta.requestStatus === 'fulfilled') { onRefresh(); closeModal(); }
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateCertification({ certification: data, certificationId: editItem.certificationId }));
    if (res.meta.requestStatus === 'fulfilled') { onRefresh(); closeModal(); }
  };

  const handleDelete = async (certificationId) => {
    if (!window.confirm('Delete this certification?')) return;
    const res = await dispatch(deleteCertification(certificationId));
    if (res.meta.requestStatus === 'fulfilled') onRefresh();
  };

  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Certificates" onAdd={() => setShowModal(true)} addLabel="Add Certificate" />
      {loading ? <LoadingSpinner /> : certificates.length === 0 ? (
        <EmptyState message='No certificates yet. Click "Add Certificate" to get started.' />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((c) => (
            <div key={c.certificationId} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{c.certificationName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{c.certificationProvider}</p>
                </div>
                <ActionButtons onEdit={() => setEditItem(c)} onDelete={() => handleDelete(c.certificationId)} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-gray-500">ID:</span>
                <span className="text-xs text-gray-700 font-mono">{c.certificationId}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.status ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {c.status ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showModal || editItem) && (
        <CertificateModal
          certificate={editItem}
          error={error}
          mutating={mutating}
          onSave={editItem ? handleUpdate : handleAdd}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const CertificateModal = ({ certificate, error, mutating, onSave, onClose }) => {
  const [form, setForm] = useState({
    certificationId: certificate?.certificationId || '',
    certificationName: certificate?.certificationName || '',
    certificationProvider: certificate?.certificationProvider || '',
    status: certificate?.status ?? false,
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, status: form.status === true || form.status === 'true' });
  };

  return (
    <Modal title={certificate ? 'Edit Certificate' : 'Add Certificate'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorBanner message={error} />
        <FormField label="Certification ID" required>
          <input
            className={inputCls}
            placeholder="e.g. AWS-SAA-001"
            value={form.certificationId}
            onChange={set('certificationId')}
            disabled={!!certificate}
            required
          />
          {!!certificate && <p className="text-xs text-gray-400 mt-1">ID cannot be changed after creation.</p>}
        </FormField>
        <FormField label="Certification Name" required>
          <input className={inputCls} value={form.certificationName} onChange={set('certificationName')} required />
        </FormField>
        <FormField label="Provider / Issuer" required>
          <input className={inputCls} placeholder="e.g. Amazon Web Services" value={form.certificationProvider} onChange={set('certificationProvider')} required />
        </FormField>
        <FormField label="Status">
          <select
            className={inputCls}
            value={form.status.toString()}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value === 'true' }))}
          >
            <option value="false">Verified</option>
            <option value="true">Pending</option>
          </select>
        </FormField>
        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <SaveButton loading={mutating} label={certificate ? 'Update' : 'Add Certificate'} />
        </div>
      </form>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Achievements Panel
// ─────────────────────────────────────────────
const AchievementsPanel = ({ associateId, achievements, loading, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const dispatch = useDispatch();
  const { mutating, error } = useSelector((state) => state.candidate);

  const closeModal = () => { setShowModal(false); setEditItem(null); dispatch(clearError()); };

  const handleAdd = async (data) => {
    const res = await dispatch(addAchievement({ achievement: data, associateId: parseInt(associateId) }));
    if (res.meta.requestStatus === 'fulfilled') { onRefresh(); closeModal(); }
  };

  const handleUpdate = async (data) => {
    const res = await dispatch(updateAchievement({ achievement: data, achievementId: editItem.aId }));
    if (res.meta.requestStatus === 'fulfilled') { onRefresh(); closeModal(); }
  };

  const handleDelete = async (aId) => {
    if (!window.confirm('Delete this achievement?')) return;
    const res = await dispatch(deleteAchievement(aId));
    if (res.meta.requestStatus === 'fulfilled') onRefresh();
  };

  return (
    <div className="p-8 max-w-5xl">
      <SectionHeader title="Achievements" onAdd={() => setShowModal(true)} addLabel="Add Achievement" />
      {loading ? <LoadingSpinner /> : achievements.length === 0 ? (
        <EmptyState message='No achievements yet. Click "Add Achievement" to get started.' />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((a) => (
            <div key={a.aId} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 mr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.type === 'ACHIEVEMENT'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {a.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                </div>
                <ActionButtons onEdit={() => setEditItem(a)} onDelete={() => handleDelete(a.aId)} />
              </div>
              <p className="text-sm text-gray-600 mt-1">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {(showModal || editItem) && (
        <AchievementModal
          achievement={editItem}
          error={error}
          mutating={mutating}
          onSave={editItem ? handleUpdate : handleAdd}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

const AchievementModal = ({ achievement, error, mutating, onSave, onClose }) => {
  const [form, setForm] = useState({
    type: achievement?.type || 'ACHIEVEMENT',
    title: achievement?.title || '',
    description: achievement?.description || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal title={achievement ? 'Edit Achievement' : 'Add Achievement'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorBanner message={error} />
        <FormField label="Type" required>
          <select className={inputCls} value={form.type} onChange={set('type')}>
            <option value="ACHIEVEMENT">Achievement</option>
            <option value="ACTIVITY">Activity</option>
          </select>
        </FormField>
        <FormField label="Title" required>
          <input className={inputCls} value={form.title} onChange={set('title')} required />
        </FormField>
        <FormField label="Description" required>
          <textarea className={textareaCls} rows={4} value={form.description} onChange={set('description')} required />
        </FormField>
        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <SaveButton loading={mutating} label={achievement ? 'Update' : 'Add Achievement'} />
        </div>
      </form>
    </Modal>
  );
};

export default TraineeDashboard;