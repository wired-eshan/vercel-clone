import React from "react";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  return <div>Project Details of project id: {id}</div>;
};

export default ProjectDetails;
