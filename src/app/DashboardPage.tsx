"use client"

import React from 'react';
import { useListMonitors, useLatestMeasurement, useRecentMeasurements, useListCategories } from '../store/backend';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Play, Pencil, Trash2, Plus, MoreVertical } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

dayjs.extend(relativeTime);

interface DashboardPageProps {
  dashboardId: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ dashboardId }) => {
  const categoryId = parseInt(dashboardId);
  const { data: monitors } = useListMonitors(categoryId);
  const { data: categories } = useListCategories();
  
  const category = categories?.find(c => c.id === categoryId);
  const categoryName = category?.name || 'Dashboard';

  const handleRunAll = () => {
    console.log('Running all monitors');
  };

  const handleEditDashboard = () => {
    console.log('Edit dashboard');
  };

  const handleDeleteDashboard = () => {
    console.log('Delete dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-2xl font-semibold">{categoryName}</h1>
          <p className="text-sm text-muted-foreground">Monitor your metrics in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRunAll}>
            <Play className="h-4 w-4 mr-2" />
            Run All
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Monitor
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Dashboard Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleEditDashboard}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDeleteDashboard} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Dashboard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitors?.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      </div>
    </div>
  );
};

const MonitorCard: React.FC<{ monitor: any }> = ({ monitor }) => {
  const { data: latestMeasurement } = useLatestMeasurement(monitor.id);
  const { data: recentMeasurements } = useRecentMeasurements(monitor.id);

  const chartData = recentMeasurements?.map(m => ({
    timestamp: dayjs(m.created_at).format('M/D'),
    value: m.value
  })).reverse() || [];

  const chartConfig = {
    value: {
      label: "Value",
    },
  } satisfies ChartConfig;

  const lastMeasuredTime = latestMeasurement 
    ? dayjs(latestMeasurement.created_at).fromNow()
    : 'Never';

  return (
    <Card className="overflow-hidden bg-background border-border py-4 gap-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-medium leading-none ">{monitor.name}</CardTitle>
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
        <div className=" p-0">
          <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              >
                <CartesianGrid vertical={false} opacity={0.1} />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={10}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  width={30}
                  tickFormatter={(value) => value}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </AreaChart>
          </ChartContainer>
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

export default DashboardPage; 