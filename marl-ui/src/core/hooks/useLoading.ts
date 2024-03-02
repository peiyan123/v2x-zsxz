import { ref } from 'vue'

const globalLoading = ref<boolean>(false)

export function useLoading() {
  return {
    globalLoading,
    open() {
      globalLoading.value = true
    },
    close() {
      globalLoading.value = false
    },
  }
}
