import {
  FcApproval,
  FcDiploma1,
  FcSynchronize
} from "react-icons/fc";
import { IoArrowForward } from "react-icons/io5";
import { LiaCertificateSolid } from "react-icons/lia";

// Certificate Section
const CertificationsSection = ({ title, items }) => (
  <div className="bg-white rounded-xl shadow p-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <FcDiploma1 size="2em" />{title}
      </h3>

      <span className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
        View All Certificates
        <IoArrowForward size="1.25em" />
      </span>
    </div>

    <div className="border-t border-gray-300 mb-4" />

    {/* Certificates List */}
    <ul className="space-y-4">
      {items.slice(0, 4).map((item, i) => {

        return (
          <li key={i} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
            {/* Left Side */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <LiaCertificateSolid size="1.75em" className="text-blue-600" />
              </div>

              <div>
                <p className="font-medium text-sm xl:text-base">
                  {item.certificationName}
                </p>
                
                <p className="text-xs text-gray-400">
                  Issued By: {item.certificationProvider}
                </p>
              </div>
            </div>

            {/* Right Status */}
            <span
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                ${
                  item.status == true ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {item.status == true ? <FcApproval /> : <FcSynchronize />}
              {item.status == true ? `Verified` : `Pending`}
            </span>
          </li>
        );
      })}
    </ul>
  </div>
);

export default CertificationsSection;