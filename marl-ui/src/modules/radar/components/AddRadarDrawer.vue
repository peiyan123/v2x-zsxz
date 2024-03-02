<template>
  <div>
    <a-drawer
      :maskClosable="false"
      @close="handleCancel"
      width="500"
      :title="title || (radarId ? '编辑设备' : '新增设备')"
      placement="right"
      v-model:visible="visible"
    >
      <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }" :model="formState" ref="formRef">
        <!-- <a-form-item
          label="设备名称"
          name="name"
          :rules="[
            { required: true, message: '请输入', trigger: 'change' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { validator: blankValidate, trigger: 'change' },
          ]"
        >
          <a-input allow-clear v-model:value="formState.name" />
        </a-form-item> -->
        <a-form-item
          label="mbc IP"
          name="mbcIp"
          :rules="[
            { validator: ipValidate, trigger: 'change' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { required: true, message: '请输入' },
          ]"
        >
          <a-input allow-clear v-model:value="formState.mbcIp" />
        </a-form-item>
         <a-form-item
          label="mbc端口"
          name="mbcPort"
          :rules="[
            { required: true, message: '请输入', trigger: 'change' },
            { validator: portValidate, trigger: 'change' },
          ]"
        >
          <a-input-number allow-clear v-model:value="formState.mbcPort" />
        </a-form-item>
        <a-form-item
          label="mbc网卡"
          name="mbcNetworkCard"
          :rules="[
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { required: true, message: '请输入' },
          ]"
        >
          <a-input allow-clear v-model:value="formState.mbcNetworkCard" />
        </a-form-item>
        <a-form-item
          label="设备IP"
          name="ip"
          :rules="[
            { validator: ipValidate, trigger: 'change' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { required: true, message: '请输入' },
          ]"
        >
          <a-input allow-clear v-model:value="formState.ip" />
        </a-form-item>
        <!-- <a-form-item
          label="设备端口"
          name="port"
          :rules="[
            { required: true, message: '请输入', trigger: 'change' },
            { validator: portValidate, trigger: 'change' },
          ]"
        >
          <a-input-number allow-clear v-model:value="formState.port" />
        </a-form-item> -->
        <a-form-item label="协议" name="protocol" :rules="[{ required: true, message: '请输入', trigger: 'change' }]">
          <a-select disabled allow-clear v-model:value="formState.protocol">
            <a-select-option value="pcap">PCAP</a-select-option>
            <a-select-option value="TCP">TCP</a-select-option>
            <a-select-option value="UDP">UDP</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="厂商" name="facturer" :rules="[{ required: false, message: '请输入', trigger: 'change' }]">
          <a-select v-model:value="formState.facturer" allow-clear>
            <a-select-option value="gohighclient">大唐</a-select-option>
            <a-select-option value="hikvision">雷森</a-select-option>
            <a-select-option value="sensing">sensing</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="序列号"
          name="sn"
          :rules="[{ required: true, message: '请输入', trigger: 'change' },{ max: 100, message: '字符数应不大于100位', trigger: 'change' }]"
        >
          <a-input v-model:value="formState.sn" allowClear />
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
          <a-input disabled v-model:value="formState.model" allow-clear />
        </a-form-item>
        <a-form-item
          label="安装位置"
          name="position"
          :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
        >
          <a-select v-model:value="formState.position" :disabled="!!radarId" allow-clear>
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
import * as radarApi from '@/services/api/radarApi'
import { RuleObject } from 'ant-design-vue/lib/form/interface'
// type
import { AddRadar, RadarListItem } from '@/types/radar'
// datas
import { installPosition } from '../data'
// utils
import { cloneDeep } from 'lodash'
import { ipValidate, blankValidate, portValidate } from '@/utils/formValidate'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  deviceList: {
    type: Array as PropType<RadarListItem[]>,
    default: () => [],
  },
  // 组id
  groupId: {
    type: String,
    default: '',
  },
  // 页面标题
  title: {
    type: String,
    default: '',
  },
})
const useForm = Form.useForm
const appStore = useAppStore()

const visible = ref<boolean>(false)
const radarId = ref<string>()
const formRef = ref()
const formState = reactive<AddRadar>({
  name: '',
  ip: '',
  port: '',
  facturer: '',
  model: '733_1092',
  desc: '',
  position: '',
  protocol: 'pcap',
  status: '1',
  sn: '',
  mbcIp: '',
  mbcPort: '',
  mbcNetworkCard: '',
})

const currentInstance = getCurrentInstance()

function handleOk() {
  formRef.value.validate().then(async () => {
    const val = cloneDeep(toRaw(formState)) as AddRadar
    if (checkInstallOnly(val.position)) {
      return message.error('相同安装位置已存在相同设备')
    }
    debugger
    if (unref(radarId)) {
      await radarApi.updateRadar({ ...val, id: unref(radarId), groupId: props.groupId })
      message.success('编辑设备成功')
    } else {
      await radarApi.addRadar({ ...val, groupId: props.groupId })
      message.success('添加设备成功')
    }
    appStore.setReboot(true)
    visible.value = false
    clearFields()
    // 调用父组件方法更新父组件数据
    if (currentInstance.parent.exposed) {
      if (currentInstance.parent.exposed.getRadarList) {
        currentInstance.parent.exposed.getRadarList()
      }
      if (currentInstance.parent.exposed.getGroupInfo) {
        currentInstance.parent.exposed.getGroupInfo()
      }
    }
  })
}

// 判断同一位置同一设备类型唯一
function checkInstallOnly(position: string) {
  return props.deviceList
    .filter((a) => {
      return a.id != unref(radarId)
    })
    .some((item) => {
      return item.position === position
    })
}

function handleCancel() {
  visible.value = false
  clearFields()
}

function clearFields() {
  formState.mbcIp = '',
  formState.mbcPort = '',
  formState.mbcNetworkCard = '',
  formState.ip = ''
  formState.port = ''
  formState.model = '733_1092'
  formState.position = ''
  formState.desc = ''
  formState.name = ''
  formState.facturer = ''
  formState.protocol = 'pcap'
  formState.status = '1'
  formState.sn = ''
}

function setFieldsValue(values: Partial<AddRadar>) {
  Object.keys(values).forEach((key) => {
    formState[key] = values[key]
  })
}

defineExpose({
  visible,
  radarId,
  formState,
  setFieldsValue,
})
</script>
<style lang="less" scoped></style>
