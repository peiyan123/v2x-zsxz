<template>
  <div>
    <a-drawer
      :maskClosable="false"
      @close="handleCancel"
      width="800"
      :title="title || (cameraId ? '编辑设备' : '新增设备')"
      placement="right"
      v-model:visible="visible"
    >
      <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }" :model="formState" ref="formRef">
        <a-form-item
          label="设备名称"
          name="name"
          :rules="[
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
            { validator: blankValidate, trigger: 'change' },
          ]"
        >
          <a-input v-model:value="formState.name" allowClear />
        </a-form-item>
        <a-form-item
          label="拉流方式"
          name="streamType"
          :class="{ 'stream-type-item': formState.streamType }"
          :rules="[{ required: true, message: '请选择拉流方式', trigger: 'change' }]"
          ><a-space direction="vertical">
            <a-radio-group
              class="type-radio"
              v-model:value="formState.streamType"
              name="radioGroup"
              @change="changeStreamType"
            >
              <a-radio value="rtsp">RTSP地址</a-radio>
              <a-radio value="video">视频</a-radio>
            </a-radio-group>
            <a-form-item
              v-if="formState.streamType === 'rtsp'"
              name="rtsp"
              :rules="[
                { required: true, message: '请输入RTSP地址', trigger: 'change' },
                { max: 100, message: '字符数应不大于100位', trigger: 'change' },
              ]"
            >
              <a-input
                v-model:value="formState.rtsp"
                allowClear
                class="rtsp-input"
                :disabled="formState.videoList && formState.videoList.length > 0"
              />
            </a-form-item>
            <a-form-item
              v-if="formState.streamType === 'video'"
              name="videoList"
              :rules="[{ required: true, message: '请上传视频', trigger: 'change' }]"
            >
              <a-form-item class="inner-form-item">
                <div class="upload-form-item">
                  <a-upload
                    v-model:file-list="formState.videoList"
                    list-type="picture"
                    :max-count="1"
                    :before-upload="beforeUploadVideo"
                    :openFileDialogOnClick="openFileDialog"
                    @remove="removeVideo"
                    @change="changeVideo"
                    accept=".mp4"
                    class="upload-wrap"
                  >
                    <a-button
                      @click="openFileDialog = true"
                      :disabled="typeof formState.rtsp === 'string' && formState.rtsp.length > 0"
                    >
                      <upload-outlined></upload-outlined>
                      上传视频
                    </a-button>
                    <span v-if="calculateHashLoading" class="loading-wrap ml-20px" @click="openFileDialog = false"
                      ><a-spin :indicator="indicator"
                    /></span>
                  </a-upload>
                  <a-button type="primary" @click="openVideoModal" class="play-button">
                    <CaretRightFilled class="play-icon" />
                  </a-button>
                  <!--<a-progress :percent="totalProgress" v-show="showProgress" />-->
                </div></a-form-item
              >
            </a-form-item>
          </a-space>
        </a-form-item>

        <a-form-item label="厂商" name="facturer" :rules="[{ required: false, message: '请输入', trigger: 'change' }]">
          <a-select v-model:value="formState.facturer" allowClear>
            <a-select-option value="hikvision">海康威视</a-select-option>
            <a-select-option value="sensing">森云</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="序列号"
          name="sn"
          :rules="[{ required: true, message: '请输入序列号', trigger: 'change' }, { max: 100, message: '字符数应不大于100位', trigger: 'change' }]"
        >
          <a-input v-model:value="formState.sn" allowClear />
        </a-form-item>
        <a-form-item
          label="设备型号"
          name="model"
          :rules="[
            { required: true, message: '请输入设备型号', trigger: 'change' },
            { validator: blankValidate, trigger: 'change' },
            { max: 100, message: '字符数应不大于100位', trigger: 'change' },
          ]"
        >
          <a-input v-model:value="formState.model" allowClear />
        </a-form-item>
        <a-form-item
          label="安装位置"
          name="position"
          :rules="[{ required: true, message: '请选择安装位置', trigger: 'change' }]"
        >
          <a-select v-model:value="formState.position" allowClear>
            <a-select-option v-for="(item, index) in installPosition" :value="item.value" :key="index">{{
              item.label
            }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="方向"
          name="towards"
          :rules="[{ required: true, message: '请选择方向', trigger: 'change' }]"
        >
          <div class="towards-wrap">
            <a-radio-group v-model:value="formState.towards">
              <a-radio v-for="(item, index) in cameraTowards" :class="item.key" :value="item.value" :key="item.key">{{
                getRadioText(item.label, index)
              }}</a-radio>
            </a-radio-group>
            <div>
              <div class="line up-down"></div>
              <div class="line right-up"></div>
              <div class="line left-right"></div>
              <div class="line left-up"></div>
            </div>
            <div
              class="camera"
              :class="`camera-${cameraTowards[formState.towards] ? cameraTowards[formState.towards].key : ''}`"
            ></div>
          </div>
          <!-- <a-select v-model:value="formState.towards" allowClear>
            <a-select-option v-for="(item, index) in cameraTowards" :value="item.value" :key="index">{{
              item.label
            }}</a-select-option>
          </a-select> -->
        </a-form-item>
        <a-form-item
          v-if="false"
          label="是否启用"
          name="status"
          :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
        >
          <a-switch
            :checkedValue="'1'"
            :unCheckedValue="'0'"
            checked-children="启用"
            un-checked-children="关闭"
            v-model:checked="formState.status"
          />
        </a-form-item>
        <a-form-item
          label="描述"
          name="desc"
          :rules="[{ max: 500, message: '字符数应不大于500位', trigger: 'change' }]"
        >
          <a-textarea allow-clear v-model:value="formState.desc" :auto-size="{ minRows: 2, maxRows: 5 }" />
        </a-form-item>
      </a-form>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '10px 16px',
          background: '#fff',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button style="margin-right: 8px" @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleOk" :loading="saveLoading">提交</a-button>
      </div>
    </a-drawer>
    <a-modal
      v-model:visible="showVideo"
      :footer="null"
      :closable="false"
      wrap-class-name="video-modal"
      width="1200px"
      destroyOnClose
    >
      <div class="flex justify-center items-center video-wrap">
        <video width="1000" height="740" controls>
          <source :src="videoSrc" type="video/mp4" />
        </video>
      </div>
    </a-modal>
    <a-modal v-model:visible="showProgress" :footer="null" :closable="false" destroyOnClose
      ><a-progress :percent="totalProgress" class="progress-wrap"
    /></a-modal>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, unref, defineExpose, getCurrentInstance, toRaw, h } from 'vue'
