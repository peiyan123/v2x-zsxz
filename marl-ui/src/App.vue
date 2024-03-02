<template>
  <a-config-provider :locale="localeLang">
    <AppProvider>
      <a-spin :spinning="globalLoading" wrapperClassName="global-loading">
        <router-view></router-view>
      </a-spin>
    </AppProvider>
  </a-config-provider>
</template>

<script lang="ts" setup>
import { useAppStore } from '@/store/modules/app'
import * as cameraApi from '@/services/api/cameraApi'
import { computed } from 'vue'

import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enGB from 'ant-design-vue/es/locale/en_GB'
import jaJP from 'ant-design-vue/es/locale/ja_JP'

import { AppProvider } from '@/components/Application'

import { useI18n } from './core/hooks/useI18n'

import { useLoading } from './core/hooks/useLoading'
import { useEventListener } from '@/core/hooks/event/useEventListener'
const { globalLoading } = useLoading()
const { locale } = useI18n()
const localeLang = computed(() => {
  // if (locale.value === 'en') {
  //   return enGB
  // } else if (locale.value === 'ja') {
  //   return jaJP
  // } else {
  return zhCN
  // }
})

// 每次刷新页面后，获取是否需要重启应用的提示
let isReboot = localStorage.getItem('isReboot')
if (isReboot) {
  const appStore = useAppStore()
  appStore.setReboot(isReboot === 'true' ? true : false)
}

window.onload = () => {
  console.log('onload is success')
}
// 监听窗口聚焦事件，触发则代表窗口为当前正显示的窗口，则更新isReboot数据
useEventListener({
  el: window,
  name: 'focus',
  listener: () => {
    const appStore = useAppStore()
    let isReboot = localStorage.getItem('isReboot')
    appStore.setReboot(isReboot === 'true' ? true : false)
  },
})
</script>

<style lang="less">
@import url('~@/styles/index');
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
#canvas-content {
  canvas {
    width: 100%;
    height: 350px;
  }
}
.global-loading {
  height: 100%;
  .ant-spin-container {
    height: 100%;
  }
}
</style>
