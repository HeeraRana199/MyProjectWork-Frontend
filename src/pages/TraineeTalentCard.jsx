import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateById } from '../store/slices/candidateSlice';
import AchievementsSection from '../components/talent-card/sections/AchievementsSection';
import CertificationsSection from '../components/talent-card/sections/CertificationsSection';
import ProjectsSection from '../components/talent-card/sections/ProjectsSection';
import SkillsSection from '../components/talent-card/sections/SkillsSection';
import StatCard from '../components/talent-card/performance_stats/StatCard';

import { FcDoughnutChart, FcPrint } from 'react-icons/fc';
import { MdAccessTime, MdAssessment, MdCircle, MdDoneAll, MdEmail, MdFeedback, MdOutlineFileDownload } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { ImUser, ImUsers } from "react-icons/im";
import CategoryScore from '../components/talent-card/performance_stats/CategoryScore';
import ScoreTrend from '../components/talent-card/performance_stats/ScoreTrend';
import { FaCalendarAlt, FaCode, FaPlus } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import AttendanceScore from '../components/talent-card/performance_stats/AttendanceScore';


const getRAGConfig = (status) => {
  switch (status) {
    case 'GREEN':
      return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500', label: 'On Track' };
    case 'AMBER':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Needs Attention' };
    case 'RED':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'At Risk' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Not Assessed' };
  }
};

