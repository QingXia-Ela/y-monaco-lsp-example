import Elysia from "elysia";
import createYJSWebSocket from "./plugins/createYJSWebSocket";
import createLanguageServerProtocol from "./plugins/createLanguageServerProtocol";

const app = new Elysia();

app
  .get("/", () => "Hello World!")
  .use(createYJSWebSocket({
    yjsServerPort: 1234,
    serverPort: 30002
  }))
  .use(createLanguageServerProtocol())
  .listen(30002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
