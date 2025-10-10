import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import projectsApi from "../api/resources/projects";
import useApi from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectUrl } from "../utils/getProjectDomain";

interface analytics {
  date: string,
  visits: number
}

const ProjectAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id || "";

  const pageState = useLocation();

  const analyticsRef = useRef<analytics[]>([]);
  const todaysDate = new Date();
  const initalStartDate = new Date();
  initalStartDate.setDate(initalStartDate.getDate() - 7);

  const {
    execute: getProject,
    data: projectData,
    error: fetchProjectError,
    loading: loadingProject,
  } = useApi(projectsApi.getProjectById, { params: projectId });

  const [project, setProject] = useState(pageState.state);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(initalStartDate);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>(todaysDate);
  const [data, setData] = useState<analytics[]>([]);
  const [error, setError] = useState<any>();
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    console.log("pagestate", pageState);
    if (!pageState.state) {
      getProject(projectId);
    }
  }, []);

  useEffect(() => {
    if (projectData) {
      setProject(projectData.data.project);
    }
  }, [projectData]);

  useEffect(() => {
    async function getAnalytics() {
      try {
        setLoadingAnalytics(true);
        const response = await projectsApi.getProjectAnalytics(project.id);
        setData(response.data);
        analyticsRef.current = response.data;
        setError(null);
      } catch (err) {
        console.log("Error fetching analytics: ", err);
        setError(err);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    getAnalytics();
  }, [project]);

const setAnalyticsChartData = (startDate: Date, endDate: Date) => {
  if (analyticsRef.current.length === 0) {
    return [];
  }

  const resultData = analyticsRef.current.filter((item) => {
    const currentDate = new Date(item.date);
    // Reset time for accurate date comparison
    currentDate.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    return currentDate >= start && currentDate <= end;
  });

  setData(resultData);
};

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setError(
        "Inapproriate date range. End date should be greater than start date."
      );
      return;
    }
    if (startDate && endDate) {
      setAnalyticsChartData(startDate, endDate);
    }
  }, [startDate, endDate])

  return (
    <div className="pb-2 px-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold ">{project?.name}</h1>
      </div>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{project?.gitUrl}</p>
      </div>
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <a href={getProjectUrl(project?.subDomain)} target="_blank" className="cursor-pointer underline">{getProjectUrl(project?.subDomain)}</a>
      </div>
      <div className="flex justify-end">
        <div className="flex flex-col gap-3 my-4">
          <div>
            <Label htmlFor="date" className="px-1 mb-2">
              Start Date
            </Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {startDate ? startDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  disabled={(date) => date > (endDate || new Date())}
                  selected={startDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setStartDate(date);
                    setStartDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-col gap-3 my-4 ml-4">
          <div>
            <Label htmlFor="date" className="px-1 mb-2">
              End Date
            </Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {endDate ? endDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  disabled={(date) => date > new Date()}
                  selected={endDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setEndDate(date);
                    setEndDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      {error ? (
        <center>{error}</center>
      ) : loadingAnalytics ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid />
            <Line dataKey="visits" />
            <XAxis dataKey="date" />
            <YAxis />
            <Legend />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProjectAnalytics;