import { Form, message, Upload, Modal } from 'ant-design-vue'
import * as cameraApi from '@/services/api/cameraApi'
import { RuleObject } from 'ant-design-vue/lib/form/interface'
import { regIp } from '@/core/constant'
// type
import { AddCamera, CameraListItem } from '@/types/camera'
// datas
import { deviceType, installPosition, cameraTowards } from '../data'
// utils
import { cloneDeep, pick } from 'lodash'
import { DeviceType } from '@/core/enums/cameraEnum'
import { blankValidate, rtspValidate } from '@/utils/formValidate'
import { calculateHashSample, calculateHashWorker, checkFileSize } from '@/utils'
import { LoadingOutlined, CaretRightFilled } from '@ant-design/icons-vue'
import { useAppStore } from '@/store/modules/app'

const props = defineProps({
  deviceList: {
    type: Array as PropType<CameraListItem[]>,
    default: () => [],
  },
  // 组id
  groupId: {
    type: String,
    default: '',
  },
  // 页面标题
  title: {
    type: String,
    default: '',
  },
})
const appStore = useAppStore()

const useForm = Form.useForm
const visible = ref<boolean>(false)
const cameraId = ref<string>()
const formRef = ref()
// const fileList = ref<UploadProps['fileList']>([])
const fileHash = ref()
// const promiseArr = ref([])
// const emptyIndexArr = ref(new Set([0, 1, 2, 3]))
const currentIndex = ref(0)
const isMerged = ref(false)
const calculateHashLoading = ref(false)
const showProgress = ref(false)
const totalProgress = ref(0)
const uploadedProgress = ref(0)
const notuploadProgress = ref([])
const videoSrc = ref('')
const showVideo = ref(false)
const openFileDialog = ref(true)
const saveLoading = ref(false)
const showVideoTip = ref(true)

