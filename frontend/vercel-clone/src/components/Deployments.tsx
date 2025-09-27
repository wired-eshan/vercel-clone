import React, { useState, useEffect } from "react";
import { deploymentColumns, type Deployment } from "./Columns";
import { DataTable } from "./Data-table";
import { useNavigate } from "react-router-dom";
import deploymentsApi from "../api/resources/deployments";
import useApi from "../hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton"

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
    const {data, error, loading} = useApi(deploymentsApi.getAll, {auto: true});

    const [deployments, setDeployments] = useState<Deployment[]>([]);

    useEffect(() => {
        if(data) {
            setDeployments(data.data.data.deployments);
        }
    }, [data]);

    const handleRowClick = (row: Deployment) => {
        navigate(`/deployments/${row.id}/logs`, {state: row.project});
    };

    if(loading) {
        return (
            <div>
                <h1 className="text-3xl mb-4 font-bold ">Deployments</h1>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        )
    }

    if(error) {
        return (
            <div>
                <h1 className="text-3xl mb-4 font-bold ">Deployments</h1>
                {error}
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl mb-4 font-bold ">Deployments</h1>
            <DataTable columns={deploymentColumns} data={deployments} onRowClick={handleRowClick} />
        </div>
    );
};

export default Deployments;