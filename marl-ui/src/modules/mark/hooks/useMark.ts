import { mittEvent } from '@/core/mitt'
import { onUnmounted, ref, unref } from 'vue'
import img from '@/assets/image/20220314-133918.png'
import { images } from '../components/access-image'
import * as markApi from '@/services/api/markApi'
import { useMarkStore } from '@/store/modules/mark'

const showImageUrl = ref<string>()

export const useMark = () => {
  const scene = ref<any>(null)
  const handleRef = ref<any>()

  const markStore = useMarkStore()

  onUnmounted(() => {
    scene.value.destroy()
  })
  async function changeImage() {
    const cameraId = markStore.cameraId as number
    const cameraName = markStore.cameraName
    const rtsp = markStore.rtsp
    const result = await markApi.getImage(cameraId, cameraName, rtsp)
    showImageUrl.value = result.data.url
    // showImageUrl.value = images[0]
    unref(scene).changeImage(showImageUrl.value)
    markStore.setImageInfo({
      width: result.data.width,
      height: result.data.height,
      url: '',
    })
  }

  async function initImage() {
    const cameraId = markStore.cameraId as number
    const cameraName = markStore.cameraName
    const rtsp = markStore.rtsp
    const result = await markApi.getImageFirst(cameraId, cameraName, rtsp)
    showImageUrl.value = result.data.url
    // showImageUrl.value = images[0]
    unref(scene).changeImage(showImageUrl.value)
    markStore.setImageInfo({
      width: result.data.width,
      height: result.data.height,
      url: '',
    })
  }

  function handleGetData() {
    // alert(JSON.stringify(unref(scene).getData()))
    return unref(scene).getData()
  }
  /**
   * 重置canvas的图片大小和位置
   */
  function resetCanvas() {
    if (unref(scene)) {
      unref(scene).reset()
    }
  }

  return {
    scene,
    handleRef,
    changeImage,
    handleGetData,
    showImageUrl,
    initImage,
    resetCanvas,
  }
}
