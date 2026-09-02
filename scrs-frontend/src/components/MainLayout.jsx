import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../context";

const MainLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return <Outlet />;

  return (
    <div style={styles.layout}>
      <Navbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
      <div style={styles.container}>
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(prev => !prev)}
        />

        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}

        <main
          className="main-content-layout"
          style={{
            ...styles.mainContent,
            marginLeft: isCollapsed ? "var(--width-sidebar-collapsed)" : "var(--width-sidebar)",
            width: `calc(100% - ${isCollapsed ? "var(--width-sidebar-collapsed)" : "var(--width-sidebar)"})`,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "var(--bg-app)",
  },
  container: {
    display: "flex",
    flex: 1,
    marginTop: "var(--height-navbar)",
  },
  mainContent: {
    flex: 1,
    padding: "1.75rem 2rem",
    boxSizing: "border-box",
    minHeight: "calc(100vh - var(--height-navbar))",
    transition: "margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
  }
};

export default MainLayout;
