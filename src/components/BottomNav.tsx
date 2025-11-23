import { motion } from "framer-motion";
import { NavLink } from "@/components/NavLink";
import { Play, CheckSquare, Calendar, PieChart, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: Play, label: "기록" },
  { path: "/todos", icon: CheckSquare, label: "할 일" },
  { path: "/calendar", icon: Calendar, label: "캘린더" },
  { path: "/stats", icon: PieChart, label: "통계" },
  { path: "/settings", icon: Settings, label: "설정" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }) => (
              <>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </motion.div>
                <span className={`text-xs ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
