import React from "react";
import { useParams } from "react-router-dom";

const DeploymentLogs: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return <div>Deployment logs for project id: {id}</div>;
};

export default DeploymentLogs;
