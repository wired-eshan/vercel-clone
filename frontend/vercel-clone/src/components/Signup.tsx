import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import usersApi from "../api/resources/user";
import useApi from "../hooks/useApi";

interface InputState {
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const Navigate = useNavigate();

  const [input, setInput] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const {
    execute: signup,
    error: signupError,
    loading,
  } = useApi(usersApi.signup);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev: InputState) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.confirmPassword !== input.password) {
      setError("Passwords do not match.");
    } else {
        try {
        await signup({ email: input.email, password: input.password });
        console.log("user email: ", input.email)
        Navigate("/login", {state: input.email});
        } catch (err) {
        console.log("Error signing up: ", err);
        }
    }
  };

  return (
    <>
      <div className="flex-col content-center justify-items-center bg-gradient-to-b from-transparent to-black min-h-screen">
        <div>
          <h1 className="font-bold text-3xl mb-5 text-gray-300">
            Build. Deploy. Analyze.
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex-col text-center bg-gradient-to-tr from-transparent to-black justify-items-center border border-gray-900 rounded-xl pb-12 w-full max-w-md mx-auto"
        >
          <div>
            <h1 className="text-2xl font-bold mt-8 mb-2">
              Get started with ShipStack.
            </h1>
            <div className="text-gray-400 mb-5">
              <span>Already signed up? </span>
              <a href="/login" className="underline cursor-pointer hover:text-white hover:font-semibold">
                Log in.
              </a>
            </div>
            <div>
              <input
                className="border border-gray-700 rounded-xl py-2 px-4 mb-4 w-full"
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
                className="border border-gray-700 rounded-xl py-2 px-4 mb-4 w-full"
                type="password"
                name="password"
                placeholder="Password"
                value={input.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <input
                className="border border-gray-700 rounded-xl py-2 px-4 mb-4 w-full"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={input.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {signupError && <p className="text-red-500 mb-2">{signupError}</p>}
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <button
              className="border border-gray-500 cursor-pointer rounded-xl py-2 px-8 hover:text-black hover:bg-gray-300 hover:scale-105 "
              type="submit"
            >
              {loading ? <Loader /> : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Signup;
