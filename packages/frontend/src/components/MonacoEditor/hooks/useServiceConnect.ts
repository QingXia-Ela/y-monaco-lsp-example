import { Ref, onBeforeUnmount, ref, watch } from 'vue'
import { WebsocketProvider } from 'y-websocket'
import { configureMonacoWorkers, runClient } from '../../../monaco/client-new'
import { MonacoLanguageClient } from 'monaco-languageclient'
import updateConnectorStyle from '../../../monaco/utils/updateConnectorStyle'
import { State } from 'vscode-languageclient'

interface UserInfo {
  name: string
  socketId: string
  ydocClientId: string
}

async function updateUserList() {
  const res = await (await fetch('http://localhost:30002/users')).json() as Array<UserInfo>

  return res
}

export function useServiceConnect(
  name: Ref<string>,
  targetHost: string,
  roomName = '',
) {
  const coopConnected = ref(false)
  const lspConnected = ref<State>(State.Stopped)
  const outerProvider = { value: null as WebsocketProvider | null }
  const outerLanguageClient = { value: null as MonacoLanguageClient | null }
  const users = ref<Array<UserInfo>>([])
  let clearTimer: any = null

  watch(
    name,
    (n) => {
      if (outerProvider.value) {
        // if client is disconnect but server doesn't know it.
        // use old clientID will cause document broken permanently.
        // so when reconnect happen, we should give it a new clientID.
        // or make server disconnect old socket.
        // in production, you should add a api to get a clientID safety to prevent conflict.
        // outerProvider.value.awareness.clientID = parseInt((Math.random() * 10000000000) as any)
        outerProvider.value.roomname = roomName + `?name=${n}&ydocClientId=${outerProvider.value.awareness.clientID}`
      }
    }
  )

  const switchCoopConnect = (connect = !coopConnected.value) => {
    if (!name.value.length) {
      alert("Name cannot be empty")
      return
    }
    if (outerProvider.value) {
      if (outerProvider.value.shouldConnect || !connect) {
        outerProvider.value.disconnect()
        coopConnected.value = false
      } else {
        outerProvider.value.connect()
        coopConnected.value = true
      }
    }
  }


  function switchLspConnect() {
    if (outerLanguageClient.value) {
      if (outerLanguageClient.value.state === State.Running) {
        outerLanguageClient.value.stop()
      }
      else if (outerLanguageClient.value.state === State.Stopped) {
        outerLanguageClient.value.start()
      }
    }
  }

  async function rerenderUsers() {
    const res = await updateUserList()
    users.value = res
    if (outerProvider.value) {
      const keys = Array.from(outerProvider.value?.awareness.meta.keys())
      // remove unexist user
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (!res.find((u) => parseInt(u.ydocClientId) === key)) {
          outerProvider.value.awareness.setLocalStateField(key.toString(), null)
        }
      }
    }
    updateConnectorStyle(
      Array.from(res.filter((u) => u.name !== name.value)),
      document.getElementById("yRemoteUserStyle") as HTMLStyleElement
    )
  }

  const initProvider = async () => {
    configureMonacoWorkers();
    const {
      provider,
      languageClient,
    } = await runClient({
      name: name.value,
      yjsHost: targetHost,
      lspHost: 'ws://localhost:30002/grammar',
    });

    provider.awareness.on("update", () => {
      if (!provider.awareness.getLocalState()) {
        switchCoopConnect(false)
      }
    })

    languageClient.onDidChangeState(() => {
      lspConnected.value = languageClient.state
    })

    clearTimer = setInterval(() => {
      // polling is not suggest to use
      // we suggest use a speical websocket to notice frontend update user
      if (provider.awareness.getLocalState()) rerenderUsers()
    }, 10000)

    outerProvider.value = provider
    outerLanguageClient.value = languageClient
  }

  onBeforeUnmount(() => {
    if (outerProvider.value) {
      outerProvider.value.disconnect()
    }
    clearInterval(clearTimer)
  })

  return {
    coopConnected,
    lspConnected,
    switchCoopConnect,
    switchLspConnect,
    initProvider,
    rerenderUsers,
    users,
  }
}
