<template>
  <div class="login-form">
    <div class="system-name">路侧操作系统算法服务</div>
    <div class="w-full title-wrap">
      <div class="title">登录</div>
      <div class="info">用户名验证登录</div>
    </div>
    <a-form :model="formState" name="basic" :label-col="{ span: 6 }" :wrapper-col="{ span: 24 }" autocomplete="off">
      <a-form-item label="" name="username" v-bind="validateInfos.username">
        <a-input v-model:value="formState.username" placeholder="请输入用户名">
          <template #prefix>
            <img :src="usernameUrl" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="" name="password" v-bind="validateInfos.password">
        <a-input-password v-model:value="formState.password" placeholder="请输入密码">
          <template #prefix>
            <img :src="passwordUrl" />
          </template>
        </a-input-password>
      </a-form-item>

      <!-- <a-form-item name="remember" :wrapper-col="{ offset: 6, span: 18 }">
        <div> -->
      <!-- <a-checkbox v-model:checked="formState.remember">记住密码</a-checkbox> -->
      <!-- <span @click="resetPassword" class="cursor-pointer text-blue-600 flex items-center"
            ><exclamation-circle-outlined class="mr-5px" />修改密码</span
          >
        </div>
      </a-form-item> -->
      <a-form-item :wrapper-col="{ span: 24 }">
        <div class="submit-content">
          <a-button type="primary" @click="handleSubmit" :disabled="disableButton">登录</a-button>
        </div>
      </a-form-item>
    </a-form>
    <ResetPassword ref="resetRef" />
    <div class="bottom-system">交通运输行政执法信息共享与交换平台 V1.04</div>
  </div>
</template>
<script lang="ts">
type FormState = {
  username: string
  password: string
}
</script>
<script lang="ts" setup>
import { reactive, getCurrentInstance, ref } from 'vue'
// components
import { Form, message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import ResetPassword from './ResetPassword.vue'
// services
import * as userApi from '@/services/api/userApi'
// utils
import { blankValidate } from '@/utils/formValidate'
import { encryptByBase64 } from '@/utils/cipher'
// hooks
import { useI18n } from '@/core/hooks/useI18n'
import { useRouter } from 'vue-router'
import usernameUrl from '@/assets/login/icon-username.png'
import passwordUrl from '@/assets/login/icon-password.png'

const { t } = useI18n()
const useForm = Form.useForm
const disableButton = ref(true)
const errorState = reactive({
  username: false,
  password: false,
})
const formState = reactive<FormState>({
  username: '',
  password: '',
})

const rules = reactive({
  username: [
    { required: true, message: '请输入', trigger: 'change' },
    { validator: blankValidate, trigger: 'change' },
  ],
  password: [
    { required: true, message: '请输入', trigger: 'change' },
    { min: 6, message: '不能低于6位数', trigger: 'change' },
    { validator: blankValidate, trigger: 'change' },
  ],
})
const { validate, validateInfos, resetFields } = useForm(formState, rules, { onValidate })

const { push } = useRouter()

const resetRef = ref()

/**
 * 表单项验证时触发的方法
 * @param name {string} 验证表单项的name
 * @param status {boolean} 表单项验证是否成功
 * @param errors {array} 验证失败的消息数组
 */
function onValidate(name, status, errors) {
  errorState[name] = status
  // 如果验证失败，则设置登录按钮不可点
  if (!status) {
    disableButton.value = true
    return
  }
  const keys = Object.keys(formState)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    // 如果有表单项的值为空或者验证失败，则设置登录按钮不可点
    if (!formState[key] || !errorState[key]) {
      disableButton.value = true
      return
    }
  }
  // 表单项都有值，且验证没有失败，则设置登录按钮可点击
  disableButton.value = false
}
function handleSubmit() {
  validate().then(async (val: FormState) => {
    val.password = encryptByBase64(val.password)
    const result = await userApi.login(val)
    // Cookies.set('token', `Bearer ${result.data.token}`)
    localStorage.setItem('token', `Bearer ${result.data.token}`)
    push('/group')
  })
}

function resetPassword() {
  resetRef.value.visible = true
}
</script>
<style lang="less" scoped>
.login-form {
  width: 400px;
  padding-top: 60px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  .system-name {
    position: relative;
    height: 40px;
    line-height: 40px;
    margin-bottom: 35px;
    padding-left: 50px;
    font-size: 30px;
    font-weight: bold;
    color: #0c4478;
    // background-image: url('~@/assets/login/title.png');
    // background-repeat: no-repeat;
    // background-size: 100% 100%;
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      width: 40px;
      height: 40px;
      background-image: url('~@/assets/login/logo.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
  }
  .title-wrap {
    margin-bottom: 40px;
    .title {
      font-size: 30px;
      font-weight: bold;
    }
    .info {
      color: #a8a8a8;
    }
  }
  :deep(.ant-input-affix-wrapper) {
    border-radius: 5px;
  }
  .ant-form {
    width: 100%;
    // width: 370px;
  }
  .bottom-system {
    position: absolute;
    bottom: 30px;
    color: #a8a8a8;
  }
}

.submit-content {
  text-align: center;
  button {
    width: 100%;
    border-radius: 5px;
  }
  :deep(.ant-btn-primary[disabled]) {
    background: #deeefa;
    color: #b3d0e5;
    border-color: #deeefa;
  }
}
@media screen and (max-width: 1500px) {
  .login-form {
    padding-top: 50px;
  }
}
@media screen and(min-width: 1600px) and (max-width: 2500px) {
  .login-form {
    padding-top: 100px;
  }
}
</style>
