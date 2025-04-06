import { Play, Pencil, Trash2, AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLatestMeasurement, useRecentMeasurements, useGetConnection, useEditMonitor, useDeleteMonitor, useAddMeasurement } from '@/store/backend';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { runMonitor } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MonitorChart } from './MonitorChart';
import { MonitorCardErrorBoundary } from './MonitorCardErrorBoundary';
import { MonitorDialog } from './MonitorDialog';
import { useState } from 'react';
import type { Monitor } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

dayjs.extend(relativeTime);

interface MonitorCardProps {
  monitor: Monitor;
}

const MonitorCardContent: React.FC<MonitorCardProps> = ({ monitor }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: latestMeasurement } = useLatestMeasurement(monitor.id);
  const { data: recentMeasurements } = useRecentMeasurements(monitor.id);
  const { data: connection } = useGetConnection(monitor.connection_id);
  const editMonitor = useEditMonitor(monitor.id);
  const deleteMonitor = useDeleteMonitor();
  const addMeasurement = useAddMeasurement();

  const chartData = recentMeasurements?.map(m => ({
    timestamp: dayjs(m.created_at).format('M/D'),
    value: m.value
  })).reverse() || [];

  const lastMeasuredTime = latestMeasurement 
    ? dayjs(latestMeasurement.created_at).fromNow()
    : 'Never';

  const handleRun = async () => {
    if (!connection) return;
    setIsLoading(true);
    
    try {
      await runMonitor(
        monitor,
        connection,
        (data) => editMonitor.mutateAsync(data),
        async (data) => {
          await addMeasurement.mutateAsync({
            monitor_id: monitor.id,
            value: data.value
          });
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isError = Boolean(monitor.last_error_at && 
    (!monitor.last_success_at || dayjs(monitor.last_error_at).isAfter(monitor.last_success_at)));

  return (
    <>
      <Card className="overflow-hidden bg-background border-border py-4 gap-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <HoverCard>
              <HoverCardTrigger asChild>
                <CardTitle className="text-base font-medium leading-none truncate cursor-default">{monitor.name}</CardTitle>
              </HoverCardTrigger>
              <HoverCardContent className="w-fit">
                <div className="font-medium">{monitor.name}</div>
              </HoverCardContent>
            </HoverCard>
            {isError && (
              <HoverCard>
                <HoverCardTrigger>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="font-medium">Error</div>
                  <div className="text-sm text-muted-foreground mt-1">{monitor.error_message}</div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>
          <div className="flex gap-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleRun}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{monitor.name}"? This action cannot be undone.
                    All associated measurements will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => {
                      deleteMonitor.mutate(monitor.id);
                      setIsDeleteOpen(false);
                    }} 
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Separator className="mb-6" />
          <div className="p-0">
            {chartData.length > 0 ? (
              <MonitorChart data={chartData} />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No measurements yet.
              </div>
            )}
          </div>
          <Separator className="my-3" />
          <div className="px-6 flex items-baseline gap-2">
            {chartData.length === 0 ? <div className='h-6'></div> : <>
            <span className="text-lg font-medium">{latestMeasurement?.value ?? 'N/A'}</span>
            <span className="text-sm ml-2 text-muted-foreground">{lastMeasuredTime}</span>
            </>}
          </div>
        </CardContent>
      </Card>
      <MonitorDialog 
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        monitor={monitor}
        categoryId={monitor.category_id}
      />
    </>
  );
};

export const MonitorCard: React.FC<MonitorCardProps> = (props) => {
  return (
    <MonitorCardErrorBoundary>
      <MonitorCardContent {...props} />
    </MonitorCardErrorBoundary>
  );
}; 