const formState = reactive<AddCamera>({
  name: '',
  rtsp: '',
  facturer: '',
  model: '',
  desc: '',
  position: '',
  status: '1',
  towards: '',
  videoList: [],
  sn: '',
  streamType: 'rtsp',
})
// 计算上传进度时的分母值
let totalPercent = 0
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
})

const currentInstance = getCurrentInstance()

// 分块大小
const CHUNK_SIZE = 5 * 1024 * 1024
// 上传文件size最大值
const MAX_FILE_SIZE = '5000M'
/**
 * 上传视频文件前触发的方法
 * @param file 选择的文件对象
 */
function beforeUploadVideo(file) {
  const isMP4 = file.type === 'video/mp4'
  if (!isMP4) {
    message.error(`${file.name}不是MP4文件，请重新选择`)
    return Upload.LIST_IGNORE
  }
  const sizeOk = checkFileSize(file.size, MAX_FILE_SIZE)
  if (!sizeOk) {
    message.error(`视频文件大小不得超过${MAX_FILE_SIZE}`)
    return Upload.LIST_IGNORE
  }
  // fileList.value = [file]
  // 如果需要显示上传视频文件的提示，则显示提示
  if (showVideoTip.value) {
    openVideoTip()
    showVideoTip.value = false
  }
  return false
}
/**
 * 显示视频上传提示
 */
function openVideoTip() {
  Modal.info({
    title: '提示',
    content: h('div', {}, [
      h(
        'p',
        '上传同一个路口的多个视频时，由于视频的有交集，因此，请确保这几个视频的视频时间对齐。否则，多视频融合时，可能会将一个目标视为两个目标，造成错误，导致数据不准'
      ),
    ]),
    onOk() {
      // handleUploadVideo()
    },
  })
}
/**
 * 将待上传文件进行分块处理
 * @param file 待上传文件
 * @param size 分块大小
 * @return 分块数组
 */
function createFileChunk(file, size = CHUNK_SIZE) {
  const chunks = []
  let cur = 0
  totalPercent = 0
  while (cur < file.size) {
    const leftSize = file.size - cur
    const percent = leftSize > size ? 1 : leftSize / size
    chunks.push({ index: cur, file: file.slice(cur, cur + size), percent })
    cur += size
    totalPercent += percent
  }
  return chunks
}
/**
 * 上传视频文件
 */
