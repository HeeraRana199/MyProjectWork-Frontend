
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const AttendanceScore = ({ attendanceScore }) => (
    <div className="flex flex-col gap-4">
      <h2 className=' font-semibold'>Attendance Score</h2>
      <div className="flex items-center justify-center border rounded-lg h-48 text-gray-400">

        <Gauge value={attendanceScore} startAngle={-110} endAngle={110}
          sx={{[`& .${gaugeClasses.valueText}`]: {
              fontSize: 40,
              transform: 'translate(0px, 0px)',
            },
          }}
          text={({ value, valueMax }) => `${value} / ${valueMax}`}
        />

      </div>
    </div>
);

export default AttendanceScore;