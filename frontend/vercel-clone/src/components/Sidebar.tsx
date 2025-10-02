import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, UserX } from "lucide-react";
import Modal from "./Modal";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    //logout logic here

    navigate("/login");
  };

  const handleDeleteProfile = () => {
    //delete profile logic

    navigate("/login");
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
          <PopoverTrigger className="w-full cursor-pointer">
            <button className="p-4 cursor-pointer">User settings</button>
          </PopoverTrigger>
          <PopoverContent className="p-0 text-white bg-black">

            <div className="border cursor-pointer hover:bg-red-400 pr-4 flex justify-between items-center">
              <Modal
                title={`Delete Profile`}
                description={`This action cannot be undone. Do you want to delete your profile permanently?`}
                primaryBtn={"Delete"}
                primaryBtnVariant={"destructive"}
                secondaryBtn={"Cancel"}
                onConfirm={handleDeleteProfile}
              >
                <button className="p-4 cursor-pointer">Delete profile</button>
                <UserX size={18} />
              </Modal>
            </div>

            <div className="border cursor-pointer hover:bg-red-400 pr-4 flex justify-between items-center">
              <Modal
                title={"Are you sure you want to logout?"}
                primaryBtn={"Logout"}
                primaryBtnVariant={"destructive"}
                secondaryBtn={"Cancel"}
                onConfirm={handleLogout}
              >
                <button className="p-4 cursor-pointer">Logout</button>
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
