import React, {useState, useEffect} from "react";
import { projectAnalyticsColumns, type ProjectAnalytics } from "./Columns";
import { DataTable } from "./Data-table";
import projectsApi from "../api/resources/projects";
import { useNavigate } from "react-router-dom";

const Analytics: React.FC = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<ProjectAnalytics[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectsApi.getAnalytics();
                console.log("Fetched projects:", response.data.projects);
                const projectsList = response.data.projects;

                if(projectsList && projectsList.length > 0) {
                    const projectAnalytics = projectsList.map((project : any) => ({
                        ...project,
                        visits: project.Analytics.length
                    }));
                    setProjects(projectAnalytics);
                } else {
                    setProjects([]);
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, [])

    const handleRowClick = (row: ProjectAnalytics) => {
        navigate(`/analytics/${row.id}`);
    };

    return (
        <div>
            <h1 className="text-3xl mb-4 font-bold ">Project Analytics</h1>
            <DataTable columns={projectAnalyticsColumns} data={projects} onRowClick={handleRowClick} />
        </div>
    );
};

export default Analytics;