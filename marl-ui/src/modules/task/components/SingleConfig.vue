<template>
  <BasicForm @register="register"> </BasicForm>
  <a-divider />
  <a-button class="button" @click="handleOk" type="primary">保存</a-button>
</template>
<script lang="ts" setup>
import { h, onActivated, onMounted, ref, watch } from 'vue'
// components
import { BasicForm, useForm } from '@/components/Form'
import { message, Tooltip } from 'ant-design-vue'
// config
import { getFormSchema, SINGLE_LIST } from './config'
// service
import * as cameraApi from '@/services/api/cameraApi'
import * as taskApi from '@/services/api/taskApi'
import { cloneDeep } from 'lodash'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  defaultData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => [],
  },
  // 是否分布式子设备
  isSubDevice: {
    type: Boolean,
    default: false,
  },
})
const appStore = useAppStore()
const formSchemas = getFormSchema()
const [register, { validate, setFieldsValue, updateSchemaInDiffTypes, getFieldsValue }] = useForm({
  schemas: cloneDeep(formSchemas),
})
async function handleOk() {
  const values = await validate()
  const resultList = []
  SINGLE_LIST.forEach((item) => {
    if (values[item.key] !== undefined) {
      resultList.push({
        type: item.key,
        enable: values[item.key] === undefined ? false : values[item.key],
      })
    }
  })
  await taskApi.saveSingleConfig(resultList)
  message.success('保存成功')
  appStore.setReboot(true)
  appStore.saveApplay()
}
async function setCameraAlgoTask() {
  const {
    data: { total },
  } = await cameraApi.getCameraList({ current: 1, pageSize: 10 })
  if (total > 0) {
    setFieldsValue({ CameraAlgoTask: true })
  } else {
    setFieldsValue({ CameraAlgoTask: false })
  }
}

function initData() {
  // const hideInMainMap = {}
  // const disabledMap = {}
  if (props.defaultData && Array.isArray(props.defaultData)) {
    const defaultData = {}
    props.defaultData.forEach((item) => {
      defaultData[item.type] = item.enable
    })
    // 根据SINGLE_LIST中配置对值进行修改
    SINGLE_LIST.forEach((item: Record<string, any>) => {
      // 如果hideInMain为true，或者接口返回的数据中没有这个属性，则将key添加到不显示的对象中
      // if (item.hideInMain || defaultData[item.key] === undefined) {
      //   hideInMainMap[item.key] = true
      // }
      // if (defaultData[item.key] === undefined) {
      //   disabledMap[item.key] = true
      // }
      // 如果SINGLE_LIST中有value属性，则修改为value值
      if (item.value !== undefined) {
        defaultData[item.key] = item.value
      } else if (defaultData[item.key] === undefined && item.default !== undefined) {
        // 如果接口返回数据中没有某个task，且SINGLE_LIST中配置了default属性，则设置task为default值
        defaultData[item.key] = item.default
      }
    })
    setFieldsValue(defaultData)
  } else {
    const defaultData = {}
    // 如果没有初始化数据，则根据SINGLE_LIST中配置对值进行修改
    SINGLE_LIST.forEach((item: Record<string, any>) => {
      // 如果SINGLE_LIST中有value属性，则修改为value值
      if (item.value !== undefined) {
        defaultData[item.key] = item.value
      }
    })
    setFieldsValue(defaultData)
  }
  // // 更新表单项以隐藏不显示的项
  // setNewSchema(disabledMap)
}
/**
 * 设置新的表单项
 */
function setNewSchema(disabledMap) {
  updateSchemaInDiffTypes(
    cloneDeep(formSchemas).map((item) => {
      // if (!item.slot) {
      //   // 过滤掉需要隐藏的项
      //   item.ifShow = !hideInMainMap[item.field]
      // }
      // 如果配置文件中不存在此选项，则禁用不能勾选，且label显示为灰色并有Tooltip提示
      if (disabledMap[item.field]) {
        item.componentProps.disabled = disabledMap[item.field]
        item.label = h(Tooltip, { title: '该项在配置文件中不存在' }, [h('span', { class: 'color-gray' }, item.label)])
      }
      return item
    })
  )
}
watch(
  () => props.defaultData,
  (val) => {
    initData()
  }
)
onActivated(() => {
  // setCameraAlgoTask()
})
</script>
<style lang="less" scoped>
.button {
  float: right;
}
:deep(.color-gray) {
  color: #d9d9d9;
}
</style>
