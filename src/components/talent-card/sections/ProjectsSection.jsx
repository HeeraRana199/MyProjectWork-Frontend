import { useState } from "react";
import {
  FcOpenedFolder,
  FcViewDetails
} from "react-icons/fc";
import {
  IoArrowForward,
  IoArrowBack
} from "react-icons/io5";

const ProjectsSection = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevProject = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const nextProject = () => {
    if (currentIndex < projects.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const p = projects[currentIndex];

  return (
    <div className="bg-white rounded-xl shadow p-6 pb-2 min-h-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FcOpenedFolder size="2em" />
          Projects
        </h3>

        <span className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
          View All Projects
          <IoArrowForward size="1.25em" />
        </span>
      </div>

      <div className="border-t border-gray-300 mb-6" />

      {/* Carousel */}
      {/* card at top and navigation at bottom */}
      <div className="relative flex flex-col h-full">
        {/* Card */}
        <div className="flex border border-gray-200 p-5 rounded-xl gap-4 bg-gradient-to-r from-gray-50 to-white transition-all duration-300">
          <div className="rounded-xl flex items-center justify-center bg-blue-50 p-3">
            <FcViewDetails size="3em" />
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-lg">
              {/* conditional */}
              {p?.projectName || "Project Title Not Available"}
            </h4>

            {/* Outcome */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm font-medium">Outcome:</span>
              <span className="text-sm text-gray-600">
                {(p?.outcome) ? 
                  p.outcome.length>100 ? p.outcome.slice(0, 100)+" ..." : p.outcome 
                : "Outcome Not Available"}
              </span>
            </div>

            {/* Technology */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm font-medium">Technology:</span>
              {p?.tech?.split(",")?.map((t, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {t.trim()}
                </span>
              ))}
            </div>

            {/* Role */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-sm font-medium">Role:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                {p?.role || "Role Not Available"  }
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows - position sticky at bottom */}
        <div className="absolute bottom-21 left-0 right-0 flex items-center justify-between mt-2 pt-0">
          <button
            onClick={prevProject}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full border transition
              ${currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
          >
            <IoArrowBack size="1.5em" />
          </button>

          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {projects.length}
          </span>

          <button
            onClick={nextProject}
            disabled={currentIndex === projects.length - 1}
            className={`p-2 rounded-full border transition
              ${currentIndex === projects.length - 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
          >
            <IoArrowForward size="1.5em" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;
