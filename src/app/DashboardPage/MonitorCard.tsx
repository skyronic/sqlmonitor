import { Play, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLatestMeasurement, useRecentMeasurements } from '@/store/backend';
import dayjs from 'dayjs';
import { MonitorChart } from './MonitorChart';

interface MonitorCardProps {
  monitor: {
    id: number;
    name: string;
  };
}

export const MonitorCard: React.FC<MonitorCardProps> = ({ monitor }) => {
  const { data: latestMeasurement } = useLatestMeasurement(monitor.id);
  const { data: recentMeasurements } = useRecentMeasurements(monitor.id);

  const chartData = recentMeasurements?.map(m => ({
    timestamp: dayjs(m.created_at).format('M/D'),
    value: m.value
  })).reverse() || [];

  const lastMeasuredTime = latestMeasurement 
    ? dayjs(latestMeasurement.created_at).fromNow()
    : 'Never';

  return (
    <Card className="overflow-hidden bg-background border-border py-4 gap-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-medium leading-none">{monitor.name}</CardTitle>
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Separator className="mb-6" />
        <div className="p-0">
          <MonitorChart data={chartData} />
        </div>
        <Separator className="my-3" />
        <div className="px-6 flex items-baseline gap-2">
          <span className="text-lg font-medium">{latestMeasurement?.value ?? 'N/A'}</span>
          <span className="text-sm ml-2 text-muted-foreground">{lastMeasuredTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}; 