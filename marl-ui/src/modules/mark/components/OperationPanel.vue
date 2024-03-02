<template>
  <div class="operation-panel my-scroll">
    <div v-if="type == 'camera'">
      <div class="flex items-center">
        <span class="text-18px">标定方式：</span>
        <a-radio-group v-model:value="cameraInfo.markType" button-style="solid" @change="changeMarkType">
          <a-radio-button value="vehicle">车标定</a-radio-button>
          <a-radio-button value="man">人工标定</a-radio-button>
        </a-radio-group>
      </div>
      <a-divider />
      <!-- <div class="flex justify-between">
        <span class="text-18px mb-0.5">标定模式</span>
        <a-radio-group v-model:value="cameraInfo.cameraMode" button-style="solid">
          <a-radio-button value="LL">经纬度</a-radio-button>
          <a-radio-button value="WORLD">世界坐标</a-radio-button>
        </a-radio-group>
      </div> -->
      <div v-show="cameraInfo.markType === 'vehicle'" class="mt-25px">
        <a-upload
          :beforeUpload="beforeUploadBin"
          :maxCount="1"
          :fileList="cameraInfo.fileList"
          @remove="handleRemove"
          @download="downloadUploadFile"
        >
          <a-button type="primary">
            <upload-outlined></upload-outlined>
            上传车标定文件
          </a-button>
          <template #itemRender="{ file, actions }"
            ><div class="flex justify-between mt-10px text-18px">
              <div>
                <a-space
                  ><PaperClipOutlined />
                  <span :style="file.status === 'error' ? 'color: red' : ''">{{ file.name }}</span>
                </a-space>
              </div>
              <div>
                <a-space
                  ><a href="javascript:;" @click="actions.download"><DownloadOutlined /></a>
                  <a href="javascript:;" @click="actions.remove"><DeleteOutlined /></a>
                </a-space>
              </div></div
          ></template>
        </a-upload>
      </div>
      <div v-show="cameraInfo.markType === 'man'" class="mt-25px">
        <div class="flex justify-between mt-10px">
          <span class="text-18px mb-0.5">是否畸变</span>
          <a-switch
            v-model:checked="cameraInfo.isdistort"
            :checkedChildren="'是'"
            :unCheckedChildren="'否'"
            :checkedValue="'distort'"
            :unCheckedValue="'undistort'"
            @change="changeDistort"
          />
        </div>
        <p class="info text-18px mb-0.5" v-if="cameraInfo.cameraMode == 'LL'">传感器安装精确位置（中心点）</p>
        <div class="info-content1" v-if="cameraInfo.cameraMode == 'LL'">
          <a-form ref="cameraCenterRef" :model="cameraInfo.center" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
            <a-row>
              <!-- <a-col span="2">
              <a-form-item label=""></a-form-item>
            </a-col> -->
              <a-col span="12">
                <a-form-item
                  name="longitude"
                  :labelCol="{ span: 8 }"
                  :wrapperCol="{ span: 16 }"
                  label="经度"
                  :rules="[{ validator: validateCenterLong, trigger: 'change' }]"
                >
                  <a-input
                    v-model:value="cameraInfo.center.longitude"
                    @change="(e) => changeCenterLongOrLat(e, 'latitude')"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span="12">
                <a-form-item
                  :rules="[{ validator: validateCenterLat, trigger: 'change' }]"
                  :labelCol="{ span: 9 }"
                  :wrapperCol="{ span: 15 }"
                  label="纬度"
                  name="latitude"
                >
                  <a-input
                    v-model:value="cameraInfo.center.latitude"
                    @change="(e) => changeCenterLongOrLat(e, 'longitude')"
                  ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="info-content">
          <div class="flex justify-between">
            <span class="text-18px mb-0.5">内参数据</span>
            <a-button @click="handleCanEditInData" type="primary" class="mr-10px">编辑</a-button>
          </div>
          <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
            <a-form-item>
              <a-textarea :maxlength="500" :disabled="!canEditInData" :rows="3" v-model:value="cameraInfo.inData" />
            </a-form-item>
          </a-form>
        </div>

        <p class="info text-18px mb-0.5 flex justify-between">
          <span>标定点</span>
          <!-- <a-button type="primary" @click="checkData">数据检测</a-button> -->
        </p>
        <div class="info-content">
          <a-form ref="cameraPointerRef" :model="cameraPointer" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
            <div v-for="(item, index) in cameraPointer.crossList" :key="index">
              <!-- <span class="text-17px">点{{ index + 1 }}</span> -->
              <a-row>
                <a-col span="3">
                  <a-form-item label="">
                    <span class="text-17px">点{{ item.id }}</span>
                  </a-form-item>
                </a-col>
                <a-col span="9">
                  <a-form-item
                    :name="['crossList', index, 'lon']"
                    :labelCol="{ span: 7 }"
                    :wrapperCol="{ span: 17 }"
                    label="经度"
                    :rules="[
                      { validator: (rule, value) => validatePointLong(rule, value, index, 'lat'), trigger: 'change' },
                    ]"
                  >
                    <a-input
                      v-model:value="item.lon"
                      :disabled="cameraInfo.cameraMode == 'WORLD'"
                      @change="(e) => changePointLongOrLat(e, index, 'lat')"
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span="12">
                  <a-form-item
                    :name="['crossList', index, 'lat']"
                    :rules="[
                      { validator: (rule, value) => validatePointLat(rule, value, index, 'lon'), trigger: 'change' },
                    ]"
                    :labelCol="{ span: 11 }"
                    :wrapperCol="{ span: 13 }"
                    label="纬度"
                  >
                    <a-input
                      v-model:value="item.lat"
                      :disabled="cameraInfo.cameraMode == 'WORLD'"
                      @change="(e) => changePointLongOrLat(e, index, 'lon')"
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <!-- <a-col span="3">
                <a-form-item label=""></a-form-item>
              </a-col> -->
                <a-col span="12">
                  <a-form-item
                    :name="['crossList', index, 'worldX']"
                    :labelCol="{ span: 11 }"
                    :wrapperCol="{ span: 13 }"
                    label="世界坐标X"
                    :rules="[
                      {
                        validator: (rule, value) => validatePointLong(rule, value, index, 'worldY'),
                        trigger: 'change',
                      },
                    ]"
                  >
                    <a-input
                      v-model:value="item.worldX"
                      :disabled="cameraInfo.cameraMode == 'LL'"
                      @change="(e) => changePointLongOrLat(e, index, 'worldY')"
                    ></a-input>
                  </a-form-item>
                </a-col>
                <a-col span="12">
                  <a-form-item
                    :name="['crossList', index, 'worldY']"
                    :rules="[
                      { validator: (rule, value) => validatePointLat(rule, value, index, 'worldX'), trigger: 'change' },
                    ]"
                    :labelCol="{ span: 11 }"
                    :wrapperCol="{ span: 13 }"
                    label="世界坐标Y"
                  >
                    <a-input
                      v-model:value="item.worldY"
                      :disabled="cameraInfo.cameraMode == 'LL'"
                      @change="(e) => changePointLongOrLat(e, index, 'worldX')"
                    ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <!-- <a-col span="3">
                <a-form-item label=""></a-form-item>
              </a-col> -->
                <a-col span="12">
                  <a-form-item :labelCol="{ span: 11 }" :wrapperCol="{ span: 13 }" label="坐标X">
                    <a-input v-model:value="item.point[0].source.x" :disabled="true"></a-input>
                  </a-form-item>
                </a-col>
                <a-col span="12">
                  <a-form-item :labelCol="{ span: 11 }" :wrapperCol="{ span: 13 }" label="坐标Y">
                    <a-input v-model:value="item.point[0].source.y" :disabled="true"></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-form>
        </div>
        <div class="info-content1">
          <p class="text-18px mb-0.5">外参数据</p>
          <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
            <a-form-item label="">
              <a-textarea :readonly="true" :rows="5" v-model:value="cameraInfo.outData" />
            </a-form-item>
          </a-form>
        </div>
        <div class="info-content1" v-if="cameraPointer.crossList.length > 1">
          <p class="text-18px mb-0.5">起始位置</p>
          <a-form
            ref="startEndPointsRef"
            :model="cameraInfo.startEnd"
            :label-col="{ span: 0 }"
            :wrapper-col="{ span: 24 }"
            :labelCol="{ span: 10 }"
            :wrapperCol="{ span: 12 }"
          >
            <a-row>
              <a-col span="12">
                <a-form-item
                  name="startPointId"
                  label="开始位置"
                  :rules="[{ required: true, message: '请选择开始位置' }]"
                >
                  <a-select v-model:value="cameraInfo.startEnd.startPointId">
                    <a-select-option v-for="(item, index) in cameraPointer.crossList" :key="index" :value="item.shapeId"
                      >点{{ item.id }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col span="12">
                <a-form-item
                  name="endPointId"
                  label="结束位置"
                  :rules="[{ required: true, message: '请选择结束位置', trigger: 'change' }]"
                >
                  <a-select v-model:value="cameraInfo.startEnd.endPointId">
                    <a-select-option v-for="(item, index) in cameraPointer.crossList" :key="index" :value="item.shapeId"
                      >点{{ item.id }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </div>
    </div>

    <div class="info-content1" v-if="type == 'area'">
      <div class="flex items-center justify-between mb-0.5">
        <span class="text-18px">区域列表</span>
        <a-button class="text-16px" type="primary" @click="handleAddArea">新增检测区域</a-button>
      </div>
      <div class="flex-1 my-scroll" v-if="areaList && areaList.length">
        <div v-for="(item, index) in areaList" :key="index">
          <div
            class="flex items-center justify-between cursor-pointer p-0.5 area-item"
            :class="item.selected ? 'active-bg' : ''"
            @click="handleSelectArea(index)"
          >
            <div>
              <p class="text-18px mb-0">区域{{ index + 1 }}</p>
              <!-- 检测类型已经不需要，故显示检测类型的文字也注释 -->
              <!-- <p class="truncate text-12px w-230px">
                {{ Array.isArray(item.detectionType) ? item.detectionType.join(' ') : '' }}
              </p> -->
            </div>
            <div>
              <!-- 新增检测区域时的检测类型弹框已经去掉，因此也不需要编辑弹框，故注释编辑按钮 -->
              <!-- <EditOutlined @click.stop="handleEditArea(item)" class="mx-1 cursor-pointer text-18px" /> -->
              <a-popconfirm title="确认删除吗?" ok-text="确认" cancelText="取消" @confirm="handleDelArea(item)">
                <DeleteOutlined class="cursor-pointer text-18px" />
              </a-popconfirm>
            </div>
          </div>
        </div>
      </div>
      <Empty v-else :image="simpleImage" />
    </div>
    <div class="info-content" v-if="type == 'lane'" onselectstart="return false;">
      <div class="flex items-center justify-between mb-0.5">
        <span class="text-18px no-user-select">车道列表</span>
        <div>
          <a-button class="text-16px mr-1" type="" @click="() => handleAddLaneItem(true)">新建实线</a-button>
          <a-button class="text-16px" type="primary" @click="() => handleAddLaneItem()">新建车道</a-button>
        </div>
      </div>
      <div v-if="laneList && laneList.length" class="flex-1 my-scroll">
        <div v-for="(item, index) in laneList" :key="index" class="mb-0.5">
          <template v-if="item.laneType">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-18px no-user-select">车道ID: {{ item.type }}</p>
                <p class="text-12px no-user-select">
                  {{ item.laneType }} &nbsp;&nbsp;{{ PositionEnum[item.lanePosition] }}
                </p>
              </div>
              <div>
                <EditOutlined @click="editLaneItem(item)" class="mx-1 text-18px" />
                <a-popconfirm title="确认删除吗?" ok-text="确认" cancelText="取消" @confirm="delLaneItem(item, index)">
                  <DeleteOutlined class="text-18px"
                /></a-popconfirm>
              </div>
            </div>
            <div class="mt-8px">
              <a-radio-group
                class="radio-group"
                v-model:value="item.currentOperation"
                button-style="solid"
                @change="handleChange($event, item.type, index)"
                size="large"
              >
                <a-radio-button value="area">车道区域</a-radio-button>
                <a-radio-button value="flow">流量统计线</a-radio-button>
                <a-radio-button value="direction">行车方向</a-radio-button>
              </a-radio-group>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-18px no-user-select">实线ID: {{ item.type }}</p>
                <p class="text-12px break-all no-user-select">{{ item.lineDescription }}</p>
              </div>
              <div class="flex">
                <EditOutlined @click="editLaneItem(item, true)" class="mx-1 text-18px" />
                <a-popconfirm
                  title="确认删除吗?"
                  ok-text="确认"
                  cancelText="取消"
                  @confirm="delLaneItem(item, index, true)"
                >
                  <DeleteOutlined class="text-18px"
                /></a-popconfirm>
              </div>
            </div>
            <div class="mt-8px">
              <a-radio-group
                class="radio-group"
                v-model:value="item.currentOperation"
                button-style="solid"
                @change="handleChange($event, item.type, index)"
                size="large"
              >
                <a-radio-button value="brokenLine">禁止压线</a-radio-button>
              </a-radio-group>
            </div>
          </template>
        </div>
      </div>
      <Empty v-else :image="simpleImage" />
    </div>

    <div class="info-content" v-if="type == 'fuse'" onselectstart="return false;">
      <div class="flex items-center justify-between mb-0.5">
        <span class="text-18px no-user-select">列表</span>
        <div>
          <a-button class="text-16px" type="primary" @click="() => handleAddFuse()">新建</a-button>
        </div>
      </div>
      <div v-if="fuseList && fuseList.length" class="flex-1 my-scroll">
        <div v-for="(item, index) in fuseList" :key="index" class="mb-0.5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-18px no-user-select">ID: {{ item.type }}</p>
            </div>
            <div>
              <a-popconfirm title="确认删除吗?" ok-text="确认" cancelText="取消" @confirm="delFuseItem(item, index)">
                <DeleteOutlined class="text-18px" />
              </a-popconfirm>
            </div>
          </div>
          <div class="mt-8px">
            <a-radio-group
              class="radio-group"
              v-model:value="item.currentOperation"
              button-style="solid"
              @change="handleChangeFuse($event, item.type, index)"
              size="large"
            >
              <a-radio-button value="area">区域</a-radio-button>
              <a-radio-button value="direction">方向</a-radio-button>
            </a-radio-group>
          </div>
        </div>
      </div>
      <Empty v-else :image="simpleImage" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, reactive, toRaw, watch, ref, PropType, defineExpose, computed } from 'vue'
// components
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  PaperClipOutlined,
} from '@ant-design/icons-vue'
import { Empty, Upload } from 'ant-design-vue'
// types
import { LaneList, AreaListItem, FuseList } from '../type'
// utils
import { latValidate, lonValidate } from '@/utils/formValidate'
// enums
import { PositionEnum } from '@/core/enums/cameraEnum'
import { message } from 'ant-design-vue'
import { RuleObject } from 'ant-design-vue/lib/form/interface'
import { checkFileSize, downloadData, downloadFile } from '@/utils'
import { useRoute } from 'vue-router'

