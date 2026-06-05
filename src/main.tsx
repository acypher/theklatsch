
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { consumeForcedReload } from './lib/hardNavigate'

// Set the default document title
document.title = "The Klatsch";

if (consumeForcedReload()) {
  window.location.reload();
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
