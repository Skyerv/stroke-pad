// Self-hosted pixel fonts (bundled, so the app works offline).
import "@fontsource/pixelify-sans/400.css";
import "@fontsource/pixelify-sans/700.css";
import "@fontsource/silkscreen/400.css";
import "@fontsource/silkscreen/700.css";

import "./styles.css";
import { WebApp } from "./app.js";

const app = new WebApp(document);
app.initialize();
