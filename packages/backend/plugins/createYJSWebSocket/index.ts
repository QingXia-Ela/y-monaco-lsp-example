import Elysia, { t } from "elysia";
import WebSocket from 'ws'
import { createLocalFileWritter, createWSProxy } from "./utils";
import { createYJSServerByVanilla } from "./utils/createYjsServer/server.cjs";
import { logger } from "./logger";

const wssMap = new Map<string, WebSocket>()

/** 
 * name as unique id
 * 
 * one user can have multi connect
 */
const userMap = new Map<string, Array<{ name: string; socketId: string; ydocClientId: string }>>()

// todo!: impl userId get
export default function createYJSWebSocket({
  yjsServerPort,
  serverPort,
}: {
  yjsServerPort: number
  serverPort: number
}) {
  // todo!: add program buffer send?
  const server = createYJSServerByVanilla(yjsServerPort)
  createLocalFileWritter(`ws://localhost:${serverPort}`, 'yjs')
  return new Elysia()
    // we don't suggest use polling to update user
    .onAfterHandle(({ set }) => {
      set.headers['Access-Control-Allow-Origin'] = '*';
    })
    .get("/users", () => {
      return Array.from(userMap.values()).flat(2).filter((item) => item.name !== "localSaver")
    })
    .get("/serverCid", () => server.getYDoc()?.clientID || null)
    .get("/doc", () => Bun.file("./docs/yjs.mdx"))
    .ws('/yjs', {
      body: t.Uint8Array(),
      query: t.Object({
        name: t.String(),
        // also can be number
        ydocClientId: t.String(),
      }),
      open(ws) {
        const { data: { query: { name, ydocClientId } } } = ws
        const wsProxy = createWSProxy(ws, `ws://localhost:${yjsServerPort}/yjs`)
        wssMap.set(ws.id, wsProxy)
        logger('open', name, ydocClientId);

        if (!userMap.has(name)) {
          userMap.set(name, [])
        }
        userMap.get(name)?.push({
          name,
          socketId: ws.id,
          ydocClientId,
        })
      },
      message(ws, message) {
        wssMap.get(ws.id)?.send(message)
      },
      close(ws, code, message) {
        const { data: { query: { name, ydocClientId } } } = ws
        logger('close', name, ydocClientId);

        wssMap.get(ws.id)?.close(code, message)
        wssMap.delete(ws.id)
        const target = userMap.get(name)
        if (target) {
          const index = target.findIndex((item) => item.ydocClientId === ydocClientId)
          if (index !== -1) target.splice(index, 1)
        }
      },
    })
} 