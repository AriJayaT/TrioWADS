import React, { useState } from "react";
import { FaEnvelope, FaKey } from "react-icons/fa";
import { validateLogin } from "/src/utils/validation";
import logo from "/src/assets/logo.jpg";
import InputField from "./InputField";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginSuccess = validateLogin(email, password);
    if (!loginSuccess) {
      setError("Invalid email or password");
    } else {
      setError("");
      // TODO: redirect or perform login action here
      navigate("/admin")
    }
  };

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
      <div className="w-25 h-25 mx-auto -mt-14 mb-4 rounded-full p-0.5 bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 shadow-md">
        <div className="w-full h-full rounded-full overflow-hidden bg-white">
          <img src={logo} alt="Avatar" className="object-cover w-full h-full rounded-full" />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
      <p className="text-gray-600 mb-6">Time to cuddle with your Jellycats 🌸</p>

      <form onSubmit={handleSubmit}>
        <InputField
          label="Your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<FaEnvelope />}
          className="mb-3"
        />

        <InputField
          label="Your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<FaKey />}
          className="mb-2"
        />

        {error && <p className="text-red-500 mt-[-1px] text-sm">{error}</p>}

        <Button variant="bigSubmit">Sign in</Button>
      </form>

      <p className="mt-5 text-sm">New to Jellycats?</p>
      <a href="/signup" className="text-pink-500 font-semibold">
        Create an account 🎀
      </a>
    </div>
  );
};

export default LoginForm;