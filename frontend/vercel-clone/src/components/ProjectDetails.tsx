import React, { useEffect, useState } from "react";
import { deploymentColumns, type Deployment } from "./Columns";
import { DataTable } from "./Data-table";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import projectsApi from "@/api/resources/projects";
import deploymentsApi from "../api/resources/deployments";
import useApi from "../hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectUrl } from "../utils/getProjectDomain";
import Modal from "./Modal";

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id || "";

  const {
    execute: getProject,
    data: projectData,
    error: fetchProjectError,
    loading: loadingProject,
  } = useApi(projectsApi.getProjectById, { params: projectId });

  const {
    data: deploymentData,
    error: fetchDeploymentsError,
    loading: loadingDeployments,
  } = useApi(deploymentsApi.getDeploymentByProjectId, {
    auto: true,
    params: projectId,
  });

  const {
    execute: deleteProjectApi,
    loading: deletingProject,
    error: deleteProjectError,
  } = useApi(projectsApi.deleteProject);

  const navigate = useNavigate();
  const pageState = useLocation();

  const [project, setProject] = useState(pageState.state);
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    console.log("inside useeffect: ", projectData);
    if (projectData) {
      setProject(projectData.data.project);
    }
    if (deploymentData) {
      setDeployments(deploymentData.data);
    }
  }, [projectData, deploymentData]);

  useEffect(() => {
    if (!pageState.state) {
      getProject(projectId);
    }
  }, []);

  const handleRowClick = (row: Deployment) => {
    navigate(`/deployments/${row.id}/logs`, { state: project });
  };

  const deleteProject = async () => {
    try {
      await deleteProjectApi(projectId);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting project: ", err);
    }
  };

  if (loadingProject || loadingDeployments) {
    return (
      <div>
        <h1 className="text-3xl mb-4 font-bold">Project Details</h1>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (fetchProjectError || fetchDeploymentsError) {
    return (
      <div>
        <h1 className="text-3xl mb-4 font-bold">Project Details</h1>
        <p className="text-red-500">
          {fetchProjectError?.toString() || fetchDeploymentsError?.toString()}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-2 px-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{project?.name}</h1>
        <Modal
          title={`Do you want to delete ${project?.name} project?`}
          description={`This action cannot be undone. This will permanently delete this project and the domain ${project?.subDomain} will be unavailable.`}
          primaryBtn={deletingProject ? "Deleting..." : "Delete"}
          primaryBtnVariant={"destructive"}
          secondaryBtn={"Cancel"}
          onConfirm={deleteProject}
        >
          <Trash2 color="#d23737" className="mx-8 cursor-pointer ml-auto" />
        </Modal>
        {deleteProjectError && (
          <p className="text-red-500 mt-2">{deleteProjectError}</p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{project?.gitUrl}</p>
      </div>

      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <a
          href={getProjectUrl(project?.subDomain)}
          target="_blank"
          className="cursor-pointer underline"
        >
          {getProjectUrl(project?.subDomain)}
        </a>
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
