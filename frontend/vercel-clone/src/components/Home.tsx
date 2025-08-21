import React from 'react'
import { useAuth } from "../contexts/AuthContext";

const Home : React.FC = () => {
  const { user, logout } = useAuth();
  console.log("User in Home component:", user);
  return (
    <>
        <div style={{ alignItems: "center", justifyContent: "center"}}>
          <center>
            <h1>Welcome to the Home Page</h1>
            {user ? (
                <div>
                    <h2>Hello, {user.email}</h2>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <h2>Please log in</h2>
            )}
          </center>
        </div>
    </>
  )
}

export default Home;