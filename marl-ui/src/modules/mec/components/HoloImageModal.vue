<template>
  <BasicModal @register="register" title="交通路口全息图配置" :afterClose="closeHooks">
    <a-upload :accept="'.png,.jpg,.jpeg'" :showUploadList="false" :before-upload="beforeUpload">
      <a-button>上传全息图</a-button>
    </a-upload>
    <div class="holo-img mt-20px">
      <img :src="src" alt="" v-if="src" />
      <span class="no-img" v-else>请上传图片</span>
    </div>
    <template #footer>
      <a-button key="submit" type="primary" @click="handleOk">提交</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
import { defineEmits, ref, unref } from 'vue'
// components
import { BasicModal, useModal, useModalInner } from '@/components/Modal'
import { uploadApi } from '@/services/api/uploadApi'
import { message } from 'ant-design-vue'
// utils
import { checkFileType } from '../utils'

const emits = defineEmits(['register', 'successCb'])

const [register, { closeModal }] = useModalInner()
const src = ref('')
let uploadFile: File | null = null
// const uploadStatus = ref<'normal' | 'exception' | 'active' | 'success'>()
// const percent = ref<number>(0)

async function handleOk() {
  if (!unref(src)) return message.error('请上传图片')
  // const result = await uploadApi(
  //   {
  //     file: uploadFile,
  //   },
  //   function onUploadProgress(progressEvent: ProgressEvent) {
  //     const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
  //     // console.log(complete)
  //   }
  // )
  // message.success('上传图片成功')
  closeModal()
  emits('successCb', { file: uploadFile, src: src.value })
}

function closeHooks() {
  src.value = ''
}

function beforeUpload(file: File) {
  const maxSize = 20
  const accept = ['png', 'jpeg', 'jpg']

  // 设置最大值，则判断
  if (maxSize && file.size / 1024 / 1024 > maxSize) {
    message.error('图片文件不超过20M')
    return false
  }

  // 设置类型,则判断
  if (accept.length > 0 && !checkFileType(file, accept)) {
    message.error('文件格式' + accept.join(','))
    return false
  } else {
    const fileRender = new FileReader()
    fileRender.readAsDataURL(file)
    fileRender.onload = function (e) {
      src.value = (e.target.result as string) ?? ''
    }
    uploadFile = file
  }
  return false
}

// async function handleUpload(e) {
//   uploadStatus.value = 'active'
//   try {
//     const result = await uploadApi({ file: e.file }, function onUploadProgress(progressEvent: ProgressEvent) {
//       const complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
//       percent.value = complete
//       if (complete == 100) {
//         uploadStatus.value = 'success'
//       }
//     })
//     src.value = location.protocol + '//' + result.data.url.replace(/\\\\/g, '/')
//   } catch (error) {
//     uploadStatus.value = 'exception'
//   }
// }
</script>
<style lang="less" scoped>
.holo-img {
  height: 400px;
  width: 100%;
  position: relative;
  img {
    width: 100%;
    height: 100%;
  }
}
.no-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
}
</style>
