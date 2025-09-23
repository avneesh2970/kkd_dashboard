import { SlLogout } from "react-icons/sl";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Header() {
  const { adminLogout } = useAuth();
  return (
    <div className="flex items-center justify-between">
      <Link to="/">
        <img src="/logo.png" alt="Logo" className="w-16" />
      </Link>
      <button
        className="font-medium text-[#333333] hover:text-black hover:underline"
        onClick={adminLogout}
      >
        <SlLogout className="inline mr-2" strokeWidth={50} />
        LogOut
      </button>
    </div>
  );
}