async function handleUploadVideo() {
  // 如果没有待上传的文件，则返回
  if (!formState.videoList || formState.videoList.length < 1 || !formState.videoList[0].originFileObj) {
    return
  }
  const file = formState.videoList[0].originFileObj
  const chunks = createFileChunk(file)
  // fileHash.value = await calculateHashSample(file)
  calculateHashLoading.value = true
  fileHash.value = await calculateHashWorker(chunks)
  calculateHashLoading.value = false
  // // 切片处理
  // const chunksNew = chunks.map((chunk, index) => {
  //   const name = fileHash.value + '-' + index
  //   return {
  //     hash: fileHash.value,
  //     name,
  //     index,
  //     chunk: chunk.file,
  //   }
  // })
  // 清空老数据
  // promiseArr.value = []
  // emptyIndexArr.value = new Set([0, 1, 2, 3])
  currentIndex.value = 0
  isMerged.value = false
  notuploadProgress.value = []
  const { data } = await cameraApi.checkFile({ hash: fileHash.value, ext: 'mp4' })
  const { uploaded, uploadedList } = data
  if (!uploaded) {
    const uploadedSet = new Set(uploadedList)
    const notUploaded = []
    let uploadedSize = 0
    chunks.map((chunk, index) => {
      const name = fileHash.value + '-' + index
      if (uploadedSet.has(name)) {
        uploadedSize += chunk.percent
      } else {
        notUploaded.push({
          name,
          hash: fileHash.value,
          chunk: chunk.file,
        })
        notuploadProgress.value.push({ percent: chunk.percent, value: 0 })
      }
    })
    uploadedProgress.value = uploadedSize / totalPercent
    totalProgress.value = Number((uploadedProgress.value * 100).toFixed(2))
    showProgress.value = true
    // const notUploaded = chunksNew.filter((item) => !uploadedSet.has(item.name))
    try {
      await uploadAllChunks(notUploaded)
      // 所有切片上传完毕，通知后台进行切片内容合并，生成完整文件
      await mergeRequest()
    } catch (e) {
      console.log(e)
      message.error('上传视频文件出错，请重新上传')
    }
    showProgress.value = false
  }
  // else {
  //   message.success('视频文件已上传')
  // }
}
async function uploadAllChunks(chunks) {
  const emptyIndexArr = new Set([0, 1, 2, 3])
  const errorArr = []
  return new Promise((resolve, reject) => uploadChunks(chunks, emptyIndexArr, errorArr, resolve, reject))
}
/**
 * 上传切片
 * @param chunks 待上传的分片数组
 */
async function uploadChunks(chunks, emptyIndexArr, errorArr, resolve, reject) {
  if (currentIndex.value < chunks.length) {
    emptyIndexArr.forEach((index) => {
      if (currentIndex.value < chunks.length) {
        emptyIndexArr.delete(index)
        const chunk = chunks[currentIndex.value]
        const currentIndexTemp = currentIndex.value
        cameraApi
          .uploadVideo(
            {
              file: chunk.chunk,
              filename: chunk.name,
              data: { hash: chunk.hash, name: chunk.name },
            },
            (progressEvent) => handleProgress(progressEvent, currentIndexTemp)
          )
          .then((val) => {
            // console.log('#### suc', index, currentIndex)
            emptyIndexArr.add(index)
            uploadChunks(chunks, emptyIndexArr, errorArr, resolve, reject)
          })
          .catch((e) => {
            emptyIndexArr.add(index)
            errorArr.push(currentIndexTemp)
            uploadChunks(chunks, emptyIndexArr, errorArr, resolve, reject)
            // console.log('#### fail', index, currentIndex)
          })
      }
      currentIndex.value++
    })
    // emptyIndexArr.clear()
  }
  if (currentIndex.value >= chunks.length && emptyIndexArr.size === 4) {
    // isMerged.value = true
    if (errorArr.length > 0) {
      reject(errorArr)
    } else {
      resolve()
    }
  }
}

function handleProgress(progressEvent, index) {
  const progress = progressEvent.loaded / progressEvent.total
  notuploadProgress.value[index].value = progress * notuploadProgress.value[index].percent
  totalProgress.value = Number(
    (
      (notuploadProgress.value.reduce((acc, cur) => acc + cur.value, 0) / totalPercent +
        // (1 - uploadedProgress.value) +
        uploadedProgress.value) *
      100
    ).toFixed(2)
  )
  console.log('progress:', index, progress, totalProgress.value, notuploadProgress.value)
}
/**
 * 合并切片
 */
