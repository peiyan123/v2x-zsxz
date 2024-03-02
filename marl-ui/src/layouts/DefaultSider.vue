<template>
  <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible class="sider-wrap">
    <div class="logo">算法服务</div>
    <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" theme="dark" mode="inline"  @openChange="onOpenChange">
      <template v-for="item in menuList">
        <a-sub-menu v-if="item.children && item.children.length > 1 && !item.hiddenMenu" :key="item.title">
          <template v-slot:title>
            <setting-outlined /><span>{{ item.title }}</span>
          </template>
          <a-menu-item v-for="a in item.children" :key="a.title" @click="goPath(a.path)">
            <setting-outlined />
            {{ a.title }}
          </a-menu-item>
        </a-sub-menu>
        <template v-if="item.children && item.children.length == 1 && !item.hiddenMenu">
          <a-menu-item v-for="a in item.children" :key="a.title" @click="goPath(a.path)">
            <setting-outlined />
            <span>{{ a.title }}</span>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </a-layout-sider>
</template>
<script lang="ts" setup>
import { UserOutlined, VideoCameraOutlined, UploadOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { ref, watch, computed } from 'vue'
import { useToggle } from '@/core/hooks/useToggle'
import { usePermissionStore } from '@/store/modules/permission'
import { RouteLocationNormalizedLoaded, useRouter } from 'vue-router'

const permissionStore = usePermissionStore()
const { push, currentRoute } = useRouter()

const menuList = computed(() => permissionStore.getFrontMenuList)

const { collapsed } = useToggle()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])
const openKeysLocal = ref<string[]>([])
watch(
  () => currentRoute.value,
  (newVal: RouteLocationNormalizedLoaded | any) => {
    selectedKeys.value = [newVal.matched[1]?.meta?.title]
  },
  { immediate: true }
)
function onOpenChange(openKey: string[]) {
  const latestOpenKey = openKey.find(key => openKeysLocal.value.indexOf(key) === -1);
  if (menuList.value.map((v) => {
    return v.title
  }).indexOf(latestOpenKey!) === -1) {
    openKeys.value = openKey;
    openKeysLocal.value = openKey;
  } else {
    openKeys.value = latestOpenKey ? [latestOpenKey] : [];
    openKeysLocal.value = latestOpenKey ? [latestOpenKey] : [];
  }
  push(menuList.value.find((v) => v.title == openKeys.value[0]).redirect)
};
function goPath(path: string) {
  console.log(path)
  push(path)
}
</script>
<style lang="less">
.logo {
  position: relative;
  height: 50px;
  line-height: 50px;
  padding-left: 54px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  // background: url('~@/assets/thunder-soft.png') no-repeat 50% 50%;
  // background-size: 85% 75%;
  background-color: #2c315a;
  &::before {
    display: block;
    content: '';
    position: absolute;
    top: 10px;
    left: 15px;
    width: 30px;
    height: 30px;
    // background: url('~@/assets/cm-logo.png') no-repeat 100% 100%;
    background-image: url('~@/assets/cm-logo.png');
    background-size: 100% 100%;
  }
}
.ant-layout-sider.sider-wrap {
  max-width: 220px !important;
  min-width: 220px !important;
  width: 220px !important;
}
</style>
