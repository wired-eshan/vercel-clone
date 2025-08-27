import React from "react";
import { projectColumns, type Project } from "./Columns";
import { DataTable } from "./Data-table";
import { useNavigate } from "react-router-dom";

const data : Project[] = [
    {
        id: "1",
        name: "Project Alpha",
        gitRepo: "www.github.com/alpha",
        active: true,
        URL: "https://project-alpha.vercel.app",
    },
    {
        id: "2",
        name: "Project Beta",
        gitRepo: "www.github.com/beta",
        active: false,
        URL: "https://project-beta.vercel.app",
    },
    {
        id: "3",
        name: "Project Gamma",
        gitRepo: "www.github.com/gamma",
        active: true,
        URL: "https://project-gamma.vercel.app",
    },
    {
        id: "4",
        name: "Project Delta",
        gitRepo: "www.github.com/delta",
        active: false,
        URL: "https://project-delta.vercel.app",
    },
    {
        id: "5",
        name: "Project Epsilon",
        gitRepo: "www.github.com/epsilon",
        active: true,
        URL: "https://project-epsilon.vercel.app",
    },
];

const Projects: React.FC = () => {
    const navigate = useNavigate();

    const handleRowClick = (row: Project) => {
        navigate(`/project/${row.id}`);
    };

    return (
        <div>
        <h1>Projects Page</h1>
        {/* Add your projects content here */}
        <DataTable columns={projectColumns} data={data} onRowClick={handleRowClick} />
        </div>
    );
};

export default Projects;
