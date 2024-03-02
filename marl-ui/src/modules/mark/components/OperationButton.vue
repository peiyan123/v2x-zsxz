<template>
  <div class="display-flex btn-container">
    <p class="title">操作按钮:</p>
    <div class="btn-content">
      <!-- <a-button class="btn" type="primary" @click="handleReset">复位</a-button> -->
      <!-- <a-radio-group
        class="btn"
        v-model:value="modeType"
        button-style="solid"
        v-if="type === 'lane'"
        @change="changeMode"
      >
        <a-radio-button value="lane">标记车道</a-radio-button>
        <a-radio-button value="arrow">标记方向</a-radio-button>
      </a-radio-group> -->
      <a-button class="btn" type="primary" @click="changeImage">换图</a-button>
      <a-button class="btn" type="primary" @click="handleDelete">选中删除</a-button>
      <!-- <a-button class="btn" type="primary" @click="handleSave" v-if="type === 'lane'">保存</a-button> -->
      <a-button class="btn" type="primary" @click="addLane" v-if="type === 'lane'">新建车道</a-button>
      <!-- <a-button class="btn" type="primary" @click="handleData">打印数据</a-button> -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, ref } from 'vue'
const emit = defineEmits(['start', 'delete', 'reset', 'save', 'getData', 'arrow', 'addLane', 'changeImage'])
const props = defineProps({
  type: { type: String, default: '' },
  selectedShape: { type: [Array, Object], default: () => [] },
})

const modeType = ref('lane')

function handleStart() {
  emit('start')
}

function handleDelete() {
  emit('delete')
}

function handleReset() {
  emit('reset')
}

function handleSave() {
  emit('save')
}

function handleData() {
  emit('getData')
}

function drawArrow() {
  emit('arrow')
}

function changeMode(event: Event) {
  if (modeType.value === 'lane') {
    emit('start')
  } else if (modeType.value === 'arrow') {
    emit('arrow')
  }
}

function addLane() {
  emit('addLane')
}

function changeImage() {
  emit('changeImage')
}
</script>
<style lang="less" scoped>
.btn-container {
  border-bottom: 1px solid rgb(240, 240, 240);
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.title {
  margin-right: 10px;
}
.btn-content {
  .btn {
    margin-right: 10px;
  }
}
</style>
