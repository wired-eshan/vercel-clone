import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import deploymentsApi from "../api/resources/deployments";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const DeploymentLogs: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const deploymentId = id || "";

  const pageState = useLocation();
  const projectData = pageState.state;

  const [logs, setLogs] = useState<any[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState("PENDING");
  const lastTimeStampRef = useRef("0000-00-00 00:00:00");
  const pollingInterval = 2000;

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const timeStamp = lastTimeStampRef.current || "0";

        const res = await deploymentsApi.getLogsById(deploymentId, timeStamp);
        console.log("fetchLogs api call: ", res);
        if (res.data.data && res.data.data.length > 0) {
          setLogs((prev) => [...prev, ...res.data.data]);
          lastTimeStampRef.current =
            res.data.data[res.data.data.length - 1].timestamp;
        }
      } catch (err) {
        console.error("Error fetching logs: ", err);
      }
    };

    const fetchStatus = async () => {
      try {
        const res = await deploymentsApi.getStatus(deploymentId);
        console.log("fetchStatus api call: ", res);
        setDeploymentStatus(res.data.status);
      } catch (err) {
        console.error("Error fetching deployment status: ", err);
      }
    };

    if (deploymentStatus == "SUCCESSFUL" || deploymentStatus == "FAILED") {
      fetchLogs();
      return;
    }

    let statusInterval;
    let logsInterval;

    statusInterval = setInterval(fetchStatus, pollingInterval);
    fetchStatus();

    logsInterval = setInterval(() => {
      if (deploymentStatus == "BUILDING") {
        fetchLogs();
      }
    }, pollingInterval);

    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, [deploymentId, deploymentStatus]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const deleteDeployment = async () => {
    try {
      await deploymentsApi.deleteDeployment(deploymentId);
      navigate(-1);
    } catch (err) {
      console.log("Error delete deployment logs: ", err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Deployment Logs</h3>

        <Dialog>
          <DialogTrigger>
            <Trash2 color="#d23737" className="mx-8 cursor-pointer" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Do you want to delete deployment logs?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete logs
                for this deployment.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="cursor-pointer"
                type="submit"
                variant={"destructive"}
                onClick={deleteDeployment}
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
      <h1 className="text-xl mb-4 font-semibold ">{projectData.name}</h1>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{projectData.gitUrl}</p>
      </div>
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <p className="cursor-pointer underline">{projectData.subDomain}</p>
      </div>

      <div
        ref={logContainerRef}
        className="h-100 overflow-y-auto p-4 bg-black border border-gray-700"
      >
        {logs.map((log, idx) => (
          <div key={idx}>
            <span className="text-gray-600">[{log.timestamp}] </span>
            <span className="text-gray-400"> {log.log}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default DeploymentLogs;
