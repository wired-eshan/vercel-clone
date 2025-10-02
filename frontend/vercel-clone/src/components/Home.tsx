import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import projectsApi from '../api/resources/projects';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';

interface project {
  id: string,
  name: string,
  gitUrl: string,
  subDomain: string,
  customDomain?: string
  userId: string
}

const Home : React.FC = () => {
  const navigate = useNavigate();

  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
  }

  const handleSubmit = async (e : React.MouseEvent<HTMLButtonElement>) => {
    try{
      setLoading(true);
      setError(null);
      const res = await projectsApi.create({ gitUrl: githubUrl });
      const deployment = await projectsApi.upload({projectId: res.data.data.project.id});
      console.log("/upload api response: ", deployment);
      const deploymentId = deployment.data.data.deploymentId;
      navigate(`/deployments/${deploymentId}/logs`, {state: res.data.data});
    } catch (e : any) {
      console.log("error deploying project: ", e);
      setError(e.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
        <div>
          <center>
            <h1 className="text-3xl font-bold mt-8">Welcome to ShipStack</h1>
            <p className="text-xl mb-12">Deploy your frontend projects seamlessly.</p>
            <div className="w-9/12">
              <Input placeholder="Github Repo URL" className="border border-gray-500 my-4" value={githubUrl} onChange={handleChange} />
              <div className='m-2 text-red-400'>
                {error ?? error}
              </div>
              <Button className="mx-4 cursor-pointer" variant="secondary" onClick={handleSubmit}>{loading ? <Loader color="#000000" /> : "Deploy"}</Button>
            </div>
          </center>
        </div>
    </>
  )
}

export default Home;