const emit = defineEmits([
  'changeLane',
  'delLane',
  'addLane',
  'editLane',
  'addLine',
  'editLine',
  'addArea',
  'editArea',
  'changeArea',
  'delArea',
  'checkData',
  'addFuse',
  'delFuse',
  'changeFuse',
  'changeMarkType',
])
const props = defineProps({
  type: { type: String, default: '' },
  laneList: { type: [Array] as PropType<LaneList[]>, default: () => [] },
  crossList: { type: [Array] as PropType<any[]>, default: () => [] },
  areaList: { type: Array as PropType<AreaListItem[]>, default: () => [] },
  fuseList: { type: [Array] as PropType<FuseList[]>, default: () => [] },
})
const route = useRoute()

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
const cameraCenterRef = ref()
const cameraPointerRef = ref()
const startEndPointsRef = ref()
const canEditInData = ref<boolean>(false)
// 相机标注点
const cameraPointer = reactive({
  crossList: props.crossList,
})
const cameraInfo = reactive({
  outData: null,
  inData: '',
  center: {
    longitude: null,
    latitude: null,
  }, // 相机中心点
  cameraMode: 'LL',
  startEnd: {
    startPointId: '',
    endPointId: '',
  },
  isdistort: 'undistort',
  markType: 'vehicle',
  fileList: [],
})

