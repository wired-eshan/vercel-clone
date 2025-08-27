import React from 'react'
import { useAuth } from "../contexts/AuthContext";
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';

const Home : React.FC = () => {
  const { user } = useAuth();
  console.log("User in Home component:", user);
  return (
    <>
        <div>
          <center>
            <h1 className="text-3xl font-bold mt-8">Welcome to ShipStack {user?.name} </h1>
            <p className="text-xl mb-12">Deploy your frontend projects seamlessly.</p>
            <div className="w-9/12">
              <Input placeholder="Github Repo URL" className="border border-gray-500 my-4" />
              <Button className="mx-4 cursor-pointer" variant="secondary">Deploy</Button>
            </div>
          </center>
        </div>
    </>
  )
}

export default Home;