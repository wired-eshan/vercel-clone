import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import deploymentsApi from "../api/resources/deployments";

const DeploymentLogs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const deploymentId = id || "";

  const pageState = useLocation();
  const projectData = pageState.state;

  const [logs, setLogs] = useState<any[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState("PENDING");
  const lastTimeStampRef = useRef("0000-00-00 00:00:00");
  const pollingInterval = 2000;

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

  return (
    <>
      <h3 className="text-2xl font-bold mb-4">Deployment Logs</h3>
      <h1 className="text-xl mb-4 font-semibold ">{projectData.name}</h1>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{projectData.gitUrl}</p>
      </div>
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <p className="cursor-pointer underline">{projectData.subDomain}</p>
      </div>

      <div className="h-100 overflow-y-auto p-4 bg-black">
        {logs.map((log, idx) => (
          <div key={idx}>
            [{log.timestamp}] {log.log}
          </div>
        ))}
      </div>
    </>
  );
};

export default DeploymentLogs;
