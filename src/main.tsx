
  import '@splinetool/viewer'; 
  import '@google/model-viewer/dist/model-viewer.js'; // penting: file .js, bukan .min.js
  import { createRoot } from "react-dom/client";
  import App from "@/App";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  