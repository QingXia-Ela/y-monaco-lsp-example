import * as monaco from 'monaco-editor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'

export default function injectYjsToEditor({
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
  editor: monaco.editor.IStandaloneCodeEditor,
  targetHost: string,
  roomName?: string,
  textID: string
}) {
  const ydoc = new Y.Doc()
  const type = ydoc.getText(textID)

  const provider = new WebsocketProvider(targetHost, roomName, ydoc)
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

  // disconnect first to prevent retry from reconnecting
  provider.disconnect()

  return {
    provider,
    monacoBinding
  }
}