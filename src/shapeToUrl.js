// Takes a TopoDS_Shape, creates a GLB file from it and returns a ObjectURL
export default function shapeToUrl(oc, shape) {
  // Create a document and add our shape
  const docHandle = new oc.Handle_TDocStd_Document_2(new oc.TDocStd_Document(new oc.TCollection_ExtendedString_1()));
  const shapeTool = oc.XCAFDoc_DocumentTool.ShapeTool(docHandle.get().Main()).get();
  shapeTool.SetShape(shapeTool.NewShape(), shape);

  // Tell OpenCascade that we want our shape to get meshed
  new oc.BRepMesh_IncrementalMesh_2(shape, 0.1, false, 0.1, false);

  // Export a GLB file (this will also perform the meshing)
  const cafWriter = new oc.RWGltf_CafWriter(new oc.TCollection_AsciiString_2("./file.glb"), true);
  cafWriter.Perform_2(docHandle, new oc.TColStd_IndexedDataMapOfStringString_1(), new oc.Message_ProgressRange_1());

  // Read the GLB file from the virtual file system
  const glbFile = oc.FS.readFile("./file.glb", { encoding: "binary" });

  return URL.createObjectURL(new Blob([glbFile.buffer], { type: "model/gltf-binary" }));
};
export function addXYZAxes(oc, shape) {
  const makeLine = (start, end) => {
    const edge = new oc.BRepBuilderAPI_MakeEdge_2(
      new oc.gp_Pnt_3(start[0], start[1], start[2]),
      new oc.gp_Pnt_3(end[0], end[1], end[2])
    );
    return edge.Edge();
  };

  // ✅ Define X, Y, Z Axes (Red, Green, Blue)
  const xAxis = makeLine([0, 0, 0], [10, 0, 0]); // X-axis (Red)
  const yAxis = makeLine([0, 0, 0], [0, 10, 0]); // Y-axis (Green)
  const zAxis = makeLine([0, 0, 0], [0, 0, 10]); // Z-axis (Blue)

  // ✅ Create Compound Shape (Model + Axes)
  const compoundBuilder = new oc.BRep_Builder();
  const compoundShape = new oc.TopoDS_Compound();
  compoundBuilder.MakeCompound(compoundShape);

  compoundBuilder.Add(compoundShape, shape); // Add STEP model
  compoundBuilder.Add(compoundShape, xAxis);
  compoundBuilder.Add(compoundShape, yAxis);
  compoundBuilder.Add(compoundShape, zAxis);

  return compoundShape;
}
