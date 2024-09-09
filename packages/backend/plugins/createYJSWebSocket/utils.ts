import { Elysia, t } from 'elysia'
import WebSocket from 'ws'

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