watch(
  () => props.crossList,
  (newVal) => {
    // console.log(toRaw(newVal))
    cameraPointer.crossList = newVal
  }
)

cameraInfo.outData = computed(() => {
  const result = toRaw(props.crossList).map((item) => {
    return {
      img_x: item.point[0].source.x,
      img_y: item.point[0].source.y,
      longitude: item.lon,
      latitude: item.lat,
      world_x: item.worldX,
      world_y: item.worldY,
    }
  })
  if (result.length) {
    return JSON.stringify(result)
  } else {
    return null
  }
})
function changeMarkType(e) {
  emit('changeMarkType', e.target.value)
}
/**
 * 在上传文件前的回调函数
 * @param file {Object} 选择上传的文件
 */
function beforeUploadBin(file) {
  // 判断文件类型
  const isBin = /^extrinsic\.bin$/g.test(file.name)
  if (!isBin) {
    message.error('请选择extrinsic.bin文件')
    return Upload.LIST_IGNORE
  }
  // 上传文件size最大值
  const MAX_FILE_SIZE = '500M'
  const sizeOk = checkFileSize(file.size, MAX_FILE_SIZE)
  if (!sizeOk) {
    message.error(`文件大小不得超过${MAX_FILE_SIZE}`)
    return Upload.LIST_IGNORE
  }
  cameraInfo.fileList = [file]
  console.log('fileList', cameraInfo.fileList)
  return false
}
/**
 * 移除上传文件时触发的方法
 * @param file {Object} 待移除的文件
 */
