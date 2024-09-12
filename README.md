# y-monaco-lsp-example

Still processing!

This is a yjs binding for monaco example, features is:

- [x] edit mdx
- [x] yjs binding
- [x] custom lsp support
- [x] use bun as backend
- [x] local file write
- [x] support user login
- [x] online user list

## Some unresolve problems

- LSP will have much instance instead of one instance and send same message to each client
  This may optimize in future?

## FAQ

Q: Does YJS clientID has possible conflict with other ID?
A: No, see [INTERNALS](https://github.com/yjs/yjs/blob/main/INTERNALS.md).

Q: If I have same name to connect with, what will happen?
A: Same name user can still operate like a new user, and it will use orange mark without name to show. This part should custom by yourself, do not copy the example.

## 其他内容

参考：https://docs.yjs.dev/api/about-awareness#awareness-protocol-api，可知假如一个客户端出现意外脱机而服务端没法感知时，30 秒后会将客户端标记为离线，但是光标在未标记期间会仍然滞留在其他客户机上。

感知数据在 `awareness.meta` 上，在源码中似乎这玩意是没有移除操作的，你可以考虑自己移除多余的客户端，但不保证这种操作是安全的！