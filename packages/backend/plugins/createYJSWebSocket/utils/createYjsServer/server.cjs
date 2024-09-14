#!/usr/bin / env node
/**
 * @file https://github.com/yjs/y-websocket/blob/main/bin/server.cjs
 */

import WebSocket from 'ws'
import http from 'http'
import { setupWSConnection } from './utils.cjs'

const host = process.env.HOST || 'localhost'

/**
 * @typedef {import('http').Server} Server
 */

/** @type {Server & {getYDoc: () => import('yjs').Doc | null}} */
let cacheServer = null

/**
 * Create a Yjs server by vanilla http server.
 *
 * @param {number} [port=1234] The port number to listen on.
 * @param {function(import('http').IncomingMessage): boolean} [authFn] A function that checks if the
 *   request is allowed to connect to the server. If the function returns false,
 *   the connection is closed.
 * @returns {Server & {getYDoc: () => import('yjs').Doc | null}} The created http server.
 */
function createYJSServerByVanilla(
  port = 1234,
  authFn = () => true
) {
  if (!cacheServer) {
    const wss = new WebSocket.Server({ noServer: true })

    const server = http.createServer((_request, response) => {
      // Send a simple "okay" response to GET requests.
      // This is to prevent the http server from sending a 404 response to the
      // browser when it tries to connect to the websocket server.
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end('okay')
    })

    server.getYDoc = () => null

    // Set up the websocket connection.
    wss.on('connection', (...args) => {
      const { doc } = setupWSConnection(...args)
      // if don't clean awareness client which doesn't has long time login, it may lead to oom
      doc.on("update", () => {
        console.log(Array.from(doc.awareness.meta.keys()));
      })
      server.getYDoc = () => doc
    })

    // Handle upgrade requests (i.e. websocket connections).
    server.on('upgrade', (request, socket, head) => {
      // Check if the request is allowed to connect.
      if (!authFn(request)) {
        // If not, close the connection.
        socket.destroy()
        return
      }

      // Otherwise, handle the upgrade request.
      wss.handleUpgrade(request, socket, head, /** @param {any} ws */ ws => {
        // Emit a connection event.
        wss.emit('connection', ws, request)
      })
    })

    // Start the server.
    server.listen(port, host, () => {
      console.log(`running at '${host}' on port ${port}`)
    })

    // Cache the server for later use.
    cacheServer = server
  }

  // Return the cached server.
  return cacheServer
}

export {
  createYJSServerByVanilla
}