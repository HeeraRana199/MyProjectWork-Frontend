import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';

const margin = { right: 24 };

const data = [4000, 2000, 3500, 4000, 4500];//null value to test connectNulls
const xData = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'];

function ScoreTrend() {
  return (
    <div className="flex flex-col gap-4">
        <h2 className=' font-semibold'>Score Trend</h2>
        <div className="flex items-center justify-center border rounded-lg h-48 text-gray-400">

            <Stack sx={{ width: '100%', height: 200 }}>
            <LineChart
                xAxis={[{ data: xData, scaleType: 'point', height: 28 }]}
                series={[{ data, connectNulls: true, showMark: true }]}
                margin={margin}
            />
            </Stack>

        </div>
    </div>
  );
}

export default ScoreTrend;