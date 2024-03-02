import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

export const useToggle = () => {
  const appStore = useAppStore()

  const collapsed = computed(() => appStore.getCollapsed)

  const setCollapsed = appStore.setCollapsed

  return {
    collapsed,
    setCollapsed,
  }
}
