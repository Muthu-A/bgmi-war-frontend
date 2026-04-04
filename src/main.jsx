import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Toaster } from "react-hot-toast";
import { SeasonProvider } from "./context/SeasonContext";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <StrictMode>
      <SeasonProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <App />
      </SeasonProvider>
    </StrictMode>
  </Provider>,
);
