import { Hocuspocus } from "@hocuspocus/server";
import * as Y from "yjs";

type NewServerType = Hocuspocus & { getYDoc: () => Y.Doc }

let cacheServer: NewServerType
export default function createHocuspocusServer(port: number) {
  // Configure the server …
  if (!cacheServer) {
    const server = new Hocuspocus({
      port,
    }) as NewServerType;

    // … and run it!
    server.listen();
    server.getYDoc = () => server.documents.get("")!
    cacheServer = server as NewServerType
  }

  return cacheServer
}