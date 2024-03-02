<template>
  <div class="mark-container">
    <a-row type="flex" class="row-container">
      <a-col :span="6" class="left">
        <OperationPanel
          :laneList="laneList"
          type="lane"
          :selectedShape="selectedShape"
          @changeLane="changeLane"
          @delLane="delLane"
          @addLane="addLane"
          @editLane="editLane"
          @addLine="addLine"
          @editLine="editLine"
        />
      </a-col>
      <a-col :span="18" class="right">
        <!-- <div class="operation">
          <a-button type="primary" class="mb-10px">
            <template #icon>
              <RedoOutlined @click="changeImage" />
            </template>
          </a-button>
          <a-button type="primary">
            <template #icon>
              <QuestionCircleOutlined @click="handleHelp" />
            </template>
          </a-button>
        </div> -->
        <CommonOperations @changeImage="changeImage" @resetCanvas="resetCanvas" />
        <div class="canvasContainer" ref="handleRef"></div>
      </a-col>
    </a-row>
  </div>
  <a-modal
    width="500px"
    v-model:visible="visible"
    :title="currentItemId ? '编辑车道' : '新建车道'"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="确认"
    cancelText="取消"
  >
    <a-form ref="laneModalRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }" :model="formState" :rules="rules">
      <a-form-item label="车道ID" name="id">
        <a-input type="number" v-model:value="formState.id" :disabled="!!currentItemId" />
      </a-form-item>
      <a-form-item label="车道类型" name="laneType">
        <a-select v-model:value="formState.laneType">
          <a-select-option v-for="(item, index) in laneTypeData" :key="index" :value="item.value">{{
            item.label
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="交叉口位置" name="lanePosition">
        <a-select v-model:value="formState.lanePosition">
          <a-select-option v-for="(item, index) in installPosition" :key="index" :value="item.value">{{
            item.label
          }}</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
  <a-modal
    width="500px"
    v-model:visible="lineModalVisible"
    :title="currentItemId ? '编辑实线' : '新建实线'"
    @ok="handleLineOk"
    @cancel="handleLineCancel"
    okText="确认"
    cancelText="取消"
  >
    <a-form
      ref="lineModalRef"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 16 }"
      :model="lineFormState"
      :rules="rules"
    >
      <a-form-item label="实线ID" name="id">
        <a-input type="number" v-model:value="lineFormState.id" :disabled="!!currentItemId" />
      </a-form-item>
      <a-form-item label="描述" name="lineDescription">
        <a-input v-model:value="lineFormState.lineDescription" maxlength="50" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, defineExpose, unref, reactive, watch, defineProps, defineEmits } from 'vue'
// components
import { SegmentationScene3 } from '@/thundersoft/ai-mark'
import OperationPanel from './OperationPanel.vue'
import CommonOperations from './CommonOperations.vue'
import { useMarkStore } from '@/store/modules/mark'
import { RedoOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
// datas
import { images } from './access-image'
import { laneTypeData } from '../config'
import { installPosition } from '../../camera/data'
// utils
import { groupBy, find, cloneDeep } from 'lodash'
import { randomColor } from '@/utils'
// type
import { LaneList, AddLane, AddLine } from '../type'
import { RuleObject } from 'ant-design-vue/lib/form/interface'
// hooks
import { useMark } from '../hooks/useMark'
import useForm from 'ant-design-vue/lib/form/useForm'
// enum
import { LaneOperation } from '@/core/enums/markEnum'

import type { FormInstance } from 'ant-design-vue'
import { Subscription } from 'rxjs/internal/Subscription'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  currentPanel: { type: String, default: 'area' },
})
const emits = defineEmits(['openHelp'])

const { scene, handleRef, changeImage, showImageUrl, initImage, resetCanvas } = useMark()

