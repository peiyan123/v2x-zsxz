<template>
  <Modal v-bind="getBindValue" @cancel="handleCancel">
    <slot></slot>
    <template #[item]="data" v-for="item in Object.keys(omit($slots, 'default'))">
      <slot :name="item" v-bind="data || {}"></slot>
    </template>
  </Modal>
</template>
<script lang="ts" setup>
import { defineComponent, computed, useAttrs, ref, unref, getCurrentInstance } from 'vue'
// components
import Modal from './components/Modal'
// utils
import { omit } from 'lodash'
// types
import { ModalProps, ModalMethods } from './types'
import { deepMerge } from '@/utils'

const emit = defineEmits(['register'])
const props = defineProps({
  handleCancle: {
    type: Object as PropType<Fn>,
    default: null,
  },
})
const attrs = useAttrs()
const propsRef = ref<Partial<ModalProps>>()

const modalMethods: ModalMethods = {
  setModalProps,
  emitVisible: undefined,
  redoModalHeight: () => {},
}

const instance = getCurrentInstance()
if (instance) {
  emit('register', modalMethods, instance.uid)
}
const getMergeProps = computed((): Recordable => {
  return {
    ...props,
    ...(unref(propsRef) as any),
  }
})
const getBindValue = computed((): Recordable => {
  return { ...attrs, ...unref(getMergeProps) }
})
function setModalProps(props: Partial<ModalProps>): void {
  propsRef.value = deepMerge(unref(propsRef) || ({} as any), props)
}

function handleCancel() {
  setModalProps({ visible: false })
  props.handleCancle?.()
}
</script>
<style lang="less" scoped></style>
