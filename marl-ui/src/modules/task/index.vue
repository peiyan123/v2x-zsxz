<template>
  <div class="h-full">
    <a-breadcrumb class="bread-crumb" separator="">
      <a-breadcrumb-item>当前位置</a-breadcrumb-item>
      <a-breadcrumb-separator>:</a-breadcrumb-separator>
      <a-breadcrumb-item>Task管理</a-breadcrumb-item>
    </a-breadcrumb>
    <a-tabs v-model:activeKey="currentOperation" class="tab-container">
      <a-tab-pane tab="单路任务配置列表" key="single">
        <SingleConfig :defaultData="defaultData.single" :isSubDevice="isSubDevice" />
      </a-tab-pane>
      <a-tab-pane tab="多路任务配置列表" key="multiple">
        <MultipleConfig :defaultData="defaultData.multiple" :isSubDevice="isSubDevice" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script lang="ts" setup>
import { onActivated, ref } from 'vue'
// components
import SingleConfig from './components/SingleConfig.vue'
import MultipleConfig from './components/MultipleConfig.vue'
// services
import * as taskApi from '@/services/api/taskApi'
// hooks
import { useSubDevice } from '../group/hooks/useSubDevice'

const currentOperation = ref('single')
const defaultData: Record<string, any> = ref({})
const { isSubDevice } = useSubDevice()

async function getTaskConfig() {
  const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  const { data } = await taskApi.getTaskConfig(tab)
  defaultData.value = data
}
onActivated(() => {
  getTaskConfig()
})
</script>
<style lang="less" scoped>
.tab-container {
  height: 100%;
  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>
