import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getCandidateByIdAdmin } from '../store/slices/adminSlice';
import AchievementsSection from '../components/talent-card/sections/AchievementsSection';
import CertificationsSection from '../components/talent-card/sections/CertificationsSection';
import ProjectsSection from '../components/talent-card/sections/ProjectsSection';
import SkillsSection from '../components/talent-card/sections/SkillsSection';
import StatCard from '../components/talent-card/performance_stats/StatCard';

import { FcDoughnutChart, FcPrint } from 'react-icons/fc';
import { MdEmail, MdOutlineFileDownload } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { ImUser, ImUsers } from "react-icons/im";
import CategoryScore from '../components/talent-card/performance_stats/CategoryScore';
import ScoreTrend from '../components/talent-card/performance_stats/ScoreTrend';
import { FaCalendarAlt, FaCode, FaPlus } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import AttendanceScore from '../components/talent-card/performance_stats/AttendanceScore';

const TraineeTalentCard = () => {
  const { candidateId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Profile Image State
  const fileInputRef = useRef(null);
  
  //PDF Download functionality - Hooks should be at the top level of the component, so we will move the useReactToPrint hook here and pass the ref to the div that we want to convert to PDF
  const pdfRef = useRef(null);
  
  const { currentCandidate, loading, error } = useSelector((state) => state.admin);
  
    useEffect(() => {
      if (candidateId) {
          dispatch(getCandidateByIdAdmin(parseInt(candidateId)));
        }
    }, [candidateId, dispatch]);

    //Talent Card download PDF logic - using useReactToPrint hook to generate PDF from the div with ref pdfRef
    const handleDownloadPDF = useReactToPrint({
          contentRef: pdfRef,
          documentTitle: currentCandidate ? `${candidateId}_Talent_Card` : 'Talent_Card',
          removeAfterPrint: true,
      }); 

    
    // Profile upload logic
    // ================================================
      const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      await fetch(
        `http://localhost:8085/admin/profile-photo/${candidateId}`,
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
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    candidateName,
    candidateImageUrl,
    cognizantEmailID,
    trackName,
    gender,
    deploymentLocation,
    cohortCode,
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
            {/* <FcDiploma2 size="2em" />  */}
            <img src="/icons/medal.png" className='pt-2' alt="medal" width={39} />
            Trainee Talent Card</h1>
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
            src={`http://localhost:8085/admin/profile-photo/${candidateId}`}
            alt="profile"
            className="w-32 h-39 rounded-xl object-cover"
            onError={(e) => {
              e.currentTarget.src = "/profile_photos/profile1.avif";
            }}
          />

          {/* Plus Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700"
          >
            <FaPlus size={12} />
          </button>

          {/* Hidden Input */}
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
            <p className="flex items-center gap-1"><MdEmail size="1.25em" color='blue'/> {cognizantEmailID}</p>
            <p className="flex items-center gap-1"><FaLocationDot size="1.25em" color='blue' /> Location: {deploymentLocation}</p>
            <p className="flex items-center gap-1"><ImUser size="1.25em" color='blue' /> Gender: {gender}</p>
            <p className="flex items-center gap-1"><ImUsers size="1.25em" color='blue' /> Cohort: {cohortCode}</p>
            <p className="flex items-center gap-1"><FaCode size="1.25em" color='blue' /> Track: {trackName}</p>
            <p className="flex items-center gap-1"><FaCalendarAlt size="1.25em" color='blue' /> Training Since: {currentCandidate.trainingSince || ' Not specified'}</p>
          </div>
        </div>

        {/*Key Performance Indicators */}
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
        {/* conditional rendering */}
        <ProjectsSection projects={projects} />
      </div>

      {/* Certifications & Achievements */}
      <div className="page-break grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <CertificationsSection title="Certifications" items={certificates} icon="✅" />
        <AchievementsSection title="Achievements" items={achievement} icon="🏆" />
      </div>

      {/* Performance Overview (UI Placeholder) */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h3 className="flex items-center gap-2 font-semibold mb-4"><FcDoughnutChart size="2em" />Performance Overview</h3>

        <div className="border-t border-gray-300 mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AttendanceScore title="Overall Score" attendanceScore={candidateScore.attendanceScore} />
          <CategoryScore title="Performance by Category" />
          <ScoreTrend title="Score Trend"  languageScore={candidateScore.languageScore} />
        </div>
      </div>

      {/* Quote */}
      <div className="bg-white rounded-xl shadow p-6 text-gray-600 italic">
        “Passionate learner with strong problem-solving skills and a drive to build impactful solutions.”
      </div>
    </div>
  );
};


export default TraineeTalentCard;
