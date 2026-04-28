import { FcServices } from "react-icons/fc";
import { IoArrowForward } from "react-icons/io5";
import { LiaCodeSolid } from "react-icons/lia";
import { FaTools } from "react-icons/fa";

// ✅ NOTE (IMPORTANT)
// react-icons/si does NOT export `SiVisualstudiocode` in many builds.
// To avoid runtime errors, VS Code will gracefully fallback to FaTools.
// ---------------- Programming Icons ----------------
import {
  SiCplusplus,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiOpenjdk,
} from "react-icons/si";

// ---------------- Framework Icons ----------------
import {
  SiReact,
  SiAngular,
  SiVuedotjs,
  SiSpring,
  SiNodedotjs,
} from "react-icons/si";

// ---------------- Tool Icons ----------------
import {
  SiGit,
  SiDocker,
  SiPostman,
} from "react-icons/si";

/* ---------------- Icon Maps ---------------- */

const programmingIcons = {
  c: <SiCplusplus />,
  "c++": <SiCplusplus />,
  java: <SiOpenjdk />,
  python: <SiPython />,
  javascript: <SiJavascript />,
  typescript: <SiTypescript />,
};

const frameworkIcons = {
  react: <SiReact />,
  angular: <SiAngular />,
  vue: <SiVuedotjs />,
  "vue.js": <SiVuedotjs />,
  spring: <SiSpring />,
  "spring boot": <SiSpring />,
  node: <SiNodedotjs />,
  "node.js": <SiNodedotjs />,
};

const toolIcons = {
  git: <SiGit />,
  docker: <SiDocker />,
  postman: <SiPostman />,
  // vscode intentionally falls back to FaTools (safe)
};

/* ---------------- Skill Chip ---------------- */

const SkillChip = ({ name, iconMap, bgColor, textColor, defaultIcon }) => {
  const key = name.trim().toLowerCase();
  const icon = iconMap[key] || defaultIcon;

  return (
    <span
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
    >
      <span className="text-lg">{icon}</span>
      {name.trim()}
    </span>
  );
};

/* ---------------- Main Component ---------------- */

const SkillsSection = ({ skills }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <FcServices size="2em" />
        Skills
      </h3>

      <span className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
        View All Skills
        <IoArrowForward size="1.25em" />
      </span>
    </div>

    <div className="border-t border-gray-300 mb-4" />

    <div className="space-y-6">
      {/* Programming Languages */}
      <div>
        <h4 className="font-medium mb-2">Programming Languages</h4>
        <div className="flex flex-wrap gap-2">
          {skills?.programmings
            ? skills.programmings.split(",").map((skill, index) => (
                <SkillChip
                  key={index}
                  name={skill}
                  iconMap={programmingIcons}
                  bgColor="bg-pink-100"
                  textColor="text-pink-800"
                  defaultIcon={<LiaCodeSolid />}
                />
              ))
            : <p className="text-gray-500">No programming skills listed</p>}
        </div>
      </div>

      {/* Frameworks */}
      <div>
        <h4 className="font-medium mb-2">Frameworks</h4>
        <div className="flex flex-wrap gap-2">
          {skills?.frameworks
            ? skills.frameworks.split(",").map((skill, index) => (
                <SkillChip
                  key={index}
                  name={skill}
                  iconMap={frameworkIcons}
                  bgColor="bg-yellow-100"
                  textColor="text-yellow-800"
                  defaultIcon={<LiaCodeSolid />}
                />
              ))
            : <p className="text-gray-500">No frameworks listed</p>}
        </div>
      </div>

      {/* Tools */}
      <div>
        <h4 className="font-medium mb-2">Tools</h4>
        <div className="flex flex-wrap gap-2">
          {skills?.tools
            ? skills.tools.split(",").map((skill, index) => (
                <SkillChip
                  key={index}
                  name={skill}
                  iconMap={toolIcons}
                  bgColor="bg-green-100"
                  textColor="text-green-800"
                  defaultIcon={<FaTools />}
                />
              ))
            : <p className="text-gray-500">No tools listed</p>}
        </div>
      </div>
    </div>
  </div>
);

export default SkillsSection;