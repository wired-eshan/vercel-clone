import React, {useState, useEffect} from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

    interface InputState {
        email: string;
        password: string;
    }

    interface HandleChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

    const handleChange = (e: HandleChangeEvent) => {
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
            <center>
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={input.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={input.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button type="submit">Login</button>
                </form>
            </center>
        </>
    )
};

export default Login;