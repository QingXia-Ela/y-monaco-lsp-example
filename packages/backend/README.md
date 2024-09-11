# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# bug 记录

当使用 bun 启动 y-websocket 服务器 (./node_modules/y-websocket/bin/server.cjs) 时，`utils.cjs` 文件下的 ping 会失效，必须得传输至少一个字节的数据才可以正常进行 ping pong (`connect.ping(0)`)，用 `bun y-websocket` 命令行启动不会有这样的 bug