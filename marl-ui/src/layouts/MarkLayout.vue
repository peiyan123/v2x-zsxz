<template>
  <a-layout class="default-layout">
    <a-layout>
      <DefaultHeader :hidden-menu="true" />
      <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }">
        <router-view>
          <template #default="{ Component, route }">
            <transition mode="out-in" appear name="fade-slide">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </template>
        </router-view>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import DefaultSider from './DefaultSider.vue'
import DefaultHeader from './DefaultHeader.vue'
</script>
<style lang="less" scoped>
.default-layout {
  height: 100%;
  :deep(.ant-layout-content) {
    margin: 16px !important;
  }
}

/* fade-slide */
.fade-slide-leave-active,
.fade-slide-enter-active {
  transition: all 0.3s;
}

.fade-slide-enter-from {
  opacity: 0%;
  transform: translateX(-30px);
}

.fade-slide-leave-to {
  opacity: 0%;
  transform: translateX(30px);
}
</style>
