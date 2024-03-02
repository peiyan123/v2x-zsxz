<template>
  <BasicModal :width="500" @register="registerModal" @ok="handleOk" :handleCancle="handleCancel" title="添加事件">
    <!-- <BasicForm @register="registerForm" /> -->
    <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        ref="name"
        label="事件"
        name="tabName"
        :rules="[{ required: true, message: '请选择事件', trigger: 'change' }]"
      >
        <a-select v-model:value="formState.tabName" placeholder="请选择事件">
          <a-select-option v-for="(item, index) in defaultEvents" :value="item.key" :key="index">{{
            item.value
          }}</a-select-option>
        </a-select>
        <!-- <AutoComplete v-model:value="formState.tabName" :options="defaultEvents" @select="handleSelect">
          <a-input maxLength="100" placeholder="请选择或输入" />
        </AutoComplete> -->
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { defineEmits, onMounted, reactive, ref, unref, UnwrapRef } from 'vue'
// components
import { BasicModal, useModalInner } from '@/components/Modal'
import { BasicForm, useForm } from '@/components/Form'
import { AutoComplete } from 'ant-design-vue'
import { DEFAULT_EVENTS } from '../config'

interface FormState {
  tabName: string
}
interface Option {
  value: string
  key: string
}
const emits = defineEmits(['addTabName'])
const [registerModal, { closeModal }] = useModalInner()
const formRef = ref()
const formState: UnwrapRef<FormState> = reactive({
  tabName: undefined,
})
const defaultEvents = ref<Option[]>(
  Object.keys(DEFAULT_EVENTS).map((key) => ({ value: DEFAULT_EVENTS[key].label, key: key }))
)
let nameKey = ''
const formSchema = [
  {
    field: 'tabName',
    label: 'Tab标题名',
    component: 'Input',
    colProps: {
      span: 24,
    },
    itemProps: {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
    },
    required: true,
  },
]
const [registerForm, { validate, resetFields }] = useForm({
  schemas: formSchema,
})
async function handleOk() {
  const values = await formRef.value.validate()
  // 如果输入框的值不是预置项，则更新nameKey为当前输入的值
  if (!DEFAULT_EVENTS[nameKey] || DEFAULT_EVENTS[nameKey].label !== values.tabName) {
    nameKey = values.tabName
  }
  emits('addTabName', nameKey, formRef.value.resetFields)
  // closeModal()
  // unref(scene).destroy()
}
function handleCancel() {
  // unref(scene).destroy()
  formRef.value.resetFields()
}
/**
 * 选中某个预置项时触发的方法
 * @param _value 选中的值
 * @param option 选中项的数据对象
 */
function handleSelect(_value, option) {
  // 保存选中的项的key
  nameKey = option.key
}
onMounted(() => {
  // if (unref(scene)) {
  //   unref(scene).destroy()
  // }
})
</script>
<style lang="less" scoped></style>