async function mergeRequest() {
  const fileName = formState.videoList[0].name.match(/^(.+)\.(.*)/)
  const ext = fileName && fileName.length > 2 ? fileName[2] : 'mp4'
  const name = fileName && fileName.length > 1 ? fileName[1] : fileHash.value
  await cameraApi.mergeFile({
    ext,
    size: CHUNK_SIZE,
    hash: fileHash.value,
    name,
  })
  // message.success('上传成功')
}
/**
 * 移除文件时触发的方法
 * @param file 文件对象
 */
function removeVideo(file) {
  // showProgress.value = false
  // fileList.value = []
}
/**
 * 视频文件改变时触发的方法
 * @param file {Object} file对象
 */
function changeVideo(file) {
  formRef.value.validate(['videoList'])
}

function openVideoModal() {
  openFileDialog.value = false
  showVideo.value = true
  let url = null
  if (formState.videoList && formState.videoList.length > 0) {
    const videoItem = formState.videoList[0]
    if (videoItem.originFileObj) {
      url = URL.createObjectURL(videoItem.originFileObj)
    } else {
      url = `${location.origin}/api/camera/video/${videoItem.name}?hash=${videoItem.hash}`
    }
  }
  videoSrc.value = url
}
function checkRtspAndVideo() {
  if (!formState.rtsp && (!formState.videoList || formState.videoList.length <= 0)) {
    message.error('请输入RTSP地址或者上传视频')
    return false
  }
  return true
}
/**
 * 拉流方式改变时触发的方法
 * @param e {Object} 事件对象
 */
function changeStreamType(e) {
  const type = e.target.value
  if (type === 'video') {
    formState.rtsp = ''
  } else {
    formState.videoList = []
  }
}

