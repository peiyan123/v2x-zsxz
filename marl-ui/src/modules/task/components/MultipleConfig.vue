<template>
  <div class="h-full relative">
    <div class="absolute overflow-auto my-scroll scroll-wrap">
      <BasicForm @register="register">
        <template #mqtt>
          <BasicForm @register="registerMqtt" class="mqtt-form"></BasicForm>
          <!-- <template v-for="schema in mqttSchema" :key="schema.field">
          <FormItem
            :schema="schema"
            :formProps="getProps"
            :formModel="model"
            :setFormModel="(key, value) => setFormModel(model, key, value)"
          >
            <template #[item]="data" v-for="item in Object.keys($slots)">
              <slot :name="item" v-bind="data || {}"></slot>
            </template>
          </FormItem>
        </template> -->
        </template>
      </BasicForm>
    </div>
    <div class="absolute w-full bottom-15px">
      <a-divider />
      <a-button class="button" @click="handleOk" type="primary">保存</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { h, onActivated, onMounted, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
// components
import { BasicForm, useForm } from '@/components/Form'
import { message, Tooltip } from 'ant-design-vue'
// config
import { getFormSchema, MULTIPLE_LIST, mqttSchema } from './config'
// service
import * as taskApi from '@/services/api/taskApi'
import * as mecApi from '@/services/api/mecApi'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  defaultData: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => [],
  },
  isSubDevice: {
    type: Boolean,
    default: false,
  },
})
const appStore = useAppStore()
// 用于存储接口返回的数组转为type属性为key，enable属性为value的对象
// let defaultDataMap: Record<string, any> = {}
const formSchemas = getFormSchema(true)
const [register, { validate, setFieldsValue, updateSchemaInDiffTypes }] = useForm({
  schemas: cloneDeep(formSchemas),
})
const [registerMqtt, { validate: validateMqtt, setFieldsValue: setFieldsValueMqtt }] = useForm({
  schemas: mqttSchema,
  wrapperCol: {
    span: 12,
  },
})
async function handleOk() {
  const values = await validate()
  let mqttValues = null
  // 如果打开mqtt，则进行验证
  if (values.MqttAlgoDataTask) {
    mqttValues = await validateMqtt()
  }
  const resultList = []
  MULTIPLE_LIST.forEach((item: any) => {
    if (!item.slot && values[item.key] !== undefined) {
      resultList.push({ type: item.key, enable: values[item.key] === undefined ? false : values[item.key] })
    }
  })
  await taskApi.saveMultipleConfig(resultList)
  if (mqttValues) {
    // 保存mqtt设置
    await mecApi.saveMecConfig(mqttValues)
  }
  message.success('保存成功')
  appStore.setReboot(true)
  appStore.saveApplay()
}

// function changeMqtt(e) {
//   console.log(e.target.checked)
// }

function setDefaultValue() {
  const defaultValue = {}
  MULTIPLE_LIST.forEach((item) => {
    if (item.value) {
      defaultValue[item.key] = true
    }
    // defaultDataMap[item.key] = item.value || false
  })
  setFieldsValue(defaultValue)
}
/**
 * 设置新的表单项
 */
function setNewSchema(disabledMap) {
  // const hideInMainMap = {}
  // 如果是主机，则获取需要隐藏的项
  // if (!props.isSubDevice) {
  //   MULTIPLE_LIST.forEach((item: Record<string, any>) => {
  //     // 如果hideInMain为true，或者接口返回的数据中没有这个属性，则将key添加到不显示的对象中
  //     if (item.hideInMain || defaultDataMap[item.key] === undefined) {
  //       hideInMainMap[item.key] = true
  //     }
  //   })
  // }
  // 根据设备是否子设备设置表单项是否disabled
  updateSchemaInDiffTypes(
    cloneDeep(formSchemas).map((item) => {
      // item.componentProps.disabled = props.isSubDevice
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
function initData() {
  // 重置相关对象
  // defaultDataMap = {}
  // const hideInMainMap = {}
  // const disabledMap = {}
  if (props.defaultData && Array.isArray(props.defaultData)) {
    const defaultData = {} as any
    props.defaultData.forEach((item) => {
      defaultData[item.type] = item.enable
    })
    // 根据SINGLE_LIST中配置对值进行修改
    MULTIPLE_LIST.forEach((item: Record<string, any>) => {
      // 如果hideInMain为true，或者接口返回的数据中没有这个属性，则将key添加到不显示的对象中
      // if (item.hideInMain || defaultData[item.key] === undefined) {
      // if (item.hideInMain) {
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
    if (defaultData.MqttAlgoDataTask) {
      getMecConfig()
    }
  } else {
    setDefaultValue()
  }
  // setNewSchema(disabledMap)
}
async function getMecConfig() {
  const result = await mecApi.getMecConfig()
  const data = result.data
  const defaultValue = { ip: data.ip, password: data.password, port: data.port, username: data.username }
  setFieldsValueMqtt(defaultValue)
}

watch(
  () => props.defaultData,
  (val) => {
    initData()
    // setNewSchema()
  }
)
// watch(
//   () => props.isSubDevice,
//   (val) => {
//     setNewSchema()
//   }
// )
onMounted(() => {
  initData()
  // setNewSchema()
})
// onActivated(() => {
//   setNewSchema()
// })
</script>
<style lang="less" scoped>
.button {
  float: right;
}
.mqtt-form {
  :deep(.ant-form-item-label) {
    width: 180px;
  }
}
.scroll-wrap {
  height: calc(100% - 80px);
}
:deep(.color-gray) {
  color: #d9d9d9;
}
</style>
