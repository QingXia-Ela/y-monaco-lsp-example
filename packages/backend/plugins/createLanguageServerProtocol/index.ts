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
        if (message.method === InitializeRequest.type.method) {
          const initializeParams = message.params as InitializeParams;
          initializeParams.processId = process.pid;
        }
      }
      if (Message.isResponse(message)) {
      }
      return message;
    });
  }
}


let socketFnMap: Record<string, Record<string, any>> = {}

export default function createLanguageServerProtocol() {
  return new Elysia()
    .ws("/grammar", {
      error: (e) => {
        // socketFnMap[ws.id]["onError"]?.(e)
      },
      open(ws) {
        socketFnMap[ws.id] = {}
        const socket: IWebSocket = {
          send(content) {
            ws.send(content)
          },
          onMessage(cb) {
            // process.nextTick(() => cb("hello from server"))
            socketFnMap[ws.id]["onMessage"] = (data: any) => {
              // We must parse it to JSON, because the package inner only receive the string, but elysia provide parsed object.
              cb(JSON.stringify(data))
            }
          },
          onError(cb) {
            socketFnMap[ws.id]["onError"] = (reason: any) => {
              cb(JSON.stringify(reason))
            }
          },
          onClose(cb) {
            socketFnMap[ws.id]["onClose"] = cb
          },
          dispose() {
            ws.close()
            socketFnMap[ws.id] = {}
          },
        };
        launchLanguageServer(socket)
      },
      close(ws, code, message) {
        socketFnMap[ws.id]["onClose"]?.(code, message)
        socketFnMap[ws.id] = {}
      },
      message(ws, message) {
        socketFnMap[ws.id]["onMessage"]?.(message)
      }
    })
}