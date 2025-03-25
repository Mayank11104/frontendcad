import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import shapeToUrl from "./shapeToUrl";
import initOpenCascade from "opencascade.js";
import "@google/model-viewer";
import Navbar from "./components/navbar";
import RightSidebar from "./components/rightsidebar";

function App() {
  const [modelUrl, setModelUrl] = useState(null);
  const ocRef = useRef(null);
  const modelRef = useRef(null);
  const [prompt, setPrompt] = useState("");
 

  /** ✅ Load and display a STEP file */
  const loadSTEPFile = useCallback(async (filePath, color = [1, 1, 1]) => {
    const oc = ocRef.current;
    if (!oc) {
      console.error("OpenCascade not initialized.");
      return;
    }
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      oc.FS.writeFile("/model.step", new Uint8Array(buffer));

      const reader = new oc.STEPControl_Reader_1();
      const readStatus = reader.ReadFile("/model.step");
      if (readStatus !== oc.IFSelect_ReturnStatus.IFSelect_RetDone) {
        throw new Error("Failed to read STEP file");
      }
      reader.TransferRoots(new oc.Message_ProgressRange_1());
      const shape = reader.OneShape();
      if (shape.IsNull()) {
        throw new Error("No valid shape found");
      }

      // ✅ Pass color to shapeToUrl
      const url = await shapeToUrl(oc, shape, color);
      setModelUrl(url);
      oc.FS.unlink("/model.step");
    } catch (error) {
      console.error("Error loading STEP file:", error);
    }
  }, []);

  /** ✅ Handle input commands */
  const handleSend = () => {
    if (prompt.trim().toLowerCase() === "load step file") {
      loadSTEPFile("/Cross Helical Gear ZH1-10 Assy.STEP", [0.9, 0.5, 0.1]); // Custom color
    }
    setPrompt(""); // Clear input
  };

  /** ✅ Initialize OpenCascade */
  useEffect(() => {
    initOpenCascade().then((oc) => {
      ocRef.current = oc;
    });
  }, []);

  return (
    <div className="App">
      <Navbar />
      {/* ✅ Pass setIsSidebarOpen to RightSidebar */}
      <RightSidebar />

      {/* Input Box for Commands */}
      <div className="prompt-input-container">
        <textarea
          className="prompt-input"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
        />
        <button className="send-btn" onClick={handleSend}>
          <img src="/icons/sendbutton/sendbutton.svg" alt="Send" />
        </button>
      </div>

      {/* ✅ Centered 3D Model Viewer Section */}
      <div
        style={{
          width: "1200px",
          height: "490px",
          margin: "95px auto",
          background: "#E2DFD2",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "auto",
          position: "relative",
          transition: "transform 0.3s ease-in-out", // ✅ Smooth animation
           // ✅ Shift left when sidebar opens
        }}
      >
        {/* ✅ Main 3D Model Viewer */}
        <model-viewer
          ref={modelRef}
          src={modelUrl}
          alt="3D Model"
          ar
          auto-rotate
          camera-controls
          shadow-intensity="1"
          exposure="1"
          interaction-prompt="none"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

export default App;
