import React, {useState, useEffect} from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface InputState {
    email: string;
    password: string;
}

const Login : React.FC = () => {
    const [input, setInput] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const { login, isLoggedIn } = useAuth();
    const Navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
            Navigate("/home", { replace: true });
        }
    }, [isLoggedIn, Navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInput((prev: InputState) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        const { email, password } = input;
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }
        const response = await login(email, password);
        console.log("Login response:", response);
        
        if (!response.success) {
            setError(response.message || "Login failed");
        } else {
            Navigate("/home", { replace: true });
        }
    }

    return (
        <>

            <div className="flex-col content-center justify-items-center bg-gradient-to-b from-transparent to-black min-h-screen">
                <div>
                    <h1 className="font-bold text-3xl mb-5 text-gray-300">Build. Deploy. Analyze.</h1>
                </div>
                <form onSubmit={handleSubmit} className="flex-col text-center bg-gradient-to-tr from-transparent to-black justify-items-center border border-gray-900 rounded-xl pb-12 w-4/12">
                    
                    <h1 className="text-2xl font-bold mt-8 mb-2">Welcome back</h1>
                    <div className="text-gray-400 mb-5">
                        <span>Don't have an account? </span>
                        <a className="underline cursor-pointer hover:text-white hover:font-semibold">Sign up</a>
                    </div>
                    <div>
                        <input
                            className="border border-gray-700 rounded-xl py-2 px-4 mb-4 w-70"
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={input.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="border border-gray-700 rounded-xl py-2 px-4 mb-4 w-70"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={input.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 mb-2">{error}</p>}
                    <button className="border border-gray-500 cursor-pointer rounded-xl py-2 px-8 hover:text-black hover:bg-gray-300 hover:scale-105 " type="submit">Login</button>                
                </form>
            </div>
        </>
    )
};

export default Login;