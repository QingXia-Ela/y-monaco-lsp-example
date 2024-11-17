/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { UserConfig } from 'monaco-editor-wrapper';

export const createUserConfig = (workspaceRoot: string, code: string, codeUri: string): UserConfig => {
    return {
        languageClientConfig: {
            languageId: 'mdx',
            name: 'Mdx Language Server Example',
            options: {
                $type: 'WebSocket',
                host: 'localhost',
                port: 30002,
                path: 'grammar',
                extraParams: {
                    authorization: 'UserAuth'
                },
                secured: false,
                startOptions: {
                    onCall: () => { },
                    reportStatus: true,
                }
            },
            clientOptions: {
                documentSelector: ['mdx'],
                workspaceFolder: {
                    index: 0,
                    name: 'workspace',
                    uri: vscode.Uri.parse(workspaceRoot)
                },
            },
        },
        wrapperConfig: {
            serviceConfig: {
                userServices: {
                    // ...getEditorServiceOverride(useOpenEditorStub)
                },
                debugLogging: true
            },
            editorAppConfig: {
                $type: 'extended',
                codeResources: {
                    main: {
                        text: code,
                        uri: codeUri
                    }
                },
                userConfiguration: {
                    json: JSON.stringify({
                        'workbench.colorTheme': 'Default Dark Modern',
                        'editor.guides.bracketPairsHorizontal': 'active',
                        'editor.wordBasedSuggestions': 'off'
                    })
                },
                useDiffEditor: false
            }
        },
        loggerConfig: {
            enabled: true,
            debugEnabled: true
        }
    };
};
