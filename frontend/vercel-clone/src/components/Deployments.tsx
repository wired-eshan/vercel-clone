import { deploymentColumns, type Deployment } from "./Columns";
import { DataTable } from "./Data-table";
import { useNavigate } from "react-router-dom";

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
    },
    {
        id: "3",
        project: "Project Gamma",
        status: "Failed",
        timeStamp: Date.now() - 200000,
        URL: "https://project-gamma.vercel.app",
    },
    {
        id: "4",
        project: "Project Delta",
        status: "Queued",
        timeStamp: Date.now() - 300000,
        URL: "https://project-delta.vercel.app",
    },
    {
        id: "5",
        project: "Project Epsilon",
        status: "Not Started",
        timeStamp: Date.now() - 400000,
        URL: "https://project-epsilon.vercel.app",
    },
];

const Deployments: React.FC = () => {
    const navigate = useNavigate();

    const handleRowClick = (row: Deployment) => {
        navigate(`/deployments/${row.id}/logs`);
    };

    return (
        <div>
        <h1>Deployments Page</h1>
        {/* Add your Deployments content here */}
        <DataTable columns={deploymentColumns} data={data} onRowClick={handleRowClick} />
        </div>
    );
};

export default Deployments;