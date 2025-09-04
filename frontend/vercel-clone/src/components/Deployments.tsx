import React, { useState, useEffect } from "react";
import { deploymentColumns, type Deployment } from "./Columns";
import { DataTable } from "./Data-table";
import { useNavigate } from "react-router-dom";
import deploymentsApi from "../api/resources/deployments";

const data : Deployment[] = [
    {
        id: "1",
        project: "Project Alpha",
        status: "Building",
        timeStamp: Date.now() - 1000000,
        URL: "https://project-alpha.vercel.app",
    },
    {
        id: "2",
        project: "Project Beta",
        status: "Successful",
        timeStamp: Date.now() - 500000,
        URL: "https://project-beta.vercel.app",
    }
];

const Deployments: React.FC = () => {
    const navigate = useNavigate();

    const [deployments, setDeployments] = useState<Deployment[]>([]);

        useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await deploymentsApi.getAll();
                console.log("Fetched deployments:", response.data.data.deployments);
                setDeployments(response.data.data.deployments);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchProjects();
    }, [])

    const handleRowClick = (row: Deployment) => {
        navigate(`/deployments/${row.id}/logs`);
    };

    return (
        <div>
            <h1 className="text-3xl mb-4 font-bold ">Deployments</h1>
            <DataTable columns={deploymentColumns} data={deployments} onRowClick={handleRowClick} />
        </div>
    );
};

export default Deployments;