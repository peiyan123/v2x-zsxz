<template>
  <div>
    <div class="flex items-center justify-between mb-1">
      <a-breadcrumb class="bread-crumb" separator="">
        <a-breadcrumb-item>当前位置</a-breadcrumb-item>
        <a-breadcrumb-separator>:</a-breadcrumb-separator>
        <a-breadcrumb-item>Group管理</a-breadcrumb-item>
      </a-breadcrumb>
      <div class="">
        <a-upload directory :beforeUpload="beforeUpload" :fileList="fileList" :showUploadList="false"
          ><a-button type="primary" class="upload-button">导入配置参数</a-button></a-upload
        ><a-button type="primary" class="upload-button ml-10px" @click="applyConfigs">应用当前配置</a-button>
      </div>
    </div>
    <a-tabs v-model:activeKey="currentOperation" type="editable-card" class="tab-container" :hideAdd="panes.length > 0" @edit="onEdit">
      <!-- <template #rightExtra>
        <a-checkbox v-model:checked="isSubDevice" @change="changeSubDevice">是否作为分布式子设备</a-checkbox>
      </template> -->
      <a-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        <component
          :is="pane.component"
          :groupId="pane.id"
          :currentPanel="currentOperation"
          :isOpen="currentOperation === pane.key"
          :isSubDevice="isSubDevice"
          :ref="(el) => setComponentRef(el, pane.key)"
        ></component>
      </a-tab-pane>
    </a-tabs>
    <TabNameModal @register="registerForTabName" @addTabName="onAddTabName" />
  </div>
</template>
<script lang="ts" setup>
import { h, onActivated, ref } from 'vue'
// components
import ItemPage from './components/ItemPage.vue'
import TabNameModal from './components/TabNameModal.vue'
import { useModal } from '@/components/Modal'
// services
import * as groupApi from '@/services/api/groupApi'
import * as cameraApi from '@/services/api/cameraApi'
import * as radarApi from '@/services/api/radarApi'
import * as mecApi from '@/services/api/mecApi'
import { message, Modal } from 'ant-design-vue'
import { useMessage } from '@/core/hooks/useMessage'
// hooks
import { useSubDevice } from './hooks/useSubDevice'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'

let uploadFileCount = 0
const fileList = ref<any['fileList']>([])
const currentOperation = ref('')
const groupId = ref('')
const panes = ref<{ title: string; component: any; key: string; id: string; closable?: boolean }[]>([])

const appStore = useAppStore()
const [registerForTabName, { openModal: openTabNameModal, closeModal }] = useModal()
const { isSubDevice } = useSubDevice()
const route = useRoute()

const itemRefs: Record<string, any> = {}
function setComponentRef(el, key) {
  if (el) {
    itemRefs[key] = el
  }
}
/**
 * 上传参数配置文件时处理方法，每一个文件就会调用一次
 * @param file {Object} 选中的文件对象
 * @param fileListTemp {Array} 所有选中的文件数组
 */
function beforeUpload(file, fileListTemp) {
  // console.log(file, file.webkitRelativePath, file.path, fileListTemp)
  // 过滤掉不需要上传的文件
  const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  let reg: any = ''
  if (tab === '2') {
    reg = /^([^/]+\/)?((configs\/((chan2)\/)([^/]+|(cfg_multiple|cfg_single)\/.+))|(image\/.+))$/
  } else if (tab === '3') {
    reg = /^([^/]+\/)?((configs\/((chan3)\/)([^/]+|(cfg_multiple|cfg_single)\/.+))|(image\/.+))$/
  } else {
    reg = /^([^/]+\/)?((configs\/((chan1)\/)([^/]+|(cfg_multiple|cfg_single)\/.+))|(image\/.+))$/
  }
  if (reg.test(file.webkitRelativePath)) {
    fileList.value.push(file)
  }
  uploadFileCount++
  // 如果调用方法次数与所有选中文件的数量，则表示本方法已调用完毕，则弹出提示框
  if (uploadFileCount === fileListTemp.length) {
    uploadFileCount = 0
    showConfirmModal()
  }
  return false
}
/**
 * 显示“导入配置参数”时的提示框
 */
function showConfirmModal() {
  Modal.confirm({
    content: '导入配置参数后，会覆盖之前的数据。是否确定导入？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        uploadAllFiles()
      } catch (error) {
        console.log(error)
      }
      fileList.value = []
      // rebootVisible.value = true
    },
    onCancel: () => {
      fileList.value = []
    },
  })
}
/**
 * 上传所有导入的配置参数文件
 */
