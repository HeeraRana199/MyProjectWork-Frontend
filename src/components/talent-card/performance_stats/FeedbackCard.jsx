const FeedbackCard = ({ label, feedback }) => (
  <div className="flex flex-col gap-3">
    <h2 className="font-semibold">{label}</h2>

    <div className="border rounded-lg h-48 p-4 text-sm text-gray-600 overflow-y-auto">
      {feedback || "No feedback provided."}
    </div>
  </div>
);

export default FeedbackCard;