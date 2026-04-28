import { IoArrowForward } from "react-icons/io5";
import { GiTrophyCup } from "react-icons/gi";

const AchievementsSection = ({ title, items }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <GiTrophyCup size="1.8em" className="text-yellow-500" />
          {title}
        </h3>

        <span className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
          View All Achievements
          <IoArrowForward size="1.25em" />
        </span>
      </div>

      <div className="border-t border-gray-300 mb-4" />

      {/* Achievements List */}
      <ul className="space-y-4">
        {items.map((item) => {
          const isAchievement = item.type === "ACHIEVEMENT";

          return (
            <li
              key={item.aid}
              className="flex items-start justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              {/* Left */}
              <div className="flex gap-4">
                <div className="bg-yellow-50 p-3 rounded-xl flex items-center justify-center">
                  <GiTrophyCup size="1.6em" className="text-yellow-500"/>
                </div>

                <div>
                  <h4 className="font-semibold text-base">
                    {item.title}
                  </h4>

                  <p className="text-sm text-gray-600 mt-1 max-w-xl">
                    {item.description.length > 90
                      ? `${item.description.slice(0, 90)} ....`
                      : item.description}
                  </p>
                </div>
              </div>

              {/* Right Badge */}
              <span
                className={`h-fit whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold
                  ${ isAchievement ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
              >
                {item.type}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AchievementsSection;