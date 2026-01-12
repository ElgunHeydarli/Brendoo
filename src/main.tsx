import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { MagnifierProvider } from "./hooks/useShowMagnify";
import { CollectionModalProvider } from "./contexts/CollectionModalProvider";

import PortalComponent from "./PortalComponent";
import PortalComponentTwo from "./PortalComponentTwo";
import ScrollToTopButton from "./ScrollToTopButton";
import TopHeader from "./TopHeader";

// ✅ Google Translate və digər xarici kitabxana xətalarını tut
window.addEventListener('error', (event) => {
  // Google Translate xətalarını sustur
  if (event.message?.includes('license') || 
      event.message?.includes('Cannot set properties of undefined') ||
      event.message?.includes('Cannot read properties of null') ||
      event.filename?.includes('translate.google') ||
      event.filename?.includes('gtranslate')) {
    event.preventDefault();
    console.warn('[Google Translate Error suppressed]:', event.message);
    return true;
  }
});

// ✅ Unhandled Promise rejection-ları tut
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('chrome-extension') ||
      event.reason?.message?.includes('Cache') ||
      event.reason?.message?.includes('license')) {
    event.preventDefault();
    console.warn('[Extension/Cache Error suppressed]:', event.reason?.message);
  }
});

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
    <BrowserRouter>
        <MagnifierProvider>
            <CollectionModalProvider>
                {/* Portallar */}
                <PortalComponent>
                    <ScrollToTopButton />
                </PortalComponent>
                <PortalComponentTwo>
                    <TopHeader />
                </PortalComponentTwo>

                {/* Əsas app */}
                <App />
            </CollectionModalProvider>
        </MagnifierProvider>
    </BrowserRouter>
);
