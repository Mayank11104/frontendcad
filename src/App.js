import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import shapeToUrl from "./shapeToUrl";
import initOpenCascade from "opencascade.js";
import "@google/model-viewer";
import * as BABYLON from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";

import "@babylonjs/loaders";
import "@babylonjs/materials"; // for GridMaterial

import Navbar from "./components/navbar";
import RightSidebar from "./components/rightsidebar";

function App() {
  const [modelUrl, setModelUrl] = useState(null);
  const ocRef = useRef(null);
  const modelRef = useRef(null);
  const babylonCanvasRef = useRef(null);
  const [prompt, setPrompt] = useState("");

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

      const url = await shapeToUrl(oc, shape, color);
      setModelUrl(url);
      oc.FS.unlink("/model.step");
    } catch (error) {
      console.error("Error loading STEP file:", error);
    }
  }, []);

  useEffect(() => {
    initOpenCascade().then((oc) => {
      ocRef.current = oc;
    });
  }, []);

  useEffect(() => {
    const canvas = babylonCanvasRef.current;
    if (!canvas) return;

    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // transparent

    const camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,     // azimuth
      Math.PI / 2,     // polar (looking straight at vertical plane)
      30,
      new BABYLON.Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 100;

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    const gridMaterial = new GridMaterial("gridMaterial", scene);
    gridMaterial.gridRatio = 1;
    gridMaterial.majorUnitFrequency = 5;
    gridMaterial.minorUnitVisibility = 0.3;
    gridMaterial.mainColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    gridMaterial.lineColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    gridMaterial.opacity = 0.7;
    gridMaterial.backFaceCulling = false;

    const verticalGrid = BABYLON.MeshBuilder.CreatePlane("verticalGrid", {
      width: 100,
      height: 100,
    }, scene);
    verticalGrid.material = gridMaterial;
    verticalGrid.position.z = -5; // Push it behind the model
    verticalGrid.rotation.y = 0;  // facing forward

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => engine.resize());
    return () => engine.dispose();
  }, []);

  const handleSend = () => {
    if (prompt.trim().toLowerCase() === "load step file") {
      loadSTEPFile("/Cross Helical Gear ZH1-10 Assy.STEP",);
    }
    setPrompt("");
  };

  return (
    <div className="App">
      <Navbar />
      <RightSidebar />

      {/* Prompt Input Box */}
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

      {/* Main 3D Viewer with Grid */}
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
        }}
      >
        {/* Babylon Canvas */}
        <canvas
          ref={babylonCanvasRef}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        ></canvas>

        {/* Model Viewer */}
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
            position: "relative",
            zIndex: 1,
          }}
        />
      </div>
    </div>
  );
}

export default App;