function handleRemove(file) {
  const index = cameraInfo.fileList.indexOf(file)
  const newFileList = cameraInfo.fileList.slice()
  newFileList.splice(index, 1)
  cameraInfo.fileList = newFileList
}
/**
 * 下载文件时触发的方法
 * @param file {Object} 待下载的文件
 */
async function downloadUploadFile(file) {
  // 如果点击下载的是本地上传的文件对象，则直接使用FileReader对象获取文件数据，并使用a标签保存
  if (file instanceof File) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function () {
      downloadFile({ data: reader.result, blobType: file.type }, file.name)
    }
  } else {
    // 不是文件对象，则调用接口下载
    const result = await downloadData('/mark/download/bin', { group: route.query.group })
    downloadFile(result)
  }
}
/**
 * 是否畸变选择按钮值改变时触发的方法
 * @param val {String} 是否畸变选中的值
 */
function changeDistort(val) {
  canEditInData.value = val === 'distort'
}
/**
 * 中心点经度输入框的校验方法
 * @param rule 校验规则对象
 * @param value 输入值
 * @returns Promise对象
 */
function validateCenterLong(rule: RuleObject, value: string) {
  const notEmpty = !!(cameraCenterRef.value.getFieldsValue()?.latitude + '')
  return lonValidate(rule, value + '', notEmpty)
}
/**
 * 中心点纬度输入框的校验方法
 * @param rule 校验规则对象
 * @param value 输入值
 * @returns Promise对象
 */
