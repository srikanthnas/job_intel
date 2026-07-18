import "./Sidebar.css";
import {
  LayoutDashboard,
  BarChart3,
  BriefcaseBusiness,
  BrainCircuit,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Search } from "lucide-react";

export default function Sidebar() {
  const menu = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      title: "Salary Predictor",
      icon: <BriefcaseBusiness size={20} />,
      path: "/predictor",
    },
    {
      title: "Skill Gap",
      icon: <BrainCircuit size={20} />,
      path: "/skill-gap",
    },
    {
      title: "Job Search",
      icon: <Search size={20} />,
      path: "/jobs",
    },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="logo-circle">📊</div>

          <div>
            <h2>Job Intel</h2>
            <p>AI Analytics Platform</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menu.map((item) => (
            <NavLink
              key={item.title}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "menu-item active" : "menu-item"
              }
            >
              <div className="menu-left">
                {item.icon}
                <span>{item.title}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      
    </aside>
  );
}