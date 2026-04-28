

// Scores Section
const ScoresSection = ({ scores }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Scores</h3>
    {scores ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Technical Score</h4>
          <div className="text-2xl font-bold text-blue-600">{scores.technicalScore || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Communication Score</h4>
          <div className="text-2xl font-bold text-green-600">{scores.communicationScore || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2">Overall Score</h4>
          <div className="text-2xl font-bold text-purple-600">{scores.overallScore || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">Attendance Score</h4>
          <div className="text-2xl font-bold text-yellow-600">{scores.attendanceScore || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2">Discipline Score</h4>
          <div className="text-2xl font-bold text-red-600">{scores.disciplineScore || 'N/A'}</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
          <h4 className="font-medium text-indigo-900 mb-2">Learning Score</h4>
          <div className="text-2xl font-bold text-indigo-600">{scores.learningScore || 'N/A'}</div>
        </div>
      </div>
    ) : (
      <p className="text-gray-500">No performance scores available</p>
    )}
  </div>
);

export default ScoresSection;