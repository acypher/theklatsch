
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the default document title
document.title = "The Klatsch";

createRoot(document.getElementById("root")!).render(<App />);