function handleOk() {
  saveLoading.value = true
  // if (!checkRtspAndVideo()) {
  //   saveLoading.value = false
  //   return
  // }
  formRef.value
    .validate()
    .then(async () => {
      try {
        await handleUploadVideo()
        const val = cloneDeep(toRaw(formState))
        if (val.videoList) {
          val.video = val.videoList.map((item) => ({
            ...pick(item, ['hash', 'name', 'type', 'size', 'uid']),
            hash: fileHash.value,
          }))
          delete val.videoList
        }
        if (checkInstallOnly(val.position)) {
          saveLoading.value = false
          return message.error('相同安装位置已存在相同设备')
        }
        if (unref(cameraId)) {
          await cameraApi.updateCamera({ ...val, id: unref(cameraId), groupId: props.groupId })
          message.success('编辑设备成功')
        } else {
          await cameraApi.addCamera({ ...val, groupId: props.groupId })
          message.success('添加设备成功')
        }
        appStore.setReboot(true)
        visible.value = false
        showVideoTip.value = true
        clearFields()
        // 调用父组件的方法，以刷新父组件
        if (currentInstance.parent.exposed) {
          if (currentInstance.parent.exposed.getCameraList) {
            currentInstance.parent.exposed.getCameraList()
          }
          if (currentInstance.parent.exposed.getGroupInfo) {
            currentInstance.parent.exposed.getGroupInfo()
          }
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
      saveLoading.value = false
    })
    .catch((e) => {
      // 校验有错误时，需关闭loading
      saveLoading.value = false
    })
}

// 判断同一位置同一设备类型唯一
function checkInstallOnly(position: string) {
  return props.deviceList
    .filter((a) => {
      return a.id != unref(cameraId)
    })
    .some((item) => {
      return item.position === position
    })
}

function handleCancel() {
  visible.value = false
  showVideoTip.value = true
  clearFields()
}

// camera he leida ip buneng chongfu
async function validateIp(_rule: RuleObject, value: string) {
  if (!regIp.test(value)) {
    return Promise.reject('请输入正确的ip')
  }

  return Promise.resolve()
}

function clearFields() {
  formState.model = ''
  formState.rtsp = ''
  formState.position = ''
  formState.towards = ''
  formState.desc = ''
  formState.name = ''
  formState.facturer = ''
  formState.status = '1'
  formState.videoList = []
  formState.sn = ''
  formState.streamType = 'rtsp'
  formRef.value.clearValidate()
}

function setFieldsValue(values: Partial<AddCamera>) {
  Object.keys(values).forEach((key) => {
    formState[key] = values[key]
  })
}
/**
 * 获取方向字段中需要显示的文本
 * @param label 可能要显示的文本
 * @param index 索引
 * @return 要显示的文本
 */
function getRadioText(label, index) {
  return index < 4 ? label : ''
}
defineExpose({
  visible,
  cameraId,
  formState,
  setFieldsValue,
  showVideoTip,
})
</script>
<style lang="less" scoped>
.towards-wrap {
  position: relative;
  width: 300px;
  height: 300px;
  // border: 1px solid red;
  :deep(.ant-radio-wrapper),
  .line,
  .camera {
    position: absolute;
    // height: 22px;
    left: 50%;
    top: 50%;
    transform-origin: center center;
    // border: 1px solid green;
  }
  :deep(.ant-radio-wrapper) {
    z-index: 10;
  }
  .north {
    transform: translate(-50%, -124px) rotate(270deg);
    :deep(span:last-child) {
      transform: rotate(90deg);
    }
  }
  .northeast {
    transform: translate(-50%, -50%) rotate(-45deg) translate(100px, 0);
  }
  .east {
    transform: translate(80px, -50%) rotate(0deg);
  }
  .southeast {
    transform: translate(-50%, -50%) rotate(45deg) translate(100px, 0);
  }
  .south {
    transform: translate(-50%, 100px) rotate(90deg);
    :deep(span:last-child) {
      transform: rotate(-90deg);
    }
  }
  .southwest {
    transform: translate(-50%, -50%) rotate(135deg) translate(100px, 0);
  }
  .west {
    transform: translate(-130px, -50%) rotate(180deg);
    :deep(span:last-child) {
      transform: rotate(180deg);
    }
  }
  .northwest {
    transform: translate(-50%, -50%) rotate(225deg) translate(100px, 0);
  }
  .line {
    width: 200px;
    height: 22px;
    &::after {
      display: block;
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      top: 50%;
      transform: translateY(-50%);
      background: #ededed;
    }
  }
  .up-down {
    transform: translate(-50%, -50%) rotate(90deg);
  }
  .left-up {
    transform: translate(-50%, -50%) rotate(45deg);
  }
  .right-up {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
  .left-right {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  .camera {
    width: 50px;
    height: 50px;
    background: url(../../../assets/image/icon-camera.png);
    background-size: contain;
    transform: translate(-50%, -50%) rotate(-90deg);
  }
  .camera-north {
    transform: translate(-50%, -50%) rotate(-90deg);
  }
  .camera-northeast {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
  .camera-east {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  .camera-southeast {
    transform: translate(-50%, -50%) rotate(45deg);
  }
  .camera-south {
    transform: translate(-50%, -50%) rotate(90deg);
  }
  .camera-southwest {
    transform: translate(-50%, -50%) rotate(135deg);
  }
  .camera-west {
    transform: translate(-50%, -50%) rotate(180deg);
  }
  .camera-northwest {
    transform: translate(-50%, -50%) rotate(225deg);
  }
}
.inner-form-item {
  margin-bottom: 0;
}
.upload-form-item {
  position: relative;
  .upload-wrap {
    // width: 100%;
    :deep(.ant-upload) {
      display: flex;
      // width: 100%;
    }
  }
}
.play-button {
  position: absolute;
  top: 0;
  left: 100px;
  margin-left: 20px;
  .play-icon {
    font-size: 20px;
  }
}
.video-modal {
  .video-wrap {
    // width: 700px;
    // height: 700px;
    margin: 0 auto;
  }
}
.stream-type-item {
  margin-bottom: 0;
  .type-radio {
    margin-top: 5px;
  }
  :deep(.ant-space) {
    width: 100%;
  }
  .rtsp-input {
    height: 32px;
  }
}
</style>
