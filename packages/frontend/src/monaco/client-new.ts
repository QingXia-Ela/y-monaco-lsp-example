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
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
import { conf, language } from 'monaco-editor-vanilla/esm/vs/basic-languages/mdx/mdx';
import injectYjsToEditor from './inject-yjs';

export const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
    }
  });
};
export const runClient = async () => {
  await initServices({
    serviceConfig: {
      userServices: {
        // ...getThemeServiceOverride(),
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
  initWebSocketAndStartClient('ws://localhost:30002/grammar');
  const {
    provider,
  } = injectYjsToEditor({
    editor,
    targetHost: 'ws://localhost:30002/yjs',
    textID: 'monaco'
  })

  return {
    provider
  }
};

/** parameterized version , support all languageId */
export const initWebSocketAndStartClient = (url: string): WebSocket => {
  const webSocket = new WebSocket(url);
  webSocket.onopen = () => {
    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient({
      reader,
      writer
    });
    languageClient.start();
    reader.onClose(() => languageClient.stop());
  };
  return webSocket;
};

export const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
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
      get: () => {
        return Promise.resolve(transports);
      }
    }
  });
};
