import { createContext, useEffect, useState } from 'react'

// export const MenuContext = createContext<{
//   openMenuId: string | null
//   setOpenMenuId: (id: string | null) => void
// }>({
//   openMenuId: null,
//   setOpenMenuId: (id: string | null) => {}
// })

// export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [openMenuId, setOpenMenuId] = useState<string | null>(null)
//   return (
//     <MenuContext.Provider value={{ openMenuId, setOpenMenuId }}>{children}</MenuContext.Provider>
//   )
// }

// menuStore.ts
type Listener = (id: string | null) => void

let currentMenuId: string | null = null
const listeners = new Set<Listener>()

export function getOpenMenuId() {
  return currentMenuId
}

export function setOpenMenuId(id: string | null) {
  currentMenuId = id
  listeners.forEach((fn) => fn(id))
}

export function subscribe(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function useMenu() {
  const [openMenuId, setId] = useState(getOpenMenuId())

  useEffect(() => {
    return subscribe(setId)
  }, [])

  return { openMenuId, setOpenMenuId }
}
