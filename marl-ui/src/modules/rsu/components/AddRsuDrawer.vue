<template>
  <div>
    <a-drawer
      :maskClosable="false"
      @close="handleCancel"
      width="800"
      :title="rsuId ? '编辑设备' : '新增设备'"
      placement="right"
      v-model:visible="visible"
    >
      <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" :model="formState" ref="formRef">
        <!-- <a-form-item
          label="设备名称"
          name="name"
          :rules="[
            { required: true, message: '请输入', trigger: 'change' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { validator: blankValidate, trigger: 'change' },
          ]"
        >
          <a-input v-model:value="formState.name" allow-clear />
        </a-form-item> -->

        <a-form-item
          label="设备IP"
          name="ip"
          :rules="[
            { validator: ipValidate, trigger: 'change' },
            { required: true, message: '' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
          ]"
        >
          <a-input v-model:value="formState.ip" allow-clear />
        </a-form-item>
        <a-form-item
          label="设备端口"
          name="port"
          :rules="[
            { required: true, message: '请输入', trigger: 'change' },
            { validator: portValidate, trigger: 'change' },
          ]"
        >
          <a-input-number maxLength="10" v-model:value="formState.port" />
        </a-form-item>
        <a-form-item
          label="警告阈值"
          name="emergencyThreshold"
          :rules="[{ required: true, message: '请输入', trigger: 'change' }]"
        >
          <a-input-number min="0" maxLength="10" v-model:value="formState.emergencyThreshold" />
        </a-form-item>
        <a-form-item label="频率" name="frequency" :rules="[{ required: true, message: '请输入', trigger: 'change' }]">
          <a-input-number min="0" maxLength="10" v-model:value="formState.frequency" />
        </a-form-item>
        <a-form-item
          label="心跳周期"
          name="heartbeatPeriod"
          :rules="[{ required: true, message: '请输入', trigger: 'change' }]"
        >
          <a-input-number min="0" maxLength="10" v-model:value="formState.heartbeatPeriod" />
        </a-form-item>
        <a-form-item
          label="设备信息发送周期"
          name="sendPeriod"
          :rules="[{ required: true, message: '请输入', trigger: 'change' }]"
        >
          <a-input-number min="0" maxLength="10" v-model:value="formState.sendPeriod" />
        </a-form-item>
        <a-form-item label="协议" name="protocol" :rules="[{ required: true, message: '请输入', trigger: 'change' }]">
          <a-select v-model:value="formState.protocol" allow-clear>
            <a-select-option value="TCP">TCP</a-select-option>
            <a-select-option value="UDP">UDP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="厂商" name="facturer" :rules="[{ required: false, message: '请输入', trigger: 'change' }]">
          <a-select v-model:value="formState.facturer" allow-clear>
            <a-select-option value="gohighclient">大唐</a-select-option>
            <!-- <a-select-option value="rsunebulalink">星云</a-select-option> -->
          </a-select>
        </a-form-item>
        <a-form-item
          label="设备型号"
          name="model"
          :rules="[
            { required: true, message: '请输入', trigger: 'change' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { validator: blankValidate, trigger: 'change' },
          ]"
        >
          <a-input v-model:value="formState.model" allow-clear />
        </a-form-item>
        <a-form-item
          label="安装位置"
          name="position"
          :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
        >
          <a-select v-model:value="formState.position" :disabled="!!rsuId" allow-clear>
            <a-select-option v-for="(item, index) in installPosition" :value="item.value" :key="index">{{
              item.label
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="false"
          label="是否启用"
          name="status"
          :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
        >
          <a-switch
            :checkedValue="'1'"
            :unCheckedValue="'0'"
            checked-children="启用"
            un-checked-children="关闭"
            v-model:checked="formState.status"
          />
        </a-form-item>
        <a-form-item
          label="描述"
          name="desc"
          :rules="[{ max: 500, message: '字符数应不大于500位', trigger: 'change' }]"
        >
          <a-textarea v-model:value="formState.desc" :auto-size="{ minRows: 2, maxRows: 5 }" allow-clear />
        </a-form-item>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button style="margin-right: 8px" @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleOk">提交</a-button>
      </div>
    </a-drawer>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, unref, defineExpose, getCurrentInstance, toRaw } from 'vue'
import { Form, message } from 'ant-design-vue'
import * as rsuApi from '@/services/api/rsuApi'
import { RuleObject } from 'ant-design-vue/lib/form/interface'
import { regIp } from '@/core/constant'
// type
import { AddRsu, RsuListItem } from '@/types/rsu'
// datas
import { installPosition } from '../data'
// utils
import { cloneDeep } from 'lodash'
import { DeviceType } from '@/core/enums/cameraEnum'
import { ipValidate, blankValidate, portValidate } from '@/utils/formValidate'

const props = defineProps({
  deviceList: {
    type: Array as PropType<RsuListItem[]>,
    default: () => [],
  },
})
const useForm = Form.useForm

const visible = ref<boolean>(false)
const rsuId = ref<string>()
const formRef = ref()
const formState = reactive<AddRsu>({
  name: '',
  ip: '',
  port: '',
  emergencyThreshold: undefined,
  frequency: undefined,
  heartbeatPeriod: undefined,
  sendPeriod: undefined,
  facturer: 'gohighclient',
  model: '',
  desc: '',
  position: '',
  protocol: '',
  status: '1',
})

const currentInstance = getCurrentInstance()

function handleOk() {
  formRef.value.validate().then(async () => {
    const val = cloneDeep(toRaw(formState)) as AddRsu
    if (checkInstallOnly(val.position)) {
      return message.error('相同安装位置已存在相同设备')
    }
    if (unref(rsuId)) {
      await rsuApi.updateRsu({ ...val, id: unref(rsuId) })
      message.success('编辑设备成功')
    } else {
      await rsuApi.addRsu(val)
      message.success('添加设备成功')
    }
    visible.value = false
    clearFields()
    currentInstance.parent.exposed.getRsuList()
  })
}

function handleCancel() {
  visible.value = false
  clearFields()
}

function clearFields() {
  formState.ip = ''
  formState.port = ''
  formState.model = ''
  formState.position = ''
  formState.desc = ''
  formState.name = ''
  formState.emergencyThreshold = undefined
  formState.frequency = undefined
  formState.heartbeatPeriod = undefined
  formState.sendPeriod = undefined
  formState.facturer = 'gohighclient'
  formState.protocol = ''
  formState.status = '1'
}

function setFieldsValue(values: Partial<AddRsu>) {
  Object.keys(values).forEach((key) => {
    formState[key] = values[key]
  })
}

// 判断同一位置同一设备类型唯一
function checkInstallOnly(position: string) {
  return props.deviceList
    .filter((a) => {
      return a.id != unref(rsuId)
    })
    .some((item) => {
      return item.position === position
    })
}

defineExpose({
  visible,
  rsuId,
  formState,
  setFieldsValue,
})
</script>
<style lang="less" scoped></style>
