import { WebsocketProvider } from "y-websocket";

const userMap: Record<string, { name: string; color: string; ydocClientId: string }> = {}

const usercolors = [
  '#30bced',
  '#6eeb83',
  '#ffbc42',
  '#ecd444',
  '#ee6352',
  '#9ac2c9',
  '#8acb88',
  '#1be7ff'
]

export function pickColor() {
  return usercolors[Math.floor(Math.random() * usercolors.length)]
}

function updateConnectorStyle(users: {
  ydocClientId: string
  name: string
}[], style: HTMLStyleElement, provider?: WebsocketProvider) {
  // const currentUsers = Object.keys(users)
  // const newUsers = currentUsers.filter(user => !userMap[user])
  // const removedUsers = Object.keys(userMap).filter(user => !currentUsers.includes(user))
  const newMap: Record<string, { name: string; color: string; ydocClientId: string }> = {}

  users.forEach(({ name, ydocClientId }) => {
    if (!userMap[name]) {
      userMap[name] = {
        name,
        ydocClientId,
        color: pickColor()
      }
    } else {
      userMap[name].ydocClientId = ydocClientId
    }
    newMap[name] = userMap[name]
  });

  style.innerHTML = Object.keys(newMap).map(user => {
    const { name, color, ydocClientId: ydocId } = userMap[user]
    return `.yRemoteSelection-${ydocId} { background-color: ${color}88 } 
    .yRemoteSelectionHead-${ydocId} { border-color: ${color} } 
    .yRemoteSelectionHead-${ydocId}::after { border-color: ${color} }
    .yRemoteSelectionHead-${ydocId}::before { content: "${name}"; background-color: ${color}; color: white; font-size: 12px; 
    white-space: nowrap; padding: 0 4px; position: absolute; bottom: 16px; border-radius: 2px; left: -2px; border-bottom-left-radius: 0; }`
  }).join('')
}

export default updateConnectorStyle