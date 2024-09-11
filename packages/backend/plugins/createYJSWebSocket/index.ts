import Elysia, { t } from "elysia";
import WebSocket from 'ws'
import { createWSProxy } from "./utils";
import { createYJSServerByVanilla } from "./utils/createYjsServer/server.cjs";

const wssMap = new Map<string, WebSocket>()
const wssRawMap = new Map<any, string>()

// todo!: impl userId get
export default function createYJSWebSocket({
  yjsServerPort,
  serverPort,
}: {
  yjsServerPort: number
  serverPort: number
}) {
  // todo!: add program buffer send?
  createYJSServerByVanilla(yjsServerPort)
  return new Elysia()
    .ws('/yjs', {
      body: t.Uint8Array(),
      open(ws) {
        const wsProxy = createWSProxy(ws, `ws://localhost:${yjsServerPort}/yjs`)
        wssMap.set(ws.id, wsProxy)
      },
      message(ws, message) {
        wssMap.get(ws.id)?.send(message)
      },
      close(ws, code, message) {
        wssMap.get(ws.id)?.close(code, message)
        wssMap.delete(ws.id)
      },
    })
} 