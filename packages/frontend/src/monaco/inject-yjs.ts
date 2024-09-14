import * as monaco from 'monaco-editor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'

export default function injectYjsToEditor({
  name,
  editor,
  /**
   * Target host is the final url to connect with server.
   */
  targetHost,
  /**
   * Room name will append the value to target host.
   * 
   * If you don't want to use room name, leave it blank.
   */
  roomName = "",
  /**
   * Text target id.
   */
  textID
}: {
  name: string,
  editor: monaco.editor.IStandaloneCodeEditor,
  targetHost: string,
  roomName?: string,
  textID: string
}) {
  const ydoc = new Y.Doc()
  const type = ydoc.getText(textID)

  const provider = new WebsocketProvider(
    `${targetHost}`,
    roomName + `?name=${name}&ydocClientId=${ydoc.clientID}`,
    ydoc,
    {
      connect: false
    }
  )
  // provider.on("connection-error", () => {
  //   // disable auto reconnect
  //   provider.shouldConnect = false
  // })
  // provider.on("connection-close", () => {
  //   // disable auto reconnect
  //   provider.shouldConnect = false
  // })


  /** @see https://github.com/yjs/y-monaco/issues/6 */
  const newModel = monaco.editor.createModel("", "mdx");
  newModel.setEOL(0); // Sets EOL to \n
  editor.setModel(newModel); // Swap models

  const monacoBinding = new MonacoBinding(
    type,
    editor.getModel()!,
    new Set([editor]),
    provider.awareness
  )

  return {
    provider,
    monacoBinding
  }
}