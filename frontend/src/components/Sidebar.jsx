import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  Bell,
  LogOut,
} from "lucide-react";

const menu = [
  { to: "/panel", label: "Kontrol Paneli", icon: <LayoutDashboard size={20} /> },
  { to: "/panel/students", label: "Öğrenciler", icon: <Users size={20} /> },
  { to: "/panel/courses", label: "Kurslar", icon: <BookOpen size={20} /> },
  { to: "/panel/exams", label: "Sınavlar", icon: <FileText size={20} /> },
  { to: "/panel/instructors", label: "Eğitmenler", icon: <GraduationCap size={20} /> },
  { to: "/panel/notifications", label: "Bildirimler", icon: <Bell size={20} /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b">Admin Paneli</div>
      <nav className="flex-1 py-4">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 transition font-medium ${
                isActive ? "bg-gray-200 text-blue-600" : ""
              }`
            }
            end={item.to === "/"}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
        className="flex items-center gap-3 px-6 py-3 text-red-600 hover:bg-red-50 border-t font-medium"
      >
        <LogOut size={20} /> Çıkış
      </button>
    </aside>
  );
} 