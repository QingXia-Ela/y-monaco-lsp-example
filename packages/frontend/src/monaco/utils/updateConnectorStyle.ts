const userMap: Record<string, { name: string; color: string; ydocClientId: string }> = {}

function updateConnectorStyle(users: {
  ydocClientId: string
  name: string
}[], style: HTMLStyleElement) {
  // const currentUsers = Object.keys(users)
  // const newUsers = currentUsers.filter(user => !userMap[user])
  // const removedUsers = Object.keys(userMap).filter(user => !currentUsers.includes(user))
  const newMap: Record<string, { name: string; color: string; ydocClientId: string }> = {}

  users.forEach(({ name, ydocClientId }) => {
    if (!userMap[name]) {
      userMap[name] = {
        name,
        ydocClientId,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
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