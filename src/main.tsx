import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from "@capacitor/core";

// Tag the document so CSS can target the native shell (e.g. disable
// long-press text selection during prayer). Safe on web — Capacitor.isNativePlatform()
// returns false there.
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("native-app");
  document.documentElement.classList.add(`platform-${Capacitor.getPlatform()}`);
}

createRoot(document.getElementById("root")!).render(<App />);
