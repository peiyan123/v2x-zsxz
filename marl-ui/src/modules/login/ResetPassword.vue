<template>
  <div>
    <a-modal
      width="500px"
      v-model:visible="visible"
      title="重置密码"
      @ok="handleOk"
      @cancel="handleCancel"
      okText="确认"
      cancelText="取消"
    >
      <a-form :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }" autocomplete="off">
        <a-form-item label="旧密码" name="old_password" v-bind="validateInfos.old_password">
          <a-input-password v-model:value="formState.old_password" />
        </a-form-item>

        <a-form-item label="新密码" name="new_password" v-bind="validateInfos.new_password">
          <a-input-password v-model:value="formState.new_password" />
        </a-form-item>
        <a-form-item label="确认密码" name="confirm_password" v-bind="validateInfos.confirm_password">
          <a-input-password v-model:value="formState.confirm_password" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, defineExpose } from 'vue'
import { Form, message } from 'ant-design-vue'
import { RuleObject } from 'ant-design-vue/es/form/interface'
import * as userApi from '@/services/api/userApi'
import { ResetFormState } from '@/types/user'
// utils
import { encryptByBase64 } from '@/utils/cipher'
import { isPassword } from '@/utils/is'
const useForm = Form.useForm

const visible = ref(false)

const formState = reactive<ResetFormState>({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const rules = reactive({
  old_password: [{ required: true, message: '请输入旧密码', trigger: 'change' }],
  new_password: [
    { validator: validatePass, trigger: 'change' },
    { min: 6, message: '不能低于6位数', trigger: 'change' },
    // { pattern: /^(.{0,5}|[^\u4e00-\u9fa5]*)$/, message: '不能包含中文字符' },
  ],
  confirm_password: [{ validator: validatePass2, trigger: 'change' }],
})

const { validate, validateInfos, resetFields, validateField } = useForm(formState, rules)
function handleCancel() {
  visible.value = false
  resetFields()
}

function handleOk() {
  validate().then(async (val: ResetFormState) => {
    val.old_password = encryptByBase64(val.old_password)
    val.new_password = encryptByBase64(val.new_password)
    val.confirm_password = encryptByBase64(val.confirm_password)
    await userApi.modifyPassword(val)
    message.success('修改密码成功')
    visible.value = false
    resetFields()
  })
}

async function validatePass(_rule: RuleObject, value: string) {
  if (value === '') {
    return Promise.reject('请输入新密码')
  } else if (!isPassword(value, 6)) {
    return Promise.reject('密码只能包含字母、数字和特殊字符')
  } else {
    if (formState.confirm_password !== '') {
      validateField('confirm_password', formState.confirm_password, [{ validator: validatePass2, trigger: 'change' }])
    }
    return Promise.resolve()
  }
}
async function validatePass2(_rule: RuleObject, value: string) {
  if (value === '') {
    return Promise.reject('请输入确认密码')
  } else if (value !== formState.new_password) {
    return Promise.reject('两次密码不同!')
  } else {
    return Promise.resolve()
  }
}

defineExpose({
  visible,
})
</script>
<style lang="less" scoped></style>
