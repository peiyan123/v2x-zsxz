<template>
  <div>
    <a-modal
      width="1000px"
      v-model:visible="visible"
      title="预览"
      @ok="handleOk"
      @cancel="handleCancel"
      okText="确认"
      cancelText="取消"
    >
      <div id="canvas-content">
        <canvas width="1920" height="1080" class="ipc-canvas"></canvas>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineExpose, watch, onMounted, onUnmounted } from 'vue'
const visible = ref(false)
let player = null
const rtspUrl = ref('')

watch(
  () => visible.value,
  (newVal) => {
    if (newVal) {
      const canvas = document.getElementsByClassName('ipc-canvas')[0]
      // 10.4.15.223,location.hostname
      let hostName = process.env.NODE_ENV === 'development' ? '10.4.213.248' + ':8082' : location.host + '/ws/'
      // eslint-disable-next-line no-undef
      player = new JSMpeg.Player(`ws://${hostName}?clientId=${getUuid()}&rtsp=${rtspUrl.value}`, {
        canvas: canvas,
        audio: false,
        onSourceEstablished: (source, data) => {
          console.log(source, data)
        },
      })
    }
  },
  {
    flush: 'post',
  }
)

function handleOk() {}

function handleCancel() {
  player.destroy()
  player = null
  visible.value = false
  const canvasContent = document.getElementById('canvas-content')
  const canvas = document.createElement('canvas')
  canvas.className = 'ipc-canvas'
  canvas.width = 1920
  canvas.height = 1080
  canvasContent.appendChild(canvas)
}

function getUuid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()
}

onUnmounted(() => {})

defineExpose({
  visible,
  rtspUrl,
})
</script>
<style lang="less" scoped>
.ipc-canvas {
  width: 100%;
  height: 350px;
}
</style>
