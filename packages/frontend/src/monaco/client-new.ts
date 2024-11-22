/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as monaco from 'monaco-editor';
import { initServices } from 'monaco-languageclient/vscode/services';
// monaco-editor does not supply mdx highlighting with the mdx worker,
// that's why we use the textmate extension from VSCode
// import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
// import '@codingame/monaco-vscode-theme-defaults-default-extension';
// import '@codingame/monaco-vscode-mdx-default-extension';
import { MonacoLanguageClient } from 'monaco-languageclient';
import {  WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { conf, language } from 'monaco-editor-vanilla/esm/vs/basic-languages/mdx/mdx';
import injectYjsToEditor from './inject-yjs';
import mergeText from './utils/mergeText';
import { UndoManager } from 'yjs';

export const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
    }
  });
};
export const runClient = async ({
  name,
  yjsHost,
  lspHost,
}: { name: string, yjsHost: string, lspHost: string }) => {
  await initServices({
    serviceConfig: {
      userServices: {
        ...getTextmateServiceOverride(),
      },
      debugLogging: true,
    }
  });

  // register the mdx language with Monaco
  monaco.languages.register({
    id: 'mdx',
    extensions: ['.mdx', '.md'],
    aliases: ['MDX', 'mdx']
  });
  monaco.languages.setLanguageConfiguration('mdx', conf);
  monaco.languages.setMonarchTokensProvider('mdx', language);

  // create monaco editor
  const editor = monaco.editor.create(document.getElementById('monaco')!, {
    value: `### Hello World`,
    language: 'mdx',
    automaticLayout: true,
    theme: 'vs-dark',
    wordBasedSuggestions: 'off'
  });
  const languageClient = initWebSocketAndStartClient(lspHost);

  const {
    provider,
    monacoBinding,
  } = injectYjsToEditor({
    name,
    editor,
    targetHost: yjsHost,
    textID: '',
  })
  const text = provider.doc.getText()

  // todo!: composition input interrupt prevent

  const undoManager = new UndoManager(text, {
    trackedOrigins: new Set([monacoBinding]),
  })

  // register undo/redo
    editor.addAction({
      id: 'yjsUndo',
      label: 'yjsUndo',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ],
      run: (editor) => {
        editor.pushUndoStop()
        undoManager.undo()
        console.log('undo');
      }
    })
    editor.addAction({
      id: 'yjsRedo',
      label: 'yjsRedo',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyY],
      run: (editor) => {
        editor.pushUndoStop()
        undoManager.redo()
        console.log('redo');
      }
    })

  provider.on("status", ({ status }: { status: string }) => {
    if (status === "connected") {
      const oldText = text.toJSON()
      provider.doc.once("afterAllTransactions", () => {

        text.delete(0, oldText.length)
        const newText = text.toJSON()
        const merge = mergeText(oldText, newText)
        console.log({
          merge,
          oldText,
          newText
        });

        editor.setValue(merge)
      })
    }
  })

  return {
    languageClient,
    provider,
    editor
  }
};

const getLspWebsocket = (url: string) => {
  return new Promise<{
    socket: WebSocket,
    reader: WebSocketMessageReader,
    writer: WebSocketMessageWriter
  }>((resolve, reject) => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = () => {
      const socket = toSocket(webSocket);
      const reader = new WebSocketMessageReader(socket);
      const writer = new WebSocketMessageWriter(socket);
      resolve({
        socket: webSocket,
        reader,
        writer
      })
    }

    webSocket.onerror = reject
  })
}

/** parameterized version , support all languageId */
const initWebSocketAndStartClient = (url: string) => {
  const languageClient = createLanguageClient(() => getLspWebsocket(url));
  return languageClient
};

export const createLanguageClient = (transportsGetter: () => Promise<MessageTransports>): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: 'Sample Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['mdx'],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart })
      }
    },
    // create a language client connection from the mdx RPC connection on demand
    connectionProvider: {
      get: async () => {
        return await transportsGetter();
      },
    }
  });
};
