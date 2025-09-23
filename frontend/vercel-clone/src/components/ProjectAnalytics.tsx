import React from "react";
import { useLocation } from "react-router-dom";

const ProjectAnalytics: React.FC = () => {
  const pageState = useLocation();
  const projectData = pageState.state;
  
  return (
    <div className="pb-2 px-2 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold ">{projectData.name}</h1>
      </div>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">Github Repository</p>
        <p className="cursor-pointer underline">{projectData.gitUrl}</p>
      </div>
      <div className="mb-8">
        <p className="text-gray-400 text-sm">Project Domain</p>
        <p className="cursor-pointer underline">{projectData.subDomain}</p>
      </div>
    </div>
  );
};

export default ProjectAnalytics;
