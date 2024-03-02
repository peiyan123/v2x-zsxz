import { provide, inject, reactive } from 'vue'

export const createContext = (context: Record<string, any>, key: any) => {
  const state = reactive(context)
  provide(key, state)
  return state
}

export const useContext = (key: any) => {
  return inject(key)
}