const formState = reactive({
  id: '',
  laneType: '',
  lanePosition: '',
})
const lineFormState = reactive({
  id: '',
  lineDescription: '',
})
const rules = reactive({
  id: [
    { required: true, message: '请输入ID', trigger: 'change' },
    { validator: validateId, trigger: 'change' },
  ],
  laneType: [{ required: true, message: '请选择车道类型', trigger: 'change' }],
  lanePosition: [{ required: true, message: '请选择交叉口位置', trigger: 'change' }],
  lineDescription: [{ required: true, message: '请输入描述', trigger: 'change' }],
})
// const { validate, validateInfos, resetFields, clearValidate } = useForm(formState, rules)
const laneModalRef = ref<FormInstance>()
const lineModalRef = ref<FormInstance>()
const visible = ref<boolean>(false)
const lineModalVisible = ref<boolean>(false)
const markStore = useMarkStore()
const selectedShape = ref()
const laneList = ref<Array<LaneList>>([])
const currentItemId = ref<string>('')
const destroyEvent: (Subscription | undefined)[] = []
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      setTimeout(() => {
        unref(scene).changeImage(showImageUrl.value)
      }, 50)
    }
    unref(scene).toggleShowAndHide(val)
  }
)

onMounted(() => {
  // setData()
  scene.value = new SegmentationScene3(handleRef.value)
  unref(scene).toggleShowAndHide(props.isOpen)
  // 加载图片
  unref(scene).reload(showImageUrl.value, [])
  setData()
  destroyEvent.push(
    // 注册标注图形选中事件触发的方法
    unref(scene).selectShapeEvent.subscribe((shapeData) => {
      const { name, type } = shapeData
      const typeStr = type + ''
      // 遍历左侧列表，找到要高亮按钮所在的元素，并设置选中按钮对应的key
      for (let index = 0; index < laneList.value.length; index++) {
        const item = laneList.value[index]
        if (item.type + '' === typeStr) {
          for (var key in LaneOperation) {
            // 设置选中按钮的key
            if (LaneOperation[key] === name) {
              item.currentOperation = key
              break
            }
          }
        } else {
          // 其他元素取消选中
          item.currentOperation = ''
        }
      }
      // 清空之前选择要创建的形状
      unref(scene).clearCreateConfi()
    })
  )
})

// 回显数据
function setData() {
  const laneData = cloneDeep(toRaw(markStore.laneData))
  if (laneData && laneData.length) {
    unref(scene).setData(laneData)

    const result = groupBy(laneData, (item) => {
      return item.type
    })
    laneList.value = Object.keys(result).map((item) => {
      return {
        color: result[item][0].color,
        type: item,
        currentOperation: '',
        label: '',
        laneType: result[item][0].laneType,
        lanePosition: result[item][0].lanePosition,
        // 线类型
        lineType: result[item][0].lineType,
        // 实线描述
        lineDescription: result[item][0].lineDescription,
      }
    })
  }
}

function changeLane(e: { operation: string; index: number }) {
  unref(scene).drawShape({ ...laneList.value[e.index], name: LaneOperation[e.operation] })
  // if (e.operation === 'area') {
  //   unref(scene).drawArea({ ...laneList.value[e.index], name: LaneOperation[e.operation] })
  // } else if (e.operation === 'flow') {
  //   unref(scene).drawFlow({ ...laneList.value[e.index], name: LaneOperation[e.operation] })
  // } else if (e.operation === 'direction') {
  //   unref(scene).drawArrow({ ...laneList.value[e.index], name: LaneOperation[e.operation] })
  // } else if (e.operation === 'brokenLine') {
  //   unref(scene).drawBrokenLine({ ...laneList.value[e.index], name: LaneOperation[e.operation] })
  // }
}
function addLane() {
  visible.value = true
  currentItemId.value = ''
  formState.id = getDefaultId()
}

function editLane(item: LaneList) {
  visible.value = true
  currentItemId.value = item.type
  formState.id = item.type
  formState.lanePosition = item.lanePosition
  formState.laneType = item.laneType
}

