import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { FaCalendarCheck, FaLanguage } from 'react-icons/fa';
import { MdCheckCircle, MdWarning, MdCancel } from 'react-icons/md';
import { BsStar } from 'react-icons/bs';

const getAttendanceConfig = (score) => {
  if (score >= 90) return { label: 'Excellent', arcColor: '#16a34a', bg: 'bg-green-50', border: 'border-green-200', textColor: 'text-green-700', Icon: MdCheckCircle };
  if (score >= 75) return { label: 'Good', arcColor: '#2563eb', bg: 'bg-blue-50', border: 'border-blue-200', textColor: 'text-blue-700', Icon: BsStar };
  if (score >= 60) return { label: 'Average', arcColor: '#d97706', bg: 'bg-yellow-50', border: 'border-yellow-200', textColor: 'text-yellow-700', Icon: MdWarning };
  return { label: 'Needs Improvement', arcColor: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', textColor: 'text-red-700', Icon: MdCancel };
};

const LANGUAGE_GRADES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F'];

const GRADE_COLORS = {
  A1: '#059669', A2: '#16a34a', B1: '#0d9488', B2: '#0891b2',
  C1: '#0284c7', C2: '#2563eb', D1: '#ca8a04', D2: '#d97706',
  E1: '#ea580c', E2: '#dc2626', F: '#7f1d1d',
};

const GRADE_DESC = {
  A1: 'Expert Proficiency', A2: 'Advanced+', B1: 'Advanced',
  B2: 'Upper Intermediate', C1: 'Intermediate+', C2: 'Intermediate',
  D1: 'Pre-Intermediate', D2: 'Elementary+', E1: 'Elementary',
  E2: 'Beginner+', F: 'Fail',
};

const AttendanceScore = ({ attendanceScore, languageScore }) => {
  const score = attendanceScore ?? 0;
  const config = getAttendanceConfig(score);
  const StatusIcon = config.Icon;
  const gradeColor = GRADE_COLORS[languageScore] || '#9ca3af';
  const gradeDesc = GRADE_DESC[languageScore] || 'Not Assessed';

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold flex items-center gap-2 text-gray-700">
        <FaCalendarCheck className="text-indigo-500" size="1.15em" />
        Attendance Score
      </h2>

      {/* Gauge Card */}
      <div className={`border ${config.border} ${config.bg} rounded-xl px-3 pt-3 pb-2 flex flex-col items-center`}>
        <div className="w-full" style={{ height: '152px' }}>
          <Gauge
            value={score}
            startAngle={-110}
            endAngle={110}
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 32,
                fontWeight: 700,
                fill: config.arcColor,
              },
              [`& .${gaugeClasses.valueArc}`]: {
                fill: config.arcColor,
              },
            }}
            text={({ value }) => `${value}%`}
          />
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.textColor} ${config.bg} ${config.border}`}>
          <StatusIcon size="1em" />
          {config.label}
        </div>

        <p className="text-xs text-gray-400 mt-1.5">{score} / 100 attendance points</p>
      </div>

      {/* Language Score Card */}
      <div className="border border-purple-200 bg-purple-50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <FaLanguage className="text-purple-500" size="1.15em" />
            Language Score
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: gradeColor }}
          >
            {languageScore || 'N/A'}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-2">{gradeDesc}</p>

        {/* Grade scale bar */}
        <div className="flex gap-0.5">
          {LANGUAGE_GRADES.map((g) => (
            <div
              key={g}
              title={`${g} — ${GRADE_DESC[g]}`}
              className={`flex-1 rounded-sm transition-all ${g === languageScore ? 'h-3' : 'h-2 opacity-35'}`}
              style={{
                backgroundColor: GRADE_COLORS[g],
                outline: g === languageScore ? `2px solid ${GRADE_COLORS[g]}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>A1 — Best</span>
          <span>F — Fail</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScore;
