<template>
  <div>test</div>
</template>
<script lang="ts" setup>
import { defineComponent, getCurrentInstance, onMounted, ref, defineExpose } from 'vue'
// import { createLoading } from '@/core/hooks/useLoading'

// export default defineComponent({
// name: 'Test',
// setup() {
// const { setLoading } = createLoading()
// setLoading(true)
const onTest = () => {
  console.log(1111)
}

// defineExpose({
//   onTest,
// })

const name = ref('lgj')

// onMounted(() => {
//   console.log('parent', getCurrentInstance()?.parent)
// })

// return {
//   onTest,
//   name,
// }
// },
// })
</script>
<style lang="less" scoped></style>
