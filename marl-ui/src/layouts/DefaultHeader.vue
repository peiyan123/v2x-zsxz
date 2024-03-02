<template>
  <a-layout-header class="layout-header">
    <a-row justify="space-between items-center" class="w-full h-full">
      <a-col class="flex">
        <!-- <menu-unfold-outlined :hidden="hiddenMenu" v-if="collapsed" class="trigger" @click="setCollapsed(!collapsed)" />
        <menu-fold-outlined :hidden="hiddenMenu" v-else class="trigger" @click="setCollapsed(!collapsed)" /> -->
        <div class="flex items-center ml-20px text-red-500" v-if="appStore.isReboot1 || appStore.isReboot2 || appStore.isReboot3" >
          <ExclamationCircleOutlined class="mr-5px" />
          设备配置有变动,重启应用生效
        </div>
      </a-col>
      <!-- <a-col class="title"> 中科创达V2X平台 </a-col> -->
      <a-col>
        <a-dropdown>
          <img class="header-img" src="@/assets/header.jpeg" />
          <template #overlay>
            <a-menu>
              <a-menu-item>
                <a href="javascript:;" @click="logout"> 登出 </a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-col>
    </a-row>
  </a-layout-header>
</template>
<script lang="ts" setup>
import { PropType, defineProps } from 'vue'
// components
import { MenuUnfoldOutlined, MenuFoldOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
// hooks
import { useToggle } from '@/core/hooks/useToggle'
import { useTheme } from '@/core/hooks/useTheme'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
// servers
import * as userApi from '@/services/api/userApi'

defineProps({
  hiddenMenu: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
})
const { collapsed, setCollapsed } = useToggle()
const [_, changeColor] = useTheme()
const { push } = useRouter()
const appStore = useAppStore()

function changeTheme(color: string) {
  window.less.modifyVars({
    '@primary-color': color,
  })
  changeColor(color)
}

async function logout() {
  await userApi.logout()
  localStorage.setItem('token', '')
  push('/login')
}
</script>
<style lang="less" scoped>
.trigger {
  font-size: 18px;
  line-height: 64px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}
.layout-header {
  height: 50px;
  line-height: 50px;
  padding: 0 24px !important;
  background: #324675;
}
.title {
  font-size: 35px;
  background-color: #342cab;
}
.header-img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
}
</style>