function validateCenterLat(rule: RuleObject, value: string) {
  const notEmpty = !!(cameraCenterRef.value.getFieldsValue()?.longitude + '')
  return latValidate(rule, value + '', notEmpty)
}
/**
 * 判断表单项是否必须输入值
 * @param index 表单项索引值
 * @param key 表单项name的key
 * @returns 是否必须输入
 */
function checkEmpty(index: number, key: string) {
  const fieldsValue = cameraPointerRef.value.getFieldsValue()?.crossList
  let notEmpty = false
  if (fieldsValue && fieldsValue.length > index) {
    notEmpty = !!(fieldsValue[index][key] + '')
  }
  return notEmpty
}
/**
 * 标定点经度输入框的校验方法
 * @param rule 校验规则对象
 * @param value 输入值
 * @param index 表单项索引值
 * @param key 表单项name的key
 * @returns Promise对象
 */
function validatePointLong(rule: RuleObject, value: string, index: number, key: string) {
  const notEmpty = checkEmpty(index, key)
  return lonValidate(rule, value + '', notEmpty)
}
/**
 * 标定点纬度输入框的校验方法
 * @param rule 校验规则对象
 * @param value 输入值
 * @param index 表单项索引值
 * @param key 表单项name的key
 * @returns Promise对象
 */
