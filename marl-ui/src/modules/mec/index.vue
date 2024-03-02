<template>
  <div>
    <a-breadcrumb class="bread-crumb" separator="">
      <a-breadcrumb-item>当前位置</a-breadcrumb-item>
      <a-breadcrumb-separator>:</a-breadcrumb-separator>
      <a-breadcrumb-item>MEC设备管理</a-breadcrumb-item>
    </a-breadcrumb>
    <a-tabs v-model:activeKey="currentOperation" class="tab-container">
      <a-tab-pane tab="设备配置" key="config">
        <DeviveConfig />
      </a-tab-pane>
      <!--<a-tab-pane tab="运行状态" key="status">
        <RunningStatus :isShow="currentOperation === 'status'" />
      </a-tab-pane>-->
      <!-- <a-tab-pane tab="测试MarkDown" key="markdown">
        <MarkDown />
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
// components
import DeviveConfig from './components/DeviceConfig.vue'
import RunningStatus from './components/RunningStatus.vue'
import MarkDown from './components/MarkDown.vue'

const currentOperation = ref('config')
</script>
<style lang="less" scoped>
.tab-container {
  height: 100%;
  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
</style>
