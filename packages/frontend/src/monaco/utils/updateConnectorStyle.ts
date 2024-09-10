const userMap: Record<string, { name: string; color: string }> = {}

function updateConnectorStyle(users: number[], style: HTMLStyleElement) {
  // const currentUsers = Object.keys(users)
  // const newUsers = currentUsers.filter(user => !userMap[user])
  // const removedUsers = Object.keys(userMap).filter(user => !currentUsers.includes(user))
  users.forEach(user => {
    if (!userMap[user]) {
      userMap[user] = {
        name: "Anonymous-" + user,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
      }
    }
  });

  style.innerHTML = Object.keys(userMap).map(user => {
    const { name, color } = userMap[user]
    return `.yRemoteSelection-${user} { background-color: ${color}88 } 
    .yRemoteSelectionHead-${user} { border-color: ${color} } 
    .yRemoteSelectionHead-${user}::after { border-color: ${color} }
    .yRemoteSelectionHead-${user}::before { content: "${name}"; background-color: ${color}; color: white; font-size: 12px; 
    white-space: nowrap; padding: 0 4px; position: absolute; bottom: 16px; border-radius: 2px; left: -2px; border-bottom-left-radius: 0; }`
  }).join('')
}

export default updateConnectorStyle