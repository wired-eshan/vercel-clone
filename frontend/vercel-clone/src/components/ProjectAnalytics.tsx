import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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

const ProjectAnalytics: React.FC = () => {
  const pageState = useLocation();
  const projectData = pageState.state;
  const todaysDate = new Date();
  const initalStartDate = new Date();
  initalStartDate.setDate(initalStartDate.getDate() - 7);

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(initalStartDate);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>(todaysDate);
  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>();

  useEffect(() => {
    if (startDate && endDate && (startDate > endDate)) {
        setError("Inapproriate date range. End date should be greater than start date.")
        return;
    }
    async function getAnalytics() {
      const startDateString = startDate?.toLocaleDateString("en-CA");
      const endDateString = endDate?.toLocaleDateString("en-CA");
      const response = await projectsApi.getProjectAnalytics(projectData.id, {
        startDateString: startDateString,
        endDateString: endDateString,
      });
      console.log(response);
      setData(response.data);
      setError(null);
    }
    getAnalytics();
  }, [startDate, endDate]);

  return (
    <div className="pb-2 px-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold ">{projectData.name}</h1>
      </div>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{projectData.gitUrl}</p>
      </div>
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <p className="cursor-pointer underline">{projectData.subDomain}</p>
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
        <center>
            {error}
        </center>
        
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
