import { useEffect, useState } from "react";
import axios from "axios";

const hoverStyle = `
  .bubble-item {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .bubble-item:hover {
    transform: scale(1.15) translateY(-5px);
    box-shadow: 0 15px 40px rgba(100, 150, 200, 0.3) !important;
    filter: brightness(1.1);
  }
  
  .bubble-item:hover .bubble-icon {
    transform: scale(1.2) rotate(5deg);
  }
`;

function Dashboard() {
  const [data, setData] = useState({});
  const [hoveredBubble, setHoveredBubble] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
    }

    axios.get("http://localhost:8000/dashboard", {
      params: { token }
    })
    .then(res => setData(res.data))
    .catch(() => alert("Unauthorized"));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      <style>{hoverStyle}</style>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <h2 style={{ marginBottom: "30px", fontSize: "20px", fontWeight: "700" }}>📊 Dashboard</h2>
        </div>

        <div style={styles.menuSection}>
          <p style={styles.menuLabel}>MAIN</p>
          <p style={{...styles.menu, ...(hoveredBubble === 'dashboard' && styles.menuHover)}}>🏠 Dashboard</p>
          <p style={{...styles.menu, ...(hoveredBubble === 'analytics' && styles.menuHover)}}>📈 Analytics</p>
          <p style={{...styles.menu, ...(hoveredBubble === 'servers' && styles.menuHover)}}>🖥️ Servers</p>
        </div>

        <div style={styles.menuSection}>
          <p style={styles.menuLabel}>SETTINGS</p>
          <p style={{...styles.menu, ...(hoveredBubble === 'users' && styles.menuHover)}}>👤 Users</p>
          <p style={{...styles.menu, ...(hoveredBubble === 'settings' && styles.menuHover)}}>⚙️ Settings</p>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* Navbar */}
        <div style={styles.navbar}>
          <div style={styles.navLeft}>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>Welcome back! 👋</h2>
            <p style={{ margin: "5px 0 0 0", fontSize: "12px", opacity: 0.6 }}>Monitor your system performance</p>
          </div>
          <div style={styles.navRight}>
            <div style={styles.searchBar}>
              <span style={{ marginRight: "8px" }}>🔍</span>
              <input type="text" placeholder="Search..." style={styles.searchInput} />
            </div>
            <button style={styles.notificationBtn}>🔔</button>
            <button onClick={logout} style={styles.logout}>Logout</button>
          </div>
        </div>

        {/* Bubble Grid */}
        <div style={styles.bubbleContainer}>
          <div 
            className="bubble-item"
            style={{...styles.bubble, background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"}}
            onMouseEnter={() => setHoveredBubble('users')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div style={styles.bubbleContent}>
              <div className="bubble-icon" style={styles.bubbleIcon}>👤</div>
              <h4 style={{margin: "2px 0 0 0", fontSize: "10px", fontWeight: "600"}}>Users</h4>
              <h1 style={{margin: "2px 0 0 0", fontSize: "14px"}}>{data.users}</h1>
            </div>
          </div>

          <div 
            className="bubble-item"
            style={{...styles.bubble, background:"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"}}
            onMouseEnter={() => setHoveredBubble('servers')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div style={styles.bubbleContent}>
              <div className="bubble-icon" style={styles.bubbleIcon}>🖥️</div>
              <h4 style={{margin: "2px 0 0 0", fontSize: "10px", fontWeight: "600"}}>Servers</h4>
              <h1 style={{margin: "2px 0 0 0", fontSize: "14px"}}>{data.servers}</h1>
            </div>
          </div>

          <div 
            className="bubble-item"
            style={{...styles.bubble, background:"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"}}
            onMouseEnter={() => setHoveredBubble('uptime')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div style={styles.bubbleContent}>
              <div className="bubble-icon" style={styles.bubbleIcon}>⏱️</div>
              <h4 style={{margin: "2px 0 0 0", fontSize: "10px", fontWeight: "600"}}>Uptime</h4>
              <h1 style={{margin: "2px 0 0 0", fontSize: "14px"}}>{data.uptime}</h1>
            </div>
          </div>

          <div 
            className="bubble-item"
            style={{...styles.bubble, background:"linear-gradient(135deg, #fa709a 0%, #fee140 100%)", color:"#000"}}
            onMouseEnter={() => setHoveredBubble('cpu')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div style={styles.bubbleContent}>
              <div className="bubble-icon" style={styles.bubbleIcon}>⚡</div>
              <h4 style={{margin: "2px 0 0 0", fontSize: "10px", fontWeight: "600"}}>CPU</h4>
              <h1 style={{margin: "2px 0 0 0", fontSize: "14px"}}>65%</h1>
            </div>
          </div>

          <div 
            className="bubble-item"
            style={{...styles.bubble, background:"linear-gradient(135deg, #30cfd0 0%, #330867 100%)"}}
            onMouseEnter={() => setHoveredBubble('memory')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div style={styles.bubbleContent}>
              <div className="bubble-icon" style={styles.bubbleIcon}>💾</div>
              <h4 style={{margin: "2px 0 0 0", fontSize: "10px", fontWeight: "600"}}>Memory</h4>
              <h1 style={{margin: "2px 0 0 0", fontSize: "14px"}}>8GB</h1>
            </div>
          </div>

          <div 
            className="bubble-item"
            style={{...styles.bubble, background:"linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", color:"#333"}}
            onMouseEnter={() => setHoveredBubble('requests')}
            onMouseLeave={() => setHoveredBubble(null)}
          >
            <div style={styles.bubbleContent}>
              <div className="bubble-icon" style={styles.bubbleIcon}>🔁</div>
              <h4 style={{margin: "2px 0 0 0", fontSize: "10px", fontWeight: "600"}}>Requests</h4>
              <h1 style={{margin: "2px 0 0 0", fontSize: "14px"}}>1.2K</h1>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div style={styles.activity}>
          <h3>Recent Activity</h3>
          <ul>
            <li>✅ Server deployed</li>
            <li>👤 New user registered</li>
            <li>⚙️ Settings updated</li>
            <li>🚀 App restarted</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    background: "linear-gradient(135deg, #e8f4f8, #d9ecf7)",
    color: "#1d1d1f"
  },
  sidebar: {
    width: "220px",
    background: "rgba(200, 230, 245, 0.6)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(100, 150, 200, 0.2)",
    padding: "20px",
    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.8)",
    overflowY: "auto"
  },
  logo: {
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(100, 150, 200, 0.2)"
  },
  menuSection: {
    marginBottom: "25px"
  },
  menuLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#5a7fa0",
    textTransform: "uppercase",
    margin: "15px 0 8px 0",
    letterSpacing: "0.5px"
  },
  menu: {
    margin: "10px 0",
    cursor: "pointer",
    opacity: 0.6,
    transition: "all 0.3s ease",
    padding: "10px 12px",
    borderRadius: "12px",
    color: "#2c5aa0",
    fontSize: "14px",
    fontWeight: "500"
  },
  menuHover: {
    opacity: 1,
    background: "rgba(100, 160, 220, 0.2)",
    transform: "translateX(5px)",
    backdropFilter: "blur(20px)",
    color: "#1a3f7f"
  },
  main: {
    flex: 1,
    padding: "20px"
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    background: "rgba(200, 230, 245, 0.5)",
    backdropFilter: "blur(20px)",
    padding: "20px 25px",
    borderRadius: "20px",
    border: "1px solid rgba(100, 150, 200, 0.2)",
    boxShadow: "0 8px 32px rgba(100, 150, 200, 0.1)",
    color: "#1d1d1f"
  },
  navLeft: {
    flex: 1
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "rgba(100, 160, 220, 0.15)",
    borderRadius: "25px",
    padding: "8px 15px",
    border: "1px solid rgba(100, 150, 200, 0.3)",
    transition: "all 0.3s ease"
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#1d1d1f",
    fontSize: "14px",
    width: "200px",
    fontFamily: "inherit"
  },
  notificationBtn: {
    background: "rgba(100, 160, 220, 0.15)",
    border: "1px solid rgba(100, 150, 200, 0.3)",
    borderRadius: "12px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s ease"
  },
  logout: {
    padding: "10px 20px",
    background: "rgba(100, 160, 220, 0.2)",
    backdropFilter: "blur(15px)",
    border: "1px solid rgba(100, 160, 220, 0.4)",
    borderRadius: "12px",
    color: "#2c5aa0",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(100, 160, 220, 0.15)"
  },
  bubbleContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
    gap: "30px",
    marginBottom: "40px"
  },
  bubble: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 8px 32px rgba(100, 150, 200, 0.15), inset 0 1px 0 0 rgba(255,255,255,0.4)",
    border: "1px solid rgba(200, 230, 245, 0.6)",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    background: "rgba(200, 230, 245, 0.5)"
  },
  bubbleContent: {
    textAlign: "center",
    transition: "all 0.3s ease",
    zIndex: 2,
    color: "#fff"
  },
  bubbleIcon: {
    fontSize: "20px",
    marginBottom: "4px",
    transition: "transform 0.3s ease"
  },
  activity: {
    marginTop: "30px",
    padding: "25px",
    background: "rgba(200, 230, 245, 0.5)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(100, 150, 200, 0.2)",
    boxShadow: "0 8px 32px rgba(100, 150, 200, 0.1), inset 0 1px 0 0 rgba(255,255,255,0.3)",
    color: "#1d1d1f"
  }
};

export default Dashboard;