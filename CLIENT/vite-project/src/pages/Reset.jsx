import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Reset = () => {
  const { backendUrl } = useContext(AppContent);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false); // Fixed: boolean instead of string
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false); // Fixed: boolean instead of string
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = React.useRef([]);

  const handleResetSubmit = async (e) => {
    e.preventDefault(); // Fixed: added preventDefault
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp", // Fixed: removed double slash
        { email }
      );
      if (data.success) {
        toast.success("OTP sent to your email address");
        setIsEmailSent(true); // Fixed: set state on success
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const otpValue = inputRefs.current.map(input => input.value).join("");
    setOtp(otpValue); // Fixed: set otp from inputRefs
    setIsOtpSubmitted(true); // Fixed: set state on submit
    setIsLoading(false); // Fixed: reset loading state
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post( // Fixed: added await
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword }
      );
      
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
        src={assets.logo}
        alt="logo"
      />

      {/* Email Form */}
      {!isEmailSent && (
        <form
          onSubmit={handleResetSubmit}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center text-indigo-300 mb-4">
            Enter your registered email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="email_icon" className="w-3 h-3" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-white flex-1"
              type="email"
              placeholder="Email id"
              required
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Submit"}
          </button>
        </form>
      )}

      {/* OTP Form */}
      {isEmailSent  && !isOtpSubmitted &&(
        <form
          onSubmit={handleOtpSubmit}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Email Verify OTP
          </h1>
          <p className="text-center text-indigo-300 mb-4">
            Enter the 6-digit code sent to your email id.
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onInput={(e) => handleInput(e, index)}
                  ref={(e) => (inputRefs.current[index] = e)}
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  type="text"
                  maxLength="1"
                  required
                  disabled={isLoading}
                />
              ))}
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Submit"}
          </button>
        </form>
      )}

      {/* New Password Form */}
      { isOtpSubmitted && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
        >
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center text-indigo-300 mb-4">
            Enter your new password below
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon || assets.mail_icon} alt="lock_icon" className="w-3 h-3" />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-transparent outline-none text-white flex-1"
              type="password"
              placeholder="New Password"
              required
            />
          </div>
          <button 
            type="submit"

            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full disabled:opacity-50"
          >
            {isLoading==true ? "Updating..." : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Reset;
