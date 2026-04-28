import { PieChart, pieClasses } from '@mui/x-charts/PieChart';
import { desktopOS, valueFormatter } from './webUsageStats';

function CategoryScore() {
  return (
     <div className="flex flex-col gap-4">
        <h2 className=' font-semibold'>Performance by Category</h2>
        <div className="flex items-center justify-center border rounded-lg h-48 text-gray-400">
                <PieChart
                series={[
                    {
                    arcLabel: (item) => `${item.value}%`,
                    arcLabelMinAngle: 35,
                    arcLabelRadius: '60%',
                    ...data,
                    },
                ]}
                sx={{
                    [`& .${pieClasses.arcLabel}`]: {
                    fontWeight: 'bold',
                    },
                }}
                {...size}
                />
        </div>
    </div>
  );
}

const size = {
  width: 200,
  height: 200,
};

const data = {
  data: desktopOS,
  valueFormatter,
};

export default CategoryScore;
