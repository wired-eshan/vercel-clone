import React, { useState, useEffect } from "react";
import { deploymentColumns, type Deployment } from "./Columns";
import { DataTable } from "./Data-table";
import { useLocation, useNavigate } from "react-router-dom";
import deploymentsApi from "../api/resources/deployments";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import projectsApi from "@/api/resources/projects";

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
  const projectId = id || "";

  const navigate = useNavigate();
  const pageState = useLocation();
  const projectData = pageState.state;

  const [deployments, setDeployments] = useState<Deployment[]>([]);

  useEffect(() => {
    console.log("page state:", projectData);
    const fetchProjects = async () => {
      try {
        const response = await deploymentsApi.getDeploymentByProjectId(
          projectId
        );
        console.log("Fetched deployments:", response.data);
        setDeployments(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleRowClick = (row: Deployment) => {
    navigate(`/deployments/${row.id}/logs`, {state: projectData});
  };

  const deleteProject = async () => {
    try{
      await projectsApi.deleteProject(projectId);
      navigate(-1);
    }catch(err) {
      console.log("Error deleting project: ", err);
    }
  }

  return (
    <div className="pb-2 px-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold ">{projectData.name}</h1>
        <Dialog>
          <DialogTrigger>
            <Trash2 color="#d23737" className="mx-8 cursor-pointer" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{`Do you want to delete ${projectData.name} project?`}</DialogTitle>
              <DialogDescription>
                {`This action cannot be undone. This will permanently delete this project and the domain ${projectData.subDomain} will be unavailable.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="submit"
                variant={"destructive"}
                onClick={deleteProject}
              >
                Delete
              </Button>
              <DialogClose asChild>
                <Button
                  className="cursor-pointer"
                  type="button"
                  variant={"secondary"}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
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