function delLane(e: { lane: LaneList; index: number }) {
  unref(scene).deleteLane(e.lane.type)
  laneList.value.splice(e.index, 1)
}
/**
 * 获取默认设置的id值
 * @return {string} id值
 */
function getDefaultId() {
  let maxId = 0
  // 找到最大值
  if (laneList.value.length > 0) {
    maxId = Math.max.apply(
      null,
      laneList.value.map((x) => x.type)
    )
  }
  // 返回最大值加1
  return maxId + 1 + ''
}

/**
 * 打开新建实线的弹框
 */
function addLine() {
  lineModalVisible.value = true
  currentItemId.value = ''
  lineFormState.id = getDefaultId()
}
/**
 * 打开编辑实线的弹框
 * @param item 待编辑的数据
 */
function editLine(item: LaneList) {
  lineModalVisible.value = true
  currentItemId.value = item.type
  lineFormState.id = item.type
  lineFormState.lineDescription = item.lineDescription
}

function handleOk() {
  laneModalRef.value.validate().then((val: AddLane) => {
    if (currentItemId.value) {
      const result = find(unref(laneList), (a) => a.type == currentItemId.value)
      result.laneType = val.laneType
      result.lanePosition = val.lanePosition
    } else {
      laneList.value.push({
        color: randomColor(),
        type: val.id,
        label: '',
        currentOperation: '',
        laneType: val.laneType,
        lanePosition: val.lanePosition,
        // 线类型
        lineType: '',
      })
    }
    laneModalRef.value.resetFields()
    visible.value = false
  })
}
function handleCancel() {
  laneModalRef.value.resetFields()
}
/**
 * 新增实线弹框确定按钮触发方法
 */
function handleLineOk() {
  lineModalRef.value.validate().then((val: AddLine) => {
    if (currentItemId.value) {
      const result = find(unref(laneList), (a) => a.type == currentItemId.value)
      result.lineDescription = val.lineDescription
    } else {
      laneList.value.push({
        color: randomColor(),
        type: val.id,
        label: '',
        currentOperation: '',
        laneType: '',
        lanePosition: '',
        lineDescription: val.lineDescription,
        lineType: 'brokenLine',
      })
    }
    lineModalRef.value.resetFields()
    lineModalVisible.value = false
  })
}
/**
 * 新增实线弹框取消按钮触发方法
 */
function handleLineCancel() {
  lineModalRef.value.resetFields()
}

async function validateId(_rule: RuleObject, value: string) {
  if (currentItemId.value) return
  if (Number(value) > 255 || Number(value) < 0 || value.includes('.')) {
    return Promise.reject('请输入0-255之间的整数')
  }
  if (
    unref(laneList).some((item) => {
      return value == item.type
    })
  ) {
    return Promise.reject('已存在相同ID')
  }
  return Promise.resolve()
}

function handleGetData() {
  const data: any[] = unref(scene).getData()
  unref(laneList).forEach((item) => {
    data.forEach((a) => {
      if (a.type == item.type) {
        a.laneType = item.laneType
        a.lanePosition = item.lanePosition
        // 实线描述
        a.lineDescription = item.lineDescription
      }
    })
  })
  return data
}
function handleHelp() {
  emits('openHelp')
}
defineExpose({
  handleGetData,
  reloadImg: initImage,
})
</script>
<style lang="less" scoped>
.mark-container {
  height: 100%;
}
.row-container {
  height: 96%;
  .left {
    background: #eef3f3;
    border-radius: 10px;
    padding: 30px;
    height: 100%;
  }
  .right {
    height: 100%;
    padding: 30px 30px 30px 80px;
    position: relative;
    .operation {
      position: absolute;
      top: 0;
      left: 20px;
      display: flex;
      flex-direction: column;
    }
  }
}
.canvasContainer {
  height: 100%;
}
</style>
