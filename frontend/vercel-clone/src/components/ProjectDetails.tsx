import React, { useState, useEffect } from "react";
import { deploymentColumns, type Deployment } from "./Columns";
import { DataTable } from "./Data-table";
import { useLocation, useNavigate } from "react-router-dom";
import deploymentsApi from "../api/resources/deployments";
import { useParams } from "react-router-dom";

const data: Deployment[] = [
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
];

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const pageState = useLocation();
  const projectData = pageState.state;

  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    console.log("page state:", projectData);
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
  }, []);

  const handleRowClick = (row: Deployment) => {
    navigate(`/deployments/${row.id}/logs`);
  };

  return (
    <div className="pb-2 px-2">
      <h1 className="text-3xl mb-4 font-bold ">{projectData.name}</h1>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{projectData.gitUrl}</p>
      </div>
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <p className="cursor-pointer underline">{projectData.subDomain}</p>
      </div>

      <p className="mb-2">Deployments</p>
      <DataTable
        columns={deploymentColumns}
        data={deployments}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default ProjectDetails;
