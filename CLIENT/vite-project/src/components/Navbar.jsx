import React from "react";
import { assets } from "./../assets/assets.js";
import { useNavigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import { AppContent } from "../context/AppContext.jsx";
import { useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";
const Navbar = () => {
  function loginInfo() {}
  const navigate = useNavigate();
  const { isLoggedIn, userData, backendUrl, setIsLoggedIn, setUserData } =
    useContext(AppContent);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/send-verify-otp");
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:px-24 absolute top-0 ">
      <img src={assets.logo} alt="" className="w-28 sm:w-32" />
      
      {userData? (
        <div className="w-9 h-9 bg-black rounded-full text-white flex justify-center items-center relative group">
         
          {userData?.name[0].toUpperCase() || ""}
          <div className="absolute hidden group-hover:block text-black rounded top-0 right-0 z-10 pt-10">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData?.isAccountVerified && (
                <li
                  onClick={sendVerificationOtp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Verify Email
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            navigate("/login");
          }}
          className="flex items-center gap-2 border  border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100"
        >
          Login <img src={assets.arrow_icon} alt="arrow icon" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