async function uploadAllFiles() {
  await groupApi
    .uploadConfigFiles({
      files: fileList.value,
    })
    .catch((error) => {
      console.log(error)
    })
  // 导入完毕时，刷新group列表
  await refreshList()
  appStore.setReboot(true)
  // itemRefs[currentOperation.value].getGroupInfo()
}
/**
 * 点击添加tab标签页按钮触发方法
 */
function addTab() {
  openTabNameModal()
  // currentOperation.value = `newTab${++newTabIndex.value}`
  // panes.value.push({ title: 'New Tab', component: VisibleMark, key: currentOperation.value })
}
/**
 * 设置新添加tab标签页名字
 * @param {object} groupData 新添加组的值
 * @param {function} resetFields 设置标签页名字弹框表单的resetFields方法
 */
function onAddTabName(groupData, resetFields) {
  const { id, name } = groupData
  groupId.value = id
  if (panes.value?.find((item) => item.title === name)) {
    message.error('Tab名字不能重复，请重新输入')
  } else {
    resetFields()
    closeModal()
    addEventTab(name, id, true)
  }
}
/**
 * 添加tab标签页
 * @param tabKey 标签页的key
 * @param open 是否打开新标签页
 */
function addEventTab(tabKey, id, open?: boolean) {
  if (open) {
    currentOperation.value = tabKey
  }
  panes.value.push({ title: tabKey, component: ItemPage, key: tabKey, id })
}
/**
 * 删除tabs的某个标签页
 * @param targetKey 删除tab标签页的key
 */
async function removeTab(targetKey: string) {
  let lastIndex = 0
  let deleteId = ''
  for (let index = 0; index < panes.value.length; index++) {
    const pane = panes.value[index]
    if (pane.key === targetKey) {
      lastIndex = index - 1
      deleteId = pane.id
      break
    }
  }
  // panes.value.forEach((pane, i) => {
  //   if (pane.key === targetKey) {
  //     lastIndex = i - 1
  //   }
  // })
  panes.value = panes.value.filter((pane) => pane.key !== targetKey)
  if (panes.value.length && currentOperation.value === targetKey) {
    if (lastIndex >= 0) {
      currentOperation.value = panes.value[lastIndex].key
    } else {
      currentOperation.value = panes.value[0].key
    }
  }
  // 删除标签页的ref对象值
  delete itemRefs[targetKey]
  await groupApi.deleteGroup(deleteId)
  message.success('删除成功')
  appStore.setReboot(true)
}
function onEdit(targetKey: string | MouseEvent, action: string) {
  if (action === 'add') {
    addTab()
  } else {
    showRemoveConfirm(targetKey as string)
    // removeTab(targetKey as string)
  }
}
function showRemoveConfirm(targetKey) {
  const { createConfirm } = useMessage()
  createConfirm({
    iconType: 'warning',
    title: () => h('span', '提示'),
    content: () => h('span', '删除组会同时删除组里的设备，是否确认删除？'),
    onOk: async () => {
      removeTab(targetKey)
    },
  })
}

// async function changeSubDevice(e) {
//   await groupApi.setSubDevice(e.target.checked)
// }
async function getGroupList(selectedGroup, hash) {
  const { data } = await groupApi.getGroupList(hash)
  let hasFound = false
  panes.value = data.map((item) => {
    if (item.name === selectedGroup) {
      currentOperation.value = item.name
      groupId.value = item.id
      hasFound = true
    }
    return { title: item.name, component: ItemPage, key: item.name, id: item.id }
  })
  if (!hasFound && data && data.length > 0) {
    currentOperation.value = data[0].name
    groupId.value = data[0].id
  }
}

onActivated(() => {
  // // 获取Url地址上面传递的group名字
  // const selectedGroup = (route.query && route.query.name) || ''
  // getGroupList(selectedGroup)
  refreshList()
})
/**
 * 刷新group列表数据
 */
async function refreshList() {
  // 获取Url地址上面传递的group名字
  const selectedGroup = (route.query && route.query.name) || ''
  const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
  await getGroupList(selectedGroup,tab)
}
/**
 * 保存摄像头和雷达参数配置，并调用应用配置接口
 */
async function applyConfigs() {
  await cameraApi.submitReportData()
  await radarApi.submitReportData()
  await mecApi.saveApply()
  message.success('应用成功')
  appStore.setReboot(false)
}
</script>
<style lang="less" scoped>
.tab-container {
  height: 100%;
  :deep(.ant-tabs-content) {
    height: 100%;
  }
}
.upload-button {
  padding-top: 5px;
}
</style>
