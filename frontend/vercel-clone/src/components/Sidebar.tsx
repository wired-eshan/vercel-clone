import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CircleUserRound, LogOut, UserX } from "lucide-react";
import Modal from "./Modal";
import useApi from "../hooks/useApi";
import usersApi from "../api/resources/user"
import authApi from "../api/resources/auth";
import { useAuth } from "../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {user} = useAuth();
  
  const {
    execute: logout,
    error: logoutError,
    loading: loggingOut
  } = useApi(authApi.logout);

  const {
    execute: deleteProfile,
    error: deleteError,
    loading: deletingProfile
  } = useApi(usersApi.deleteUser);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(0);
      navigate("/login");
    } catch(error) {
      console.log("Error logging out: ", error);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await deleteProfile(user.userId);
      await logout();
      navigate(0);
      navigate("/login");
    } catch(error) {
      console.log("Error logging out: ", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-black text-white flex flex-col sticky top-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        ShipStack
      </div>
      <nav className="flex-1">
        <Link
          to="/"
          className="block hover:text-gray-300 p-4 border-b border-gray-900 hover:bg-gray-900"
        >
          Home
        </Link>
        <Link
          to="/projects"
          className="block hover:text-gray-300 p-4 border-b border-gray-900 hover:bg-gray-900"
        >
          Projects
        </Link>
        <Link
          to="/deployments"
          className="block hover:text-gray-300 p-4 border-b border-gray-900 hover:bg-gray-900"
        >
          Deployments
        </Link>
        <Link
          to="/analytics"
          className="block hover:text-gray-300 p-4 border-b border-gray-900 hover:bg-gray-900"
        >
          Analytics
        </Link>
      </nav>
      <div className="border rounded border-gray-700 bg-gray-800 hover:bg-gray-900 m-2">
        <Popover>
          <PopoverTrigger className="w-full p-4 cursor-pointer">
            User settings
          </PopoverTrigger>
          <PopoverContent className="p-0 text-white bg-black">
            <div className="flex justify-center content-aroundw items-center p-2">
              <CircleUserRound size={16} className="mr-2" />
              {user?.email}
            </div>
            <div className="border cursor-pointer hover:bg-red-400 pr-4 flex justify-between items-center">
              <Modal
                title={`Delete Profile`}
                description={`This action cannot be undone. Do you want to delete your profile permanently?`}
                primaryBtn={deletingProfile? "Deleting..." : "Delete"}
                primaryBtnVariant={"destructive"}
                secondaryBtn={"Cancel"}
                onConfirm={handleDeleteProfile}
              >
                Delete profile
                <UserX size={18} />
              </Modal>
            </div>

            <div className="border cursor-pointer hover:bg-red-400 pr-4 flex justify-between items-center">
              <Modal
                title={"Are you sure you want to logout?"}
                primaryBtn={loggingOut ? "Logging out..." : "Logout"}
                primaryBtnVariant={"destructive"}
                secondaryBtn={"Cancel"}
                onConfirm={handleLogout}
              >
                Logout
                <LogOut size={18} />
              </Modal>
            </div>            
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
};

export default Sidebar;
