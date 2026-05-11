const ScoreBadge = ({ label, value }) => {
  const colorMap = {
    RED: "bg-red-100 text-red-700",
    AMBER: "bg-yellow-100 text-yellow-800",
    GREEN: "bg-green-100 text-green-700",
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">{label}</h2>

      <div className="flex items-center justify-center border rounded-lg h-48">
        <span className={`px-6 py-2 rounded-full text-lg font-semibold ${colorMap[value] || "bg-gray-100 text-gray-500"}`}>
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
};

export default ScoreBadge;