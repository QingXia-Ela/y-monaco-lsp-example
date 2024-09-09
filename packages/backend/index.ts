import Elysia from "elysia";
import { WebSocketMessageReader, type IWebSocket, WebSocketMessageWriter } from "vscode-ws-jsonrpc";
import { createServerProcess, createConnection, forward } from 'vscode-ws-jsonrpc/server'
import { Message, InitializeRequest, type InitializeParams } from 'vscode-languageserver';

function launchLanguageServer(socket: IWebSocket) {
  const reader = new WebSocketMessageReader(socket);
  const writer = new WebSocketMessageWriter(socket);
  const socketConnection = createConnection(reader, writer, () => socket.dispose());
  const serverConnection = createServerProcess("114514", `bun`, [`run`, `../language-server/index.ts`, '--stdio']);

  if (serverConnection) {
    forward(socketConnection, serverConnection, message => {
      if (Message.isRequest(message)) {
        console.log(`Server received:`);
        console.log(message);
        if (message.method === InitializeRequest.type.method) {
          const initializeParams = message.params as InitializeParams;
          initializeParams.processId = process.pid;
        }
      }
      if (Message.isResponse(message)) {
        console.log(`Server sent:`);
        console.log(message);
      }
      return message;
    });
  }
}

let socketFnMap: Record<string, any> = {}

const app = new Elysia();

app
  .get("/", () => "Hello World!")
  .ws("/grammar", {
    error: (e) => {
      socketFnMap["onError"]?.(e)
    },
    open(ws) {
      const socket: IWebSocket = {
        send(content) {
          ws.send(content)
        },
        onMessage(cb) {
          // process.nextTick(() => cb("hello from server"))
          socketFnMap["onMessage"] = (data: any) => {
            // We must parse it to JSON, because the package inner only receive the string, but elysia provide parsed object.
            cb(JSON.stringify(data))
          }
        },
        onError(cb) {
          socketFnMap["onError"] = (reason: any) => {
            cb(JSON.stringify(reason))
          }
        },
        onClose(cb) {
          socketFnMap["onClose"] = cb
        },
        dispose() {
          ws.close()
        },
      };
      launchLanguageServer(socket)
    },
    close(ws, code, message) {
      socketFnMap["onClose"]?.(code, message)
    },
    message(ws, message) {
      socketFnMap["onMessage"]?.(message)
    }
  })
  .listen(30002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