// When candidateIdOverride is provided the component is embedded in the Trainee Dashboard.
// When used standalone via route, it falls back to useParams.
const TraineeTalentCard = ({ candidateIdOverride }) => {
  const { candidateId: paramCandidateId } = useParams();
  const candidateId = candidateIdOverride || paramCandidateId;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const pdfRef = useRef(null);

  const { currentCandidate, loading, error } = useSelector((state) => state.candidate);

  useEffect(() => {
    if (candidateId) {
      dispatch(getCandidateById(parseInt(candidateId)));
    }
  }, [candidateId, dispatch]);

  const handleDownloadPDF = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: currentCandidate ? `${candidateId}_Talent_Card` : 'Talent_Card',
    removeAfterPrint: true,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch(
      `http://localhost:8085/trainee/profile-photo/${candidateId}`,
      {
        method: "POST",
        body: formData,
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  if (error || !currentCandidate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-red-600 mb-4">{error || 'No data found'}</p>
          {!candidateIdOverride && (
            <button
              onClick={() => navigate('/trainee/dashboard')}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  const {
    candidateName,
    cognizantEmailID,
    trackName,
    gender,
    deploymentLocation,
    cohortCode,
    doj,
    certificates = [],
    achievement = [],
    projects = [],
    skills = {},
    candidateScore = {},
  } = currentCandidate;

  return (
    <div ref={pdfRef} className="print-container min-h-screen bg-blue-50 px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src="/icons/medal.png" className='pt-2' alt="medal" width={39} />
            Trainee Talent Card
          </h1>
          <p className="text-sm text-gray-500 ml-10 pl-2">
            Comprehensive overview of trainee profile and performance
          </p>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="no-print font-medium flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 cursor-pointer rounded shadow-sm text-sm"
        >
          <MdOutlineFileDownload color='blue' size="2em" /> Download PDF
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6 flex gap-6 mb-8">
        <div className="relative">
          <img
            src={`http://localhost:8085/trainee/profile-photo/${candidateId}`}
            alt="profile"
            className="w-32 h-39 rounded-xl object-cover"
            onError={(e) => {
              e.currentTarget.src = "/profile_photos/profile1.avif";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700"
          >
            <FaPlus size={12} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            {candidateName}
            <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
              Active
            </span>
          </h2>
          <p className="text-gray-600 mt-2">{trackName}</p>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-6 text-sm border-t border-gray-500 pt-4">
            <p className="flex items-center gap-1"><MdEmail size="1.25em" color='blue' /> {cognizantEmailID}</p>
            <p className="flex items-center gap-1"><FaLocationDot size="1.25em" color='blue' /> Location: {deploymentLocation}</p>
            <p className="flex items-center gap-1"><ImUser size="1.25em" color='blue' /> Gender: {gender}</p>
            <p className="flex items-center gap-1"><ImUsers size="1.25em" color='blue' /> Cohort: {cohortCode}</p>
            <p className="flex items-center gap-1"><FaCode size="1.25em" color='blue' /> Track: {trackName}</p>
            <p className="flex items-center gap-1"><FaCalendarAlt size="1.25em" color='blue' /> Training Since: {currentCandidate.doj || 'Not specified'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-80">
          <StatCard label="Overall Score" value={`${candidateScore.overallScore || 0}%`} />
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Certifications" value={certificates.length} />
          <StatCard label="Achievements" value={achievement.length} />
        </div>
      </div>

      {/* Skills & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SkillsSection skills={skills || []} />
        <ProjectsSection projects={projects} />
      </div>

      {/* Certifications & Achievements */}
      <div className="page-break grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CertificationsSection title="Certifications" items={certificates} icon="✅" />
        <AchievementsSection title="Achievements" items={achievement} icon="🏆" />
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="flex items-center gap-2 font-semibold mb-4">
          <FcDoughnutChart size="2em" />
          Performance Overview
        </h3>

        <div className="border-t border-gray-300 mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1️⃣ Attendance Score + Language Score */}
          <AttendanceScore
            attendanceScore={candidateScore.attendanceScore}
            languageScore={candidateScore.languageScore}
          />

          {/* 2️⃣ RAG Score */}
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold flex items-center gap-2 text-gray-700">
              <MdAssessment className="text-rose-500" size="1.3em" />
              RAG Score
            </h2>

            {/* Interim RAG */}
            {(() => {
              const cfg = getRAGConfig(candidateScore.interimScore);
              return (
                <div className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1 flex items-center gap-1">
                      <MdAccessTime size="1em" /> Interim Assessment
                    </p>
                    <span className={`flex items-center gap-2 font-bold text-base ${cfg.text}`}>
                      <MdCircle size="0.8em" />
                      {candidateScore.interimScore || 'N/A'}
                    </span>
                    <p className={`text-xs mt-0.5 ${cfg.text} opacity-75`}>{cfg.label}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${cfg.dot}`}>
                    {candidateScore.interimScore?.[0] || '?'}
                  </div>
                </div>
              );
            })()}

            {/* Final RAG */}
            {(() => {
              const cfg = getRAGConfig(candidateScore.finalScore);
              return (
                <div className={`border ${cfg.border} ${cfg.bg} rounded-xl p-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1 flex items-center gap-1">
                      <MdDoneAll size="1em" /> Final Assessment
                    </p>
                    <span className={`flex items-center gap-2 font-bold text-base ${cfg.text}`}>
                      <MdCircle size="0.8em" />
                      {candidateScore.finalScore || 'N/A'}
                    </span>
                    <p className={`text-xs mt-0.5 ${cfg.text} opacity-75`}>{cfg.label}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${cfg.dot}`}>
                    {candidateScore.finalScore?.[0] || '?'}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 3️⃣ Evaluation Feedback */}
          <div className="flex flex-col gap-3">
            <h2 className="font-semibold flex items-center gap-2 text-gray-700">
              <MdFeedback className="text-blue-500" size="1.3em" />
              Evaluation Feedback
            </h2>

            {/* Interim Feedback */}
            <div className="border border-sky-200 bg-sky-50 rounded-xl p-4 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <MdAccessTime className="text-sky-500" size="1.1em" />
                <span className="text-xs font-semibold uppercase tracking-wide text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                  Interim
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {candidateScore.interimEvaluationFeedback || 'No interim feedback available.'}
              </p>
            </div>

            {/* Final Feedback */}
            <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4 flex-1">
              <div className="flex items-center gap-1.5 mb-2">
                <MdDoneAll className="text-indigo-500" size="1.1em" />
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Final
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                {candidateScore.finalEvaluationFeedback || 'No final evaluation feedback available.'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Quote */}
      <div className="bg-white rounded-xl shadow p-6 text-gray-600 italic">
        "Passionate learner with strong problem-solving skills and a drive to build impactful solutions."
      </div>
    </div>
  );
};

export default TraineeTalentCard;
