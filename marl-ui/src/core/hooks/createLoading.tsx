import { Spin } from 'ant-design-vue'
import { createVNode, defineComponent, ref, render } from 'vue'

export function createLoading(target?: HTMLElement) {
  const spining = ref<boolean>(true)
  const customContent = ref<string>('')
  const loading = defineComponent({
    setup() {
      return () => {
        return (
          <div class="custom-loading">
            <div class="flex flex-col">
              <Spin spinning={spining.value}></Spin>
              <div>{customContent.value}</div>
            </div>
          </div>
        )
      }
    },
  })
  const vm = createVNode(loading)
  const container = document.createElement('div')
  render(vm, container)

  function close() {
    if (vm?.el && vm.el.parentNode) {
      vm.el.parentNode.removeChild(vm.el)
    }
  }

  function open(content = '', target: HTMLElement = document.body) {
    if (!vm || !vm.el) {
      return
    }
    customContent.value = content
    target.style.position = 'relative'
    target.appendChild(vm.el as HTMLElement)
  }
  if (target) {
    target.style.position = 'relative'
    open('', target)
  }

  return {
    setLoading: (loading: boolean) => {
      spining.value = loading
    },
    open,
    close,
  }
}

// let instance
// export function useLoading() {
//   if (instance) {
//     return {
//       instance,
//       setLoading: (loading: boolean) => {
//         spining.value = loading
//       },
//     }
//   }
//   const vm = createApp(loading)
//   const div = document.createElement('div')
//   document.getElementById('app').appendChild(div)
//   instance = vm.mount(div)
//   return {
//     instance,
//     setLoading: (loading: boolean) => {
//       spining.value = loading
//     },
//   }
// }
