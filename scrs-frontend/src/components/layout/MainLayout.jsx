import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";

const MainLayout = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (!user) return <Outlet />;

  return (
    <div style={styles.layout}>
      <Navbar />
      <div style={styles.container}>
        <Sidebar isOpen={isSidebarOpen} />
        
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
        
        <main className="main-content-layout" style={styles.mainContent}>
          <Outlet />
        </main>
        
        <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? "✕" : "☰"}
        </button>
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
    marginTop: "var(--height-navbar)", // space for navbar
  },
  mainContent: {
    flex: 1,
    marginLeft: "var(--width-sidebar)", // space for sidebar
    padding: "2rem",
    width: "calc(100% - var(--width-sidebar))",
    boxSizing: "border-box",
    minHeight: "calc(100vh - var(--height-navbar))"
  }
};

export default MainLayout;