function validatePointLat(rule: RuleObject, value: string, index: number, key: string) {
  const notEmpty = checkEmpty(index, key)
  return latValidate(rule, value + '', notEmpty)
}
/**
 * 中心点经度或纬度输入框输入变化的响应方法
 * @param _e 事件对象
 * @param key 表单项name的key
 */
function changeCenterLongOrLat(_e: ChangeEvent, key: string) {
  cameraCenterRef.value.validate([key])
}
/**
 * 标定点经度或纬度输入框输入变化的响应方法
 * @param _e 事件对象
 * @param index 表单项索引值
 * @param key 表单项name的key
 */
function changePointLongOrLat(_e: ChangeEvent, index: number, key: string) {
  cameraPointerRef.value.validate([['crossList', index, key]])
}
function handleChange(e: ChangeEvent, type: string, index: number) {
  props.laneList.forEach((item, a) => {
    if (a === index) return
    item.currentOperation = ''
  })
  emit('changeLane', {
    type: type,
    operation: e.target.value,
    index,
  })
}
function delLaneItem(item: LaneList, index, isLine?: boolean) {
  emit('delLane', { lane: item, index })
}
function editLaneItem(item, isLine?: boolean) {
  emit(isLine ? 'editLine' : 'editLane', item)
}
function handleAddLaneItem(isLine?: boolean) {
  emit(isLine ? 'addLine' : 'addLane')
}
function handleEditArea(item: AreaListItem) {
  emit('editArea', item)
}
function handleAddArea() {
  if (props.areaList.length >= 20) {
    return message.warn('最多只能创建20个检测区域')
  }
  emit('addArea')
}
function handleDelArea(item: AreaListItem) {
  emit('delArea', item)
}
function checkData() {
  emit('checkData')
}
/**
 * 设置列表数据的选中项
 * @param key 选中项的关键字
 * @param isType 关键字类型是否为type，如果否，则默认是索引
 */
function setSelectArea(key: number | string, isType?: boolean) {
  props.areaList.forEach((item, index) => {
    // 判断是否选中，选中则置selected属性为true
    if ((isType && item.type === key) || (!isType && index === key)) {
      item.selected = true
    } else {
      item.selected = false
    }
  })
}
function handleSelectArea(index: number) {
  setSelectArea(index)
  emit('changeArea', index)
}
function handleCanEditInData() {
  canEditInData.value = true
}

