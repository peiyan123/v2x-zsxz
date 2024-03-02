<template>
  <div>
    <div class="flex justify-between">
      <span class="mr-4">{{ title }}</span>
      <span>已使用{{ usage }}GB/{{ total }}GB （{{ percent }}%） </span>
    </div>
    <Progress :percent="percent" status="active" :show-info="false" />
  </div>
</template>

<script setup lang="ts">
import { computed } from '@vue/reactivity'
import { Progress } from 'ant-design-vue'
// utils
import { handleDecimal } from '@/utils'

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  usage: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
  },
})
const percent = computed(() => handleDecimal((props.usage / props.total) * 100, 1))
</script>

<style></style>
