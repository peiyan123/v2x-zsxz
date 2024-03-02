<template>
  <a-layout-header class="header-content">
    <a-dropdown>
      <a class="ant-dropdown-link" @click.prevent>
        {{ langText }}
        <DownOutlined />
      </a>
      <template #overlay>
        <a-menu>
          <a-menu-item v-for="(item, index) in selectLang" :key="index" @click="changeLang(item)">
            <a href="javascript:;">{{ item }}</a>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-layout-header>
</template>
<script lang="ts" setup>
import { DownOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import { useI18n } from '@/core/hooks/useI18n'
import { createContext } from '@/core/hooks/useContext'

const selectLang = ref(['zh', 'en'])
const { changeLang, langText } = useI18n()
</script>
<style lang="less" scoped>
.header-content {
  display: flex;
  justify-content: flex-end;
}
</style>