async function handleValidate() {
  // 如果是车标定方式，则判断是否上传了车标定文件
  if (cameraInfo.markType === 'vehicle') {
    if (cameraInfo.fileList.length < 1) {
      message.error('请选择车标定文件')
      return false
    }
    return true
  } else {
    try {
      if (cameraInfo.cameraMode === 'WORLD') {
        await cameraPointerRef.value.validate()
      } else {
        await cameraCenterRef.value.validate()
        await cameraPointerRef.value.validate()
      }
      // 判断起止点是否已经选择
      if (cameraPointer.crossList.length > 1) {
        await startEndPointsRef.value.validate()
      }
      return true
    } catch (error) {
      // 显示错误信息
      if (error.errorFields) {
        let errorMsg = '请检查外参标定页面经纬度的输入和起止点选择是否正确'
        if (error.errorFields.length > 0 && error.errorFields[0].errors && error.errorFields[0].errors.length > 0) {
          errorMsg = error.errorFields[0].errors[0]
        }
        message.error(errorMsg)
      }
      return false
    }
  }
}
/**
 * 判断起止点之前选择的值是否还存在，如果不存在，则清空选择的值
 * @param pointArr 已画点数组
 */
function changeStartAndEnd(pointArr) {
  let hasStart = false
  let hasEnd = false
  // 遍历数组检查起止点选择的点是否还在
  for (let index = 0; index < pointArr.length; index++) {
    const element = pointArr[index]
    if (element.shapeId === cameraInfo.startEnd.startPointId) {
      hasStart = true
    }
    if (element.shapeId === cameraInfo.startEnd.endPointId) {
      hasEnd = true
    }
    if (hasStart && hasEnd) {
      break
    }
  }
  // 如果不存在起始点，则清空其选择的值
  if (!hasStart) {
    cameraInfo.startEnd.startPointId = ''
  }
  // 如果不存在终止点，则清空其选择的值
  if (!hasEnd) {
    cameraInfo.startEnd.endPointId = ''
  }
}
/**
 * 新建融合配置项
 */
function handleAddFuse() {
  emit('addFuse')
}
/**
 * 删除融合配置项
 */
function delFuseItem(item, index) {
  emit('delFuse', { fuse: item, index })
}
/**
 * 切换按钮触发的方法
 * @param e 事件对象
 * @param type ID
 * @param index 在数组中的索引
 */
function handleChangeFuse(e: ChangeEvent, type: string, index: number) {
  props.fuseList.forEach((item, a) => {
    if (a === index) return
    item.currentOperation = ''
  })
  emit('changeFuse', {
    type: type,
    operation: e.target.value,
    index,
  })
}
defineExpose({
  cameraInfo,
  handleValidate,
  setSelectArea,
  changeStartAndEnd,
})
</script>
<style lang="less" scoped>
::v-deep .ant-input-number {
  width: 100% !important;
}
.title {
  margin: 5px;
}

.operation-panel {
  height: 100%;
  overflow-y: auto;
}
.info-content1 {
  max-height: 100%;
  display: flex;
  flex-direction: column;
  :deep(.ant-form-item) {
    margin-bottom: 15px;
  }
}
.info-content {
  max-height: 100%;
  display: flex;
  flex-direction: column;
  :deep(.ant-form-item) {
    margin-bottom: 15px;
    .ant-input {
      width: 100%;
    }
  }
}
.data-content {
  word-break: break-all;
}
.radio-group {
  :deep(.ant-radio-button-wrapper) {
    padding: 0 15px;
    span {
      -webkit-user-select: none; /* Chrome all / Safari all */
      -moz-user-select: none; /* Firefox all */
      -ms-user-select: none; /* IE 10+ */
      user-select: none; /* Likely future */
    }
  }
}
.w-230px {
  width: 230px;
}
.active-bg {
  background-color: #a5d4ff;
}
.no-user-select {
  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */
}
.area-item {
  padding: 30px 10px;
  border-bottom: 1px solid rgb(230, 228, 228);
}
</style>
