<template>
  <a-modal v-model:visible="modalVisible" :footer="null" :closable="false">
    <div class="flex flex-col items-center justify-center" style="height: 200px">
      <a-spin size="large"></a-spin>
      <p class="text-20px">设备重启中</p>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { defineProps, computed } from 'vue'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})
const modalVisible = computed(() => props.visible)
</script>
<style lang="less" scoped></style>
