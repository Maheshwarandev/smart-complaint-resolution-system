import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <i className="ti ti-alert-triangle" style={styles.icon} />
            </div>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.desc}>
              An unexpected error occurred. This has been logged automatically.
            </p>
            {this.state.error && (
              <pre style={styles.errorBox}>
                {this.state.error.message || "Unknown error"}
              </pre>
            )}
            <button className="btn-primary" style={styles.btn} onClick={this.handleReload}>
              <i className="ti ti-refresh" style={{ marginRight: "6px" }} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-base)",
    padding: "24px",
  },
  card: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-xl)",
    padding: "48px 40px",
    maxWidth: "440px",
    width: "100%",
    textAlign: "center",
    boxSizing: "border-box",
  },
  iconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "var(--urgent-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  icon: {
    fontSize: "28px",
    color: "var(--urgent)",
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "var(--text-primary)",
    margin: "0 0 8px",
  },
  desc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    margin: "0 0 20px",
    lineHeight: "1.5",
  },
  errorBox: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "12px",
    fontSize: "12px",
    color: "var(--urgent)",
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: "left",
    overflow: "auto",
    maxHeight: "120px",
    marginBottom: "20px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  btn: {
    height: "40px",
    fontSize: "13px",
    padding: "0 24px",
  },
};

export default ErrorBoundary;
