<template>
  <!-- <div>设备配置</div> -->
  <BasicForm @register="register">
    <template #up-cret>
      <!-- <a-button type="primary" class="ml-30px">上传证书</a-button> -->
      <!-- <a-upload
        :accept="'.pem,.key'"
        :showUploadList="false"
        :before-upload="beforeUpload"
        :customRequest="handleUpload"
      >
        <a-button>上传证书</a-button>
      </a-upload> -->
      <a-button class="ml-2" type="primary" @click="handleConnect">测试连接</a-button>
      <span class="color-green ml-20px" v-if="testStatus === 'success'">
        <CheckCircleFilled />
        连接成功
      </span>
      <span class="color-red ml-20px" v-if="testStatus === 'failed'">
        <CloseCircleFilled />
        连接失败
      </span>
    </template>
    <template #img>
      <a-button type="primary" @click="handleHolo">上传并标定路口交通全息图</a-button>
      <div class="mt-10px">
        <a-image :src="imageUrl" width="200px" :preview="false"></a-image>
      </div>
    </template>
  </BasicForm>
  <a-divider />
  <a-button class="ml-2" @click="handleOk" type="primary">应用当前配置</a-button>
  <HoloImageModal @register="registerModal" @successCb="handleSuccessCb" />
</template>
<script lang="ts" setup>
import { onActivated, onMounted, ref } from 'vue'
// components
import { BasicForm, useForm } from '@/components/Form'
import HoloImageModal from './HoloImageModal.vue'
import { message } from 'ant-design-vue'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue'
// config
import { networkSchema, mqttSchema, deviceSchema, roadSchema } from './config'
// hooks
import { useModal } from '@/components/Modal'
import { useAppStore } from '@/store/modules/app'
// service
import * as mecApi from '@/services/api/mecApi'
import { uploadCert, uploadApi } from '@/services/api/uploadApi'
import * as cameraApi from '@/services/api/cameraApi'
import * as radarApi from '@/services/api/radarApi'
import * as rsuApi from '@/services/api/rsuApi'
// types
import { MecConfig } from '@/types/mec'
// utils
import { checkFileType } from '../utils'
import { toNumber } from 'lodash'

const [registerModal, { openModal }] = useModal()
const imageUrl = ref()
const testStatus = ref('')
const appStore = useAppStore()
const [register, { validate, setFieldsValue, getFieldsValue }] = useForm({
  schemas: deviceSchema,
})
async function handleOk() {
  const fieldsValue = getFieldsValue()
  // 如果有需要保存的字段，则调用接口进行保存
  if (Object.keys(fieldsValue).length > 0) {
    await handleSave()
  }
  // await cameraApi.submitReportData()
  // await radarApi.submitReportData()
  await mecApi.saveApply()
  // await rsuApi.submitReportData()
  // message.success('上报数据成功')
  // await cameraApi.rebootDevice()
  // message.success('重启应用成功')
  message.success('应用成功')
  appStore.setReboot(false)
}
async function handleSave() {
  const values = await validate()
  // 先上传文件再保存
  if (values.imageUrl instanceof File) {
    const result = await uploadApi(
      {
        file: values.imageUrl,
      },
      function onUploadProgress(progressEvent: ProgressEvent) {
        const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
      }
    )
    values.imageUrl = result.data.url
  }
  // 将字符串转为数字，再上传
  values.longitude = toNumber(values.longitude)
  values.latitude = toNumber(values.latitude)
  values.elevation = toNumber(values.elevation)
  await mecApi.saveMecConfig(values)
  // message.success('保存成功')
  appStore.setReboot(true)
}
function handleHolo() {
  openModal(true)
}
function handleSuccessCb({ src, file }) {
  setFieldsValue({
    imageUrl: file,
  })
  imageUrl.value = src
}
onActivated(() => {
  getMecConfig()
})
async function getMecConfig() {
  const result = await mecApi.getMecConfig()
  const data: MecConfig = result.data
  imageUrl.value = data.imageUrl
  setFieldsValue({
    ip: data.ip,
    password: data.password,
    port: data.port,
    username: data.username,
    deviceId: data.deviceId,
    sn: data.sn,
    longitude: data.longitude,
    latitude: data.latitude,
    elevation: data.elevation,
    imageUrl: data.imageUrl,
  })
}

function beforeUpload(file: File) {
  const accept = ['pem', 'key']
  if (accept.length > 0 && !checkFileType(file, accept)) {
    message.error('文件格式' + accept.join(','))
    return false
  }
}

async function handleUpload({ action, file, onSuccess, onError, onProgress }) {
  const result = await uploadCert(
    {
      file,
    },
    function onUploadProgress(progressEvent: ProgressEvent) {
      const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
      // console.log(complete)
    }
  )
  message.success('上传证书成功')
}

async function handleConnect() {
  const { ip, port, username, password } = getFieldsValue()
  try {
    await mecApi.testConnect({ ip, port, username, password })
    message.success('连接成功')
    testStatus.value = 'success'
  } catch (error) {
    testStatus.value = 'failed'
  }
}
</script>
<style lang="less" scoped>
.color-green {
  color: #52c41a;
}
.color-red {
  color: #ff4d4f;
}
</style>
