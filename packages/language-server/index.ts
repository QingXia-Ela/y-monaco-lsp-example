import { createServer, createConnection, createTypeScriptProjectProviderFactory, Diagnostic, loadTsdkByPath } from '@volar/language-server/node';
import { createMdxLanguagePlugin, createMdxServicePlugin } from '@mdx-js/language-service';

const connection = createConnection();
const server = createServer(connection)

connection.onInitialize(async params => {
  const tsdkPath: string = params.initializationOptions?.typescript.tsdk || ``
  const tsdk = loadTsdkByPath(
    tsdkPath,
    params.locale
  );
  return server.initialize(
    params,
    createTypeScriptProjectProviderFactory(tsdk.typescript, tsdk.diagnosticMessages),
    {
      getLanguagePlugins() {
        return [
          createMdxLanguagePlugin(),
        ];
      },
      getServicePlugins() {
        return [
          createMdxServicePlugin()
        ];
      },
    }
  )
})

connection.onInitialized(server.initialized);

connection.onShutdown(server.shutdown);

connection.listen();
