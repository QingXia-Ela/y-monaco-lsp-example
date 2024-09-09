import Elysia, { t } from "elysia";
import { } from 'y-websocket'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import cp from 'node:child_process'
import WebSocket from 'ws'
import { createWSProxy } from "./utils";

const doc = new Y.Doc()

function createYjsServer(port: number) {
  return cp.exec(`set PORT=${port} && node ./node_modules/y-websocket/bin/server.cjs`)
}

const wssMap = new Map<string, WebSocket>()

export default function createYJSWebSocket({
  yjsServerPort,
  serverPort,
}: {
  yjsServerPort: number
  serverPort: number
}) {
  const cp = createYjsServer(yjsServerPort)

  return new Elysia()
    .ws('/yjs', {
      body: t.Uint8Array(),
      open(ws) {
        wssMap.set(ws.id, createWSProxy(ws, `ws://localhost:${yjsServerPort}/yjs`))
      },
      message(ws, message) {
        wssMap.get(ws.id)?.send(message)
      },
      close(ws, code, message) {
        wssMap.get(ws.id)?.close(code, message)
      }
    })
    .onStart(() => {
      // create file save listener
      setTimeout(() => {
        const wsProvider = new WebsocketProvider(`ws://localhost:${serverPort}`, 'yjs', doc)

        wsProvider.on('sync', () => {
          console.log(doc.getText("monaco").toJSON());
        })
      });
    })
}