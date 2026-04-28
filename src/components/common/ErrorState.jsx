

const ErrorState = ({ title, message, actionText, onAction }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
      <h3 className="text-red-800 font-semibold mb-2">{title}</h3>
      <p className="text-red-700">{message}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          {actionText}
        </button>
      )}
    </div>
  </div>
);

export default ErrorState;