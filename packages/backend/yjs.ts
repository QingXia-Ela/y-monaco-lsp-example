import Elysia from "elysia";
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import ws from 'ws'

const doc = new Y.Doc()
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'monaco', doc, {
  WebSocketPolyfill: ws
})

wsProvider.on('status', (event: any) => {
  console.log(event.status) // logs "connected" or "disconnected"
})

wsProvider.on('sync', (event: any) => {
  console.log(doc.getText('monaco').toJSON()) // logs "Hello, Yjs!"
})