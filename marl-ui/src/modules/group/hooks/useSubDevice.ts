import { onActivated, ref } from 'vue'
import * as groupApi from '@/services/api/groupApi'

export const useSubDevice = () => {
  const isSubDevice = ref<boolean>(false)

  // onActivated(() => {
  //   getSubDevice()
  // })
  /**
   * 调用接口获取当前设备是否分布式子设备
   */
  async function getSubDevice() {
    const { data } = await groupApi.getSubDevice()
    isSubDevice.value = data.isSubDevice
  }

  return {
    isSubDevice,
    getSubDevice,
  }
}
