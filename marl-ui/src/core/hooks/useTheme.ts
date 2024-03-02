import { ref } from 'vue'

const color = ref<string>('')

export const useTheme = () => {
  const changeColor: any = (val: string) => {
    color.value = val
  }
  return [color, changeColor]
}
