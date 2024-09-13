import { Elysia, t } from 'elysia'
import WebSocket from 'ws'
import fs from 'fs/promises'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { debounce } from 'lodash'

type WS = Parameters<Exclude<Parameters<Elysia['ws']>[1]['open'], undefined>>[0]
export function createWSProxy(
  ws: WS | any,
  target: string
) {
  const wss = new WebSocket(target)
  wss
    .on("close", ws.close)
    .on("message", ws.send)

  return wss
}

const debouceWriteFile = debounce(
  (path, data) => fs.writeFile(path, data), 2000
)

export function createLocalFileWritter(
  url: string,
  docName: string
) {
  const doc = new Y.Doc()
  // Use global only ID to prevent content repeat problem
  const provider = new WebsocketProvider(url, docName + '?name=localSaver' + `&ydocClientId=${doc.clientID}`, doc, {
    // @ts-ignore
    WebSocketPolyfill: WebSocket
  })
  fs.mkdir("./docs", { recursive: true })
  if (doc.getText().length === 0)
    fs.readFile(`./docs/${docName}.mdx`, 'utf-8').then((data) => {
      doc.getText().insert(0, data)
    })


  // doc.on("beforeTransaction", (t, doc) => {
  //   // console.log("afterTransaction");
  // })

  doc.on("afterTransaction", (t, doc) => {
    debouceWriteFile(`./docs/${docName}.mdx`, doc.getText().toJSON())
  })

  // doc.transact((t) => {
  //   console.log(t.l);
  // })
}

/*
export const setupWsConnection = (
  ws: WS,
  doc: Y.Doc
) => {
  return {
    message: (
      ws: WS,
      message: Uint8Array
    ) => {
      try {
        const encoder = encoding.createEncoder()
        const decoder = decoding.createDecoder(message)
        const messageType = decoding.readVarUint(decoder)

        switch (messageType) {
          case messageSync:
            encoding.writeVarUint(encoder, messageSync)
            syncProtocol.readSyncMessage(decoder, encoder, doc, ws)
    
            // If the `encoder` only contains the type of reply message and no
            // message, there is no need to send the message. When `encoder` only
            // contains the type of reply, its length is 1.
            if (encoding.length(encoder) > 1) {
              send(doc, ws, encoding.toUint8Array(encoder))
            }
            break
          case messageAwareness: {
            awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), conn)
            break
          }
        }
      } catch (e) {
        console.error(e)
        // @ts-ignore
        doc.emit('error', [e])
      }
    }
  }
}
*/