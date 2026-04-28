


// Overview Section
const OverviewSection = ({ candidate }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-gray-500">Associate ID</dt>
            <dd className="text-sm text-gray-900">{candidate.associateId || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-sm text-gray-900">{candidate.cognizantEmailID}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Track</dt>
            <dd className="text-sm text-gray-900">{candidate.trackName || 'N/A'}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Location & Cohort</h4>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-gray-500">Deployment Location</dt>
            <dd className="text-sm text-gray-900">{candidate.deploymentLocation || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Cohort Code</dt>
            <dd className="text-sm text-gray-900">{candidate.cohortCode || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Gender</dt>
            <dd className="text-sm text-gray-900">{candidate.gender || 'N/A'}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
);

export default OverviewSection;