import { defineComponent, unref, toRefs } from 'vue'
import { basicProps } from '../props'
import { Modal } from 'ant-design-vue'
import { extendSlots } from '@/utils/helper'
import { useModalDragMove } from '../hooks/useModalDrag'

export default defineComponent({
  name: 'Modal',
  inheritAttrs: false,
  props: basicProps,
  setup(props, { slots, attrs }) {
    const { visible, draggable, destroyOnClose } = toRefs(props)
    useModalDragMove({
      visible,
      destroyOnClose,
      draggable,
    })
    return () => {
      const propsData = { ...unref(attrs), ...props } as Recordable
      return <Modal {...propsData}>{extendSlots(slots)}</Modal>
    }
  },
})
