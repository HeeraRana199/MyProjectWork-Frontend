import { FaGraduationCap } from "react-icons/fa";
import { RiFoldersFill } from "react-icons/ri";
import { PiCertificateBold } from "react-icons/pi";
import { FaTrophy } from "react-icons/fa6";


const StatCard = ({ label, value }) => (
  <div className="border border-green-600 bg-green-100 rounded-lg p-4 text-center">
    {label == 'Overall Score' ? <FaGraduationCap className="mx-auto" color="green" size="2em" /> : null}
    {label == 'Projects' ? <RiFoldersFill className="mx-auto " color="green" size="2em" /> : null}
    {label == 'Certifications' ? <PiCertificateBold className="mx-auto " color="green" size="2em" /> : null}
    {label == 'Achievements' ? <FaTrophy className="mx-auto " color="green" size="2em" /> : null}
    <p className="text-2xl text-green-700 font-bold">{value}</p>
    <p className="text-sm text-green-600">{label}</p>
  </div>
);

export default StatCard;