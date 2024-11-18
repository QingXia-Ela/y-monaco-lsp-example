/**
 * @deprecated - use is difficult
 */

/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
// import '../assets/vsix/unifiedjs.vscode-mdx-1.8.10.vsix'
// import * as monaco from 'monaco-editor';
// import { initServices } from 'monaco-languageclient/vscode/services';
// monaco-editor does not supply mdx highlighting with the mdx worker,
// that's why we use the textmate extension from VSCode
// import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
// import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
// import '@codingame/monaco-vscode-theme-defaults-default-extension';
// import '@codingame/monaco-vscode-mdx-default-extension';
// import { MonacoLanguageClient } from 'monaco-languageclient';
// import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
// import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
// import { RegisteredFileSystemProvider, registerFileSystemOverlay, RegisteredMemoryFile } from '@codingame/monaco-vscode-files-service-override';


// import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
// this is required syntax highlighting
// import '@codingame/monaco-vscode-json-default-extension';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
export const configureMonacoWorkers = () => {
    // override the worker factory with your own direct definition
    useWorkerFactory({
        ignoreMapping: true,
        workerLoaders: {
            editorWorkerService: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' })
        },
    });
};

const text = `## Hello world\n\n<Formula />`;

export const mdxClientUserConfig: UserConfig = {
    wrapperConfig: {
        serviceConfig: {
            userServices: {
                // ...getKeybindingsServiceOverride(),
            },
            debugLogging: true
        },
        editorAppConfig: {
            $type: 'extended',
            codeResources: {
                main: {
                    text,
                    fileExt: 'mdx'
                }
            },
            useDiffEditor: false,
            userConfiguration: {
                // json: JSON.stringify({
                //     'workbench.colorTheme': 'Default Dark Modern',
                //     'editor.guides.bracketPairsHorizontal': 'active',
                //     'editor.lightbulb.enabled': 'On',
                //     'editor.wordBasedSuggestions': 'off'
                // })
            }
        }
    },
    languageClientConfig: {
        languageId: 'mdx',
        options: {
            $type: 'WebSocketUrl',
            url: 'ws://localhost:30002/grammar',
            startOptions: {
                onCall: () => {
                    console.log('Connected to socket.');
                },
                reportStatus: true
            },
            stopOptions: {
                onCall: () => {
                    console.log('Disconnected from socket.');
                },
                reportStatus: true
            }
        },
    }
};

export const runClient = async () => {
    const wrapper = new MonacoEditorLanguageClientWrapper();
    const htmlElement = document.getElementById('monaco')!;

    try {
        // document.querySelector('#button-start')?.addEventListener('click', async () => {
        await wrapper.dispose();
        await wrapper.initAndStart(mdxClientUserConfig, htmlElement);
        // monaco.languages.registerTokensProviderFactory
        // });
        // document.querySelector('#button-dispose')?.addEventListener('click', async () => {
        //     await wrapper.dispose();
        // });
    } catch (e) {
        console.error(e);
    }

    return wrapper;
};

/**
 * 
 * @deprecated old code
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
            userServices: {},
            debugLogging: true,
        },
        performChecks() {
            return false
        },
    })
    // register the mdx language with Monaco
    monaco.languages.register({
        id: 'mdx',
        extensions: ['.mdx', '.md'],
        aliases: ['MDX', 'mdx']
    });

    // create monaco editor
    monaco.editor.create(document.getElementById('monaco')!, {
        value: `### Hello World`,
        language: 'mdx',
        automaticLayout: true,
        theme: 'vs-dark',
        wordBasedSuggestions: 'off'
    });
    initWebSocketAndStartClient('ws://localhost:30002/grammar');
};

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
*/