import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import "./rightsidebar.css";

const RightSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gdNavbarOpen, setGdNavbarOpen] = useState(false);
  const [cmeNavbarOpen, setCmeNavbarOpen] = useState(false);
  const [abcNavbarOpen, setAbcNavbarOpen] = useState(false);
  
  

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setSidebarOpen(!sidebarOpen);
  };

  const toggleGdNavbar = () => {
    setGdNavbarOpen(!gdNavbarOpen);
  };

  const toggleCmeNavbar = () => {
    setCmeNavbarOpen(!cmeNavbarOpen);
  };

  const toggleAbcNavbar = () => {
    setAbcNavbarOpen(!abcNavbarOpen);
  };
  
 

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button className="right-sidebar-toggle" onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Permanent Sidebar */}
      <div className="permanent-right-sidebar">
        <div className="sidebar-buttons">
          <button className="sidebar-btn" onClick={toggleGdNavbar}>GD&T</button>
          <button className="sidebar-btn" onClick={toggleCmeNavbar}>FBM</button>
          <button className="sidebar-btn" onClick={toggleAbcNavbar}>CAE</button>
        </div>
      </div>

      {/* Toggleable Right Sidebar */}
      <div className={`right-sidebar ${sidebarOpen ? "open" : "closed"}`} onClick={(e) => e.stopPropagation()}>
        {/* Prompt Input Box */}
        
      </div>

      {/* GD&T Navbar */}
      <div className={`gd-navbar ${gdNavbarOpen ? "nav-open" : "nav-closed"}`}>
        <button className="close-nav-btn" onClick={toggleGdNavbar}>×</button>
        <h3>GD&T Menu</h3>
        {/* Add Content Here */}
      </div>

      {/* CME Navbar */}
      <div className={`cme-navbar ${cmeNavbarOpen ? "nav-open" : "nav-closed"}`}>
        <button className="close-nav-btn" onClick={toggleCmeNavbar}>×</button>
        <h3>FBM Menu</h3>
        {/* Add Content Here */}
      </div>

      {/* ABC Navbar */}
      <div className={`abc-navbar ${abcNavbarOpen ? "nav-open" : "nav-closed"}`}>
        <button className="close-nav-btn" onClick={toggleAbcNavbar}>×</button>
        <h3>CAE Menu</h3>
        {/* Add Content Here */}
      </div>
    </>
  );
};

export default RightSidebar;
