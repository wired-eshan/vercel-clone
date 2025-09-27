import React, {useState, useEffect} from "react";
import { projectColumns, type Project } from "./Columns";
import { DataTable } from "./Data-table";
import { useNavigate } from "react-router-dom";
import projectsApi from "../api/resources/projects"
import useApi from "../hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton"

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
    const {data, error, loading} = useApi(projectsApi.getAll, {auto: true});

    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if(data) {
            setProjects(data.data.data.projects);
        }
    }, [data])

    const handleRowClick = (row: Project) => {
        navigate(`/project/${row.id}`, {state: row});
    };

    if(loading) {
        return (
            <div>
                <h1 className="text-3xl mb-4 font-bold ">Projects</h1>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    if(error) {
        return (
            <div>
                <h1 className="text-3xl mb-4 font-bold ">Projects</h1>
                {error}
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl mb-4 font-bold ">Projects</h1>
            <DataTable columns={projectColumns} data={projects} onRowClick={handleRowClick} />
        </div>
    );
};

export default Projects;
