import React, {useState, useEffect} from "react";
import { projectAnalyticsColumns, type ProjectAnalytics } from "./Columns";
import { DataTable } from "./Data-table";
import projectsApi from "../api/resources/projects";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton"

const Analytics: React.FC = () => {
    const navigate = useNavigate();
    const {data, error, loading} = useApi(projectsApi.getAnalytics, {auto: true});

    const [projects, setProjects] = useState<ProjectAnalytics[]>([]);

    useEffect(() => {
        if(data) {
            const projectsList = data.data.projects;
            setProjects(projectsList);
        }
    }, [data]);

    const handleRowClick = (row: ProjectAnalytics) => {
        navigate(`/analytics/${row.id}`, {state: row});
    };

    if(loading) {
        return (
            <div>
                <h1 className="text-3xl mb-4 font-bold ">Project Analytics</h1>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    if(error) {
        return (
            <div>
                <h1 className="text-3xl mb-4 font-bold ">Project Analytics</h1>
                {error}
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl mb-4 font-bold ">Project Analytics</h1>
            <DataTable columns={projectAnalyticsColumns} data={projects} onRowClick={handleRowClick} />
        </div>
    );
};

export default Analytics;