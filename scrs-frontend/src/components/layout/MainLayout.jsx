import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import useAuth from "../../hooks/useAuth";

const MainLayout = () => {
  const { user } = useAuth();
  
  if (!user) return <Outlet />;

  return (
    <div style={styles.layout}>
      <Navbar />
      <div style={styles.container}>
        <Sidebar />
        <main style={styles.mainContent}>
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
