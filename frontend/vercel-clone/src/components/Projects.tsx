import React, {useState, useEffect} from "react";
import { projectColumns, type Project } from "./Columns";
import { DataTable } from "./Data-table";
import { useNavigate } from "react-router-dom";
import projectsApi from "../api/resources/projects"

const data : Project[] = [
    {
        id: "1",
        name: "Project Alpha",
        gitUrl: "www.github.com/alpha"
    },
    {
        id: "2",
        name: "Project Beta",
        gitUrl: "www.github.com/beta"
    },
];

const Projects: React.FC = () => {
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectsApi.getAll();
                console.log("Fetched projects:", response.data.data.projects);
                setProjects(response.data.data.projects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, [])

    const handleRowClick = (row: Project) => {
        navigate(`/project/${row.id}`, {state: row});
    };

    return (
        <div>
            <h1 className="text-3xl mb-4 font-bold ">Projects</h1>
            <DataTable columns={projectColumns} data={projects} onRowClick={handleRowClick} />
        </div>
    );
};

export default Projects;
