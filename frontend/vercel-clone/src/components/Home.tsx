import React, { useState } from 'react'
import { useAuth } from "../contexts/AuthContext";
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import projectsApi from '../api/resources/projects';
import { type AxiosResponse } from 'axios';

interface project {
  id: string,
  name: string,
  gitUrl: string,
  subDomain: string,
  customDomain?: string
  userId: string
}

const Home : React.FC = () => {
  const { user } = useAuth();

  const [githubUrl, setGithubUrl] = useState("");

  const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value);
  }

  const handleSubmit = async (e : React.MouseEvent<HTMLButtonElement>) => {
    try{
      const res = await projectsApi.create({ gitUrl: githubUrl });
      await projectsApi.upload({projectId: res.data.data.project.id});
    } catch (e) {
      console.log("error deploying project: ", e);
    }
  }

  return (
    <>
        <div>
          <center>
            <h1 className="text-3xl font-bold mt-8">Welcome to ShipStack {user?.name} </h1>
            <p className="text-xl mb-12">Deploy your frontend projects seamlessly.</p>
            <div className="w-9/12">
              <Input placeholder="Github Repo URL" className="border border-gray-500 my-4" value={githubUrl} onChange={handleChange} />
              <Button className="mx-4 cursor-pointer" variant="secondary" onClick={handleSubmit}>Deploy</Button>
            </div>
          </center>
        </div>
    </>
  )
}

export default Home;