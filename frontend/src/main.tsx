import { render } from "preact";
import { App } from "@/App";
import { bootstrapApp } from "@/bootstrap/app.bootstrap";

bootstrapApp();

render(<App />, document.getElementById("app") as HTMLElement);
