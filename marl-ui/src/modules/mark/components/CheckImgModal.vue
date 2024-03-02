<template>
  <BasicModal :width="800" @register="register" @ok="handleOk" :handleCancle="handleCancel" title="检测结果图">
    <div style="height: 350px" ref="imgRef"></div>
  </BasicModal>
</template>
<script lang="ts" setup>
import { defineEmits, onMounted, ref, unref } from 'vue'
// components
import { BasicModal, useModalInner } from '@/components/Modal'
// utils
import { ImageShowScene } from '@/thundersoft/ai-mark'

const emits = defineEmits(['register'])
const imgRef = ref()
const scene = ref()
const [register, { closeModal }] = useModalInner(({ url }) => {
  if (scene.value) {
    // scene.value.changeImage(url)
    unref(scene).destroy()
    scene.value = new ImageShowScene(imgRef.value, url)
  } else {
    scene.value = new ImageShowScene(imgRef.value, url)
  }
})
function handleOk() {
  closeModal()
  unref(scene).destroy()
}
function handleCancel() {
  unref(scene).destroy()
}
onMounted(() => {
  if (unref(scene)) {
    unref(scene).destroy()
  }
})
</script>
<style lang="less" scoped></style>
