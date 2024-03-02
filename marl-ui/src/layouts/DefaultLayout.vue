<template>
  <a-layout class="default-layout">
    <DefaultSider v-if="!route.path.includes('/road/index')" />
    <a-layout v-if="!route.path.includes('/road/index')">
      <DefaultHeader :hidden-menu="false" />
      <a-layout-content
        class="my-scroll"
        :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <router-view>
          <template #default="{ Component, route }">
            <transition mode="out-in" appear name="fade-slide">
              <keep-alive>
                <component :is="Component" :key="route.fullPath" />
              </keep-alive>
            </transition>
          </template>
        </router-view>
      </a-layout-content>
    </a-layout>
    <router-view v-if="route.path.includes('/road/index')">
      <template #default="{ Component, route }">
        <transition mode="out-in" appear name="fade-slide">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </template>
    </router-view>
  </a-layout>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { watch } from 'vue'
// components
import DefaultSider from './DefaultSider.vue'
import DefaultHeader from './DefaultHeader.vue'

const route = useRoute()
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
