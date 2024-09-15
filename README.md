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

## Environment

- Bun - v1.1.17
- pnpm - v8.6.12

## Some unresolve problems

- LSP will have much instance instead of one instance and send same message to each client
  This may optimize in future?

## FAQ

Q: Does YJS clientID has possible conflict with other ID?
A: No, see [INTERNALS](https://github.com/yjs/yjs/blob/main/INTERNALS.md).

Q: If I have same name to connect with, what will happen?
A: Same name user can still operate like a new user, and it will use orange mark without name to show. This part should custom by yourself, do not copy the example.

## 其他内容

### 光标滞留

参考：https://docs.yjs.dev/api/about-awareness#awareness-protocol-api 可知假如一个客户端出现意外脱机而服务端没法感知时，30 秒后会将客户端标记为离线，但是光标在未标记期间会仍然滞留在其他客户机上。

感知数据在 `awareness.meta` 上，在源码中似乎这玩意是没有移除操作的，你可以考虑自己移除多余的客户端，但不保证这种操作是安全的！

### 服务器与客户端内容同步解决方案

只有一个场景需要进行解决，那就是：服务端在拥有内容 + 无客户端连接上下文历史的时候，一个新客户端在有内容的情况下连入服务端，这导致内容重复的发生。

这种场景发生于在客户端有内容的时候服务端宕机，服务端重启后由于失去了之前所有的感知状态，因此会将所有客户端的新内容在源文件末尾上进行追加。

服务端宕机概率非常小，但不是没有。

目前解决的可能方案：
- 禁用服务器宕机时的编辑操作（这是成本最低的管理方案，唯一要处理的就是如何确定服务器真宕机了），假如离线编辑时页面发生了刷新操作，则页面在刷新之前需要保留自己的 clientID，来保证恢复编辑路径。假如 clientID 丢失，则执行下面的 diff 操作（最坏情况）
- 使用类似 git 的 diff 算法，在客户端连接时进行一次 diff 并重新修改结果（大文件和非纯文本效率低）
- 保存 Yjs doc 上下文（无现成解决方案）

本示例实现的是由客户端自动处理 diff 再同步回服务端的实现，不建议生产环境下直接使用。

### 高性能与Benchmark

参考文章：https://github.com/pubuzhixing8/awesome-collaboration/blob/master/crdt/yjs/are-crdts-suitable-for-shared-editing.md

### yjs 数据结构以及协议传输内容

https://mp.weixin.qq.com/s/cHqXWL54TKSQjL33JSGQ_w - 这篇文章比较草率，细节不是很丰富，但是了解底层基本数据结构还是没问题的

