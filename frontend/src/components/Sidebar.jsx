import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  UserRound,
  ShieldCheck,
  TrendingUp,
  BriefcaseBusiness,
  Building2,
  Sparkles,
  BookOpen,
  LogOut
} from "lucide-react";

function Sidebar() {

  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "My Profile",
      path: "/profile",
      icon: UserRound
    },
    {
      name: "Risk Assessment",
      path: "/risk-assessment",
      icon: ShieldCheck
    },
    {
      name: "Market",
      path: "/market",
      icon: TrendingUp
    },
    {
      name: "Investments",
      path: "/investments",
      icon: BriefcaseBusiness
    },
    {
      name: "Brokers",
      path: "/brokers",
      icon: Building2
    },
    {
      name: "AI Recommendations",
      path: "/recommendations",
      icon: Sparkles
    },
    {
      name: "Why This Recommendation?",
      path: "/xai",
      icon: Sparkles
    },
    {
      name: "Financial Education",
      path: "/education",
      icon: BookOpen
    }
  ];

  return (
    <aside className="sidebar">

      <Link to="/" className="sidebar-logo">
        <Sparkles size={22} />
        InvestAI
      </Link>

      <div className="sidebar-menu">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );

        })}

      </div>

      <Link to="/" className="sidebar-item logout">
        <LogOut size={18} />
        <span>Logout</span>
      </Link>

    </aside>
  );
}

export default Sidebar;