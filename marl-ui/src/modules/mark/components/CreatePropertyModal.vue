<template>
  <BasicModal
    v-bind="$attrs"
    :title="getTitle"
    width="480px"
    showFooter
    destroyOnClose
    :keyboard="false"
    :maskClosable="false"
    :canFullscreen="false"
    okText="确定"
    @register="registerModal"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, unref, computed } from 'vue'
// Components
import { useModalInner, BasicModal } from '@/components/Modal'
import { BasicForm, useForm } from '@/components/Form/index'
import { isAllSpecialChar } from '@/utils/is'
// // Services
// import { createCategoryTreeItem, updateCategoryTreeItem } from '@/api/product/category'
// // Config
// import { nodeFormSchema } from '../../category.config'

const emit = defineEmits(['success'])

const isUpdate = ref(true)
const [registerModal, { closeModal, setModalProps }] = useModalInner(async (res) => {
  resetFields()
  isUpdate.value = !!res?.isUpdate
  setFieldsValue({
    ...res.data,
  })
})
const nodeFormSchema = [
  {
    field: 'parentId',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    field: 'id',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    field: 'nodeLevel',
    label: '',
    component: 'Input',
    show: false,
  },
  {
    field: 'name',
    label: '属性名称',
    component: 'Input',
    componentProps: {
      maxLength: 100,
    },
    colProps: { span: 24 },
    rules: [
      {
        required: true,
        validator: (_, value) => {
          if (!value) {
            return Promise.reject('请输入属性名称')
          }
          if (isAllSpecialChar(value)) {
            return Promise.reject('品类名称不允许仅为特殊字符')
          }
          return Promise.resolve()
        },
      },
    ],
  },
]
const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
  // layout: 'vertical',
  schemas: nodeFormSchema,
  showActionButtonGroup: false,
  autoSetPlaceHolder: false,
})

const getTitle = computed(() => (!unref(isUpdate) ? '新增属性' : '编辑属性'))

const handleSubmit = async () => {
  try {
    const values = await validate()
    setModalProps({ confirmLoading: true })
    // unref(isUpdate) ? await updateCategoryTreeItem(values) : await createCategoryTreeItem(values)
    emit('success', { ...values, isUpdate: unref(isUpdate) }, (val) => {
      if (val) {
        closeModal()
      }
    })
  } finally {
    setModalProps({ confirmLoading: false })
  }
}
</script>
