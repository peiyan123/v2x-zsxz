import { error } from '@/utils'
import { getCurrentInstance, nextTick, onUnmounted, reactive, ref, toRaw, unref, watchEffect } from 'vue'
import { ModalMethods, ModalProps, ReturnMethods, UseModalInnerReturnType, UseModalReturnType } from '../types'
import { isEqual } from 'lodash'
import { isFunction } from '@/utils/is'

const dataTransfer = reactive<any>({})
export function useModal(): UseModalReturnType {
  const modal = ref<Nullable<ModalMethods>>(null)
  const uid = ref<string>('')
  function register(modalMethod: ModalMethods, uuid: string) {
    if (!getCurrentInstance()) {
      throw new Error('useModal() can only be used inside setup() or functional components!')
    }
    onUnmounted(() => {
      modal.value = null
      dataTransfer[unref(uid)] = null
    })
    modal.value = modalMethod
    uid.value = uuid
  }

  const getInstance = () => {
    const instance = unref(modal)
    if (!instance) {
      error('useModal instance is undefined!')
    }
    return instance
  }

  const methods: ReturnMethods = {
    setModalProps: (props: Partial<ModalProps>): void => {
      getInstance()?.setModalProps(props)
    },
    openModal: <T = any>(visible = true, data?: T, openOnSet = true): void => {
      getInstance()?.setModalProps({
        visible: visible,
      })
      if (!data) return
      const id = unref(uid)
      if (openOnSet) {
        dataTransfer[id] = null
        dataTransfer[id] = toRaw(data)
        return
      }
      const equal = isEqual(toRaw(dataTransfer[id]), toRaw(data))
      if (!equal) {
        dataTransfer[id] = toRaw(data)
      }
    },
    closeModal: () => {
      getInstance()?.setModalProps({ visible: false })
    },
  }
  return [register, methods]
}

export const useModalInner = (callbackFn?: Fn): UseModalInnerReturnType => {
  const modalInstanceRef = ref<Nullable<ModalMethods>>(null)
  const currentInstance = getCurrentInstance()
  const uidRef = ref<string>('')

  const getInstance = () => {
    const instance = unref(modalInstanceRef)
    if (!instance) {
      error('useModalInner instance is undefined!')
    }
    return instance
  }

  const register = (modalInstance: ModalMethods, uuid: string) => {
    onUnmounted(() => {
      modalInstanceRef.value = null
    })
    uidRef.value = uuid
    modalInstanceRef.value = modalInstance
    currentInstance?.emit('register', modalInstance, uuid)
  }

  watchEffect(() => {
    const data = dataTransfer[unref(uidRef)]
    if (!data) return
    if (!callbackFn || !isFunction(callbackFn)) return
    nextTick(() => {
      callbackFn(data)
    })
  })

  return [
    register,
    {
      changeOkLoading: (loading = true) => {
        getInstance()?.setModalProps({ confirmLoading: loading })
      },
      closeModal: () => {
        getInstance()?.setModalProps({ visible: false })
      },
      setModalProps: (props: Partial<ModalProps>) => {
        getInstance()?.setModalProps(props)
      },
    },
  ]
}
