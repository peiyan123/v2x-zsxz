<template>
  <BasicModal :width="500" @register="registerModal" @ok="handleOk" :handleCancle="handleCancel" title="添加Group">
    <!-- <BasicForm @register="registerForm" /> -->
    <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        ref="name"
        label="Group名字"
        name="name"
        :rules="[
          { required: true, message: '请输入Group名字!' },
          { pattern: /^[a-zA-Z_\u4e00-\u9fa5\d]+$/, message: 'Group名字可以包含中文、字母、数字和下滑线' },
          // { pattern: /^[a-z_]+$/, message: 'Group名字只能有小写字母和下滑线组成' },
        ]"
      >
        <AutoComplete v-model:value="formState.name" :options="defaultGroups" @select="handleSelect">
          <a-input maxLength="100" placeholder="请输入Group名字" />
        </AutoComplete>
      </a-form-item>
    </a-form>
  </BasicModal>
</template>
<script lang="ts" setup>
import { defineEmits, onMounted, reactive, ref, UnwrapRef } from 'vue'
import { AutoComplete } from 'ant-design-vue'
// components
import { BasicModal, useModalInner } from '@/components/Modal'
// services
import * as groupApi from '@/services/api/groupApi'

interface FormState {
  name: string
}
interface Option {
  value: string
}
const emits = defineEmits(['addTabName'])
const [registerModal, { closeModal }] = useModalInner()
const formRef = ref()
const formState: UnwrapRef<FormState> = reactive({
  name: '',
})
const defaultGroups = ref<Option[]>([])

async function handleOk() {
  const values = await formRef.value.validate()
  const { data } = await groupApi.addGroup(values)
  emits('addTabName', data, formRef.value.resetFields)
}
function handleCancel() {
  formRef.value.resetFields()
}
/**
 * 选中某个预置项时触发的方法
 * @param _value 选中的值
 * @param option 选中项的数据对象
 */
function handleSelect(_value, option) {
  // 保存选中的项的key
  // nameKey = option.key
}
onMounted(() => {})
</script>
<style lang="less" scoped></style>
