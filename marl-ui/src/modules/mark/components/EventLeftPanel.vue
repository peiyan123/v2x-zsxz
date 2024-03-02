<template>
  <div class="operation-panel my-scroll">
    <div class="info-content1">
      <div class="flex items-center justify-between mb-0.5">
        <span class="text-18px">属性数据</span>
        <!--<a-button class="text-16px" @click="handleGetData">获取数据</a-button>-->
        <!-- <a-button class="text-16px" type="primary" @click="handleAddRoot">新增一级属性</a-button> -->
      </div>
      <div class="h-[800px] pt-10px" style="height: 700px; background-color: #fff">
        <BasicTree
          isDirectoryTree
          multiple
          defaultExpandLevel="1"
          :treeData="treeData"
          :beforeRightClick="getRightMenuList"
          @select="handleSelect($event)"
        />
      </div>
      <CreatePropertyModal @register="registerTreeModal" @success="handleModalSuccess" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, reactive, toRaw, watch, ref, PropType, defineExpose, computed, h } from 'vue'
// components
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { BasicTree, ContextMenuItem } from '@/components/Tree/index'
import { Empty } from 'ant-design-vue'
import CreatePropertyModal from './CreatePropertyModal.vue'
// types
import { LaneList, AreaListItem } from '../type'
// utils
import { latValidate, lonValidate } from '@/utils/formValidate'
// enums
import { PositionEnum } from '@/core/enums/cameraEnum'
import { message } from 'ant-design-vue'
import { useModal } from '@/components/Modal'
import { filter, treeToList } from '@/utils/helper/treeHelper'
import { useMessage } from '@/core/hooks/useMessage'
import { buildUUID } from '@/utils/uuid'

import { cloneDeep } from 'lodash'

interface PropertyTreeItem {
  id: string
  name: string
  nodeLevel: number
  children?: []
}
// 包含形状的节点的图标
const LEAF_ICON = 'clarity:network-switch-line'
// 不包含形状的节点的图标
const BRANCH_ICON = 'ic:outline-folder-copy'
const emit = defineEmits(['addArea', 'changeArea', 'delArea', 'getData', 'closeMarkMode', 'selectPropery'])
const [registerTreeModal, { openModal }] = useModal()

let treeData = ref([])
const treeDataMap = ref({})

const checkTreeNodeData = (dataArr, name) => {
  if (dataArr.find((item) => item.name === name)) {
    message.error('新增节点名称不能与同级其他节点重复')
    return false
  }
  return true
}
/**
 * 初始化左侧树的数据
 * @param {array} initData 初始数据
 */
const initTreeData = (initData: any[]) => {
  const treeData = []
  const treeDataMap = {}
  // 循环遍历初始化数据，获取树结构数据
  for (let index = 0; index < initData.length; index++) {
    const element = initData[index]
    const id = buildUUID()
    treeData.push({
      id: id,
      key: id,
      name: element.name,
      title: element.title,
      nodeLevel: 1,
      children: [],
      icon: BRANCH_ICON,
    })
    treeDataMap[id] = [index]
    // 使用堆栈方式遍历子节点
    const itemStack = []
    const childrenStack = []
    itemStack.push(element)
    childrenStack.push(treeData[treeData.length - 1])
    while (itemStack.length > 0) {
      const item = itemStack.pop()
      const resultItem = childrenStack.pop()
      const childrenTemp = item.children || []
      for (let childIndex = 0; childIndex < childrenTemp.length; childIndex++) {
        const child = childrenTemp[childIndex]
        const childId = buildUUID()
        resultItem.children.push({
          id: childId,
          key: childId,
          parentId: resultItem.id,
          name: child.name,
          title: child.title,
          nodeLevel: resultItem.nodeLevel + 1,
          children: [],
          icon: BRANCH_ICON,
        })
        treeDataMap[childId] = [...treeDataMap[resultItem.id], childIndex]
        itemStack.push(child)
        childrenStack.push(resultItem.children[resultItem.children.length - 1])
      }
    }
  }
  setTreeData(treeData, treeDataMap)
}
/**
 * 新增节点时触发的方法
 * @param value 新增节点数据
 */
const addTreeNode = (value) => {
  const { parentId, nodeLevel, name } = value
  if (parentId === '') {
    if (!checkTreeNodeData(treeData.value, name)) {
      return false
    } else {
      const id = buildUUID()
      treeData.value.push({ name, nodeLevel: 1, id })
      treeDataMap.value[id] = [treeData.value.length - 1]
    }
  } else {
    const parentIdArr = treeDataMap.value[parentId]
    const idArr = [...parentIdArr]
    let tempData = treeData.value
    for (let index = 0; index < parentIdArr.length; index++) {
      const element = tempData[parentIdArr[index]]
      if (index < parentIdArr.length - 1) {
        tempData = element.children
      } else {
        const id = buildUUID()
        const newItem = { name, nodeLevel: index + 2, id, parentId }
        if (!element.children) {
          element.children = [newItem]
        } else {
          if (!checkTreeNodeData(element.children, name)) {
            return false
          } else {
            element.children.push(newItem)
          }
        }
        idArr.push(element.children.length - 1)
        treeDataMap.value[id] = idArr
      }
    }
  }
  // console.log('treeData', treeData.value, treeDataMap.value)
  treeData.value = filter(treeData.value, (item) => {
    item['key'] = item.id
    item['title'] = item.name
    item['icon'] = item.area && item.area.length > 0 ? LEAF_ICON : BRANCH_ICON
    // item.nodeLevel === 0
    //   ? 'ic:outline-folder'
    //   : item.nodeLevel === 1
    //   ? 'ic:outline-folder-copy'
    //   : 'clarity:network-switch-line'
    return true
  })
  return true
  // treeData.value = filter([], (item) => {
  //   item['key'] = item.id
  //   item['title'] = item.name
  //   item['icon'] =
  //     item.nodeLevel === 0
  //       ? 'ic:outline-folder'
  //       : item.nodeLevel === 1
  //       ? 'ic:outline-folder-copy'
  //       : 'clarity:network-switch-line'
  //   return true
  // })
}
/**
 * 编辑树节点名字
 * @param value 更新后的节点数据
 */
const editTreeNode = (value) => {
  const { id, name } = value
  const idArr = treeDataMap.value[id]
  let nodeArr = treeData.value
  // 遍历节点的索引数组，找到节点所在一级的节点数组
  for (let index = 0; index < idArr.length; index++) {
    const element = nodeArr[idArr[index]]
    if (index < idArr.length - 1) {
      nodeArr = element.children
    } else {
      // 检查节点所在一级的节点数组是否有重复的节点名字
      if (nodeArr.find((item) => item.name === name && item.id !== id)) {
        message.error('节点名称不能与同级其他节点重复')
        return false
      }
      // 没有重复的则更新节点名字
      element.name = name
      element.title = name
      treeData.value = cloneDeep(treeData.value)
    }
  }
  return true
}
/**
 * 发送删除标注形状的信号
 * @param areaArr 待删除的形状数组
 */
const deleteArea = (areaArr) => {
  emit('delArea', areaArr)
}
/**
 * 删除树节点
 * @param nodeValue 待删除的节点数据
 */
const deleteTreeNode = (nodeValue) => {
  const { id, children, area } = nodeValue
  deleteArea(area || [])
  const idArr = treeDataMap.value[id]
  let nodeArr = treeData.value
  const childrenTemp = children || []
  const stackTemp = []
  // 遍历节点的索引数组，找到节点所在一级的节点数组
  for (let index = 0; index < childrenTemp.length; index++) {
    const element = childrenTemp[index]
    stackTemp.push(element)
    while (stackTemp.length > 0) {
      const item = stackTemp.pop()
      deleteArea(item.area || [])
      const itemChildren = item.children || []
      for (let index = 0; index < itemChildren.length; index++) {
        stackTemp.push(itemChildren[index])
      }
    }
  }
  // 遍历节点的索引数组，找到节点所在一级的节点数组，并删除待删除节点
  for (let index = 0; index < idArr.length; index++) {
    if (index < idArr.length - 1) {
      nodeArr = nodeArr[idArr[index]].children
    } else {
      const delIndex = nodeArr.findIndex((node) => node.id === id)
      // 删除节点
      nodeArr.splice(delIndex, 1)
      // 更新删除节点后面节点及其字节点的索引数组
      for (let indexTemp = delIndex; indexTemp < nodeArr.length; indexTemp++) {
        const element = nodeArr[indexTemp]
        stackTemp.push(element)
        while (stackTemp.length > 0) {
          const item = stackTemp.pop()
          // 删除节点所在层级的索引值减1
          treeDataMap.value[item.id][index] = treeDataMap.value[item.id][index] - 1
          const itemChildren = item.children || []
          for (let index = 0; index < itemChildren.length; index++) {
            stackTemp.push(itemChildren[index])
          }
        }
      }
    }
  }
  // 重新渲染树结构
  treeData.value = cloneDeep(treeData.value)
}

const handleAddRoot = () => {
  openModal(true, {
    isUpdate: false,
    data: {
      parentId: '',
      nodeLevel: 1,
    },
  })
}
// 右侧弹出层结束编辑并关闭后的回调方法
const handleModalSuccess = (value, callbackForModal) => {
  const { isUpdate, ...treeData } = value
  let result = false
  if (!isUpdate) {
    result = addTreeNode(treeData)
  } else {
    result = editTreeNode(treeData)
  }
  if (result) {
    const { parentId } = value
    emit('closeMarkMode', parentId)
  }
  callbackForModal(result)
  // if (currentCategoryId.value) {
  //   // 找到编辑后节点新数据
  //   const treeItem = treeToList(treeData.value).filter(
  //     (item: CategoryTreeItem) => item.id === currentCategoryId.value
  //   )[0]
  //   // // 更新节点的名字
  //   // emit('getCategoryId', treeItem?.categoryId, treeItem?.name)
  // }
}
const isButtonActive = (buttonType: string, eventKey: string) => {
  const treeItem = treeToList(treeData.value).filter((item) => item.id === eventKey)[0]
  let result = false
  switch (buttonType) {
    case 'view':
      result = treeItem.nodeLevel === 2
      break
    case 'create':
      result = treeItem.nodeLevel < 2
      break
  }
  return result
}
const getRightMenuList = (node): ContextMenuItem[] => {
  const treeItem = treeToList(treeData.value).filter((item) => item.id === node.eventKey)[0]
  // 如果当前节点有子节点，则不显示右键菜单
  if (treeItem.children && treeItem.children.length > 0) {
    return []
  }
  return [
    // {
    //   label: `新增${treeItem.nodeLevel + 1}级属性`,
    //   icon: 'clarity:plus-line',
    //   ifShow: !treeItem.area || !treeItem.area.length,
    //   // disabled: !isButtonActive('create', node.eventKey),
    //   handler: () => {
    //     openModal(true, {
    //       data: {
    //         parentId: treeItem.id,
    //         nodeLevel: treeItem.nodeLevel + 1,
    //       },
    //     })
    //   },
    // },
    {
      label: '新增区域',
      icon: 'clarity:plus-line',
      ifShow: !treeItem.children || treeItem.children.length === 0,
      // disabled: !isButtonActive('create', node.eventKey),
      handler: () => {
        emit('addArea', treeItem)
      },
    },
    // {
    //   label: '编辑',
    //   icon: 'clarity:note-edit-line',
    //   handler: () => {
    //     openModal(true, {
    //       data: {
    //         ...treeItem,
    //       },
    //       isUpdate: true,
    //     })
    //   },
    // },
    // {
    //   label: '删除',
    //   icon: 'clarity:trash-line',
    //   handler: () => {
    //     const { createConfirm } = useMessage()
    //     createConfirm({
    //       iconType: 'warning',
    //       title: () => h('span', '温馨提示'),
    //       content: () =>
    //         h(
    //           'span',
    //           !treeItem.children || treeItem.children.length === 0
    //             ? '是否确认删除节点？'
    //             : '是否确认删除节点，及其子节点？'
    //         ),
    //       onOk: async () => {
    //         deleteTreeNode(treeItem)
    //         // if (treeItem.children.length === 0) {
    //         //   // await deleteCategoryTreeItem({ categoryId: node.eventKey })
    //         //   handleGetTreeData()
    //         //   // // 如果删除的节点是之前选择的节点，则清除右侧显示的列表信息
    //         //   // if (node.eventKey === currentCategoryId.value) {
    //         //   //   emit('getCategoryId', '')
    //         //   // }
    //         // }
    //       },
    //     })
    //   },
    // },
  ]
}
/**
 * 选择或取消选择树节点时触发的方法
 * @param list 选中树节点id数组
 */
const handleSelect = (list) => {
  const idSelected = new Set(list)
  const treeArr = treeToList(treeData.value)
  const treeItems = []
  // 找到所有的选中节点数据
  for (let index = 0; index < treeArr.length; index++) {
    const element = treeArr[index]
    if (idSelected.has(element.id)) {
      treeItems.push(element)
      idSelected.delete(element.id)
    }
    if (idSelected.size <= 0) {
      break
    }
  }
  // const treeItem = treeToList(treeData.value).filter((item: PropertyTreeItem) => item.id === list[0])[0]
  // 获取所有选中节点对应的形状数组
  const areaArr = treeItems.reduce((prev, cur) => {
    const areaTemp = cur.area || []
    return [...areaTemp, ...prev]
  }, [])
  emit('changeArea', areaArr)
  // 如果选中节点不为1个，则取消新对象标注，否则，则根据选择的节点id进行判断是否取消新对象标注
  emit('selectPropery', treeItems.length !== 1 ? '' : treeItems[0].id)
  // emit('getCategoryId', treeItem.categoryId, treeItem.name)
  // // 保存当前选择的节点id
  // currentCategoryId.value = treeItem.categoryId
}
/**
 * 新增或删除绘制形状时触发的方法
 * @param shapeData 变化的形状数据
 * @param tag 标识量：0，表示新增；1，表示删除
 */
const changeDataAfterSave = (shapeData, tag) => {
  // console.log('#####shapeData', shapeData, tag)
  if (shapeData) {
    let needClone = false
    const dataArr = !Array.isArray(shapeData) ? [shapeData] : shapeData
    for (let index = 0; index < dataArr.length; index++) {
      const shapeItem = dataArr[index]
      const { propertyId, type } = shapeItem
      if (propertyId) {
        const idArr = treeDataMap.value[propertyId] || []
        let tempData = treeData.value
        for (let index = 0; index < idArr.length; index++) {
          const element = tempData[idArr[index]]
          // 未到最后一个元素，则进入子节点数组中继续查找
          if (index < idArr.length - 1) {
            tempData = element.children
          } else {
            // 如果是节点之前没有形状，且新增形状
            if (!element.area && tag === 0) {
              element.area = [shapeItem]
              element.icon = LEAF_ICON
              needClone = true
              // console.log('xxxx', element.area)
            } else {
              // console.log('ssss', element.area)
              // 如果之前有形状数组属性，且是新增形状
              if (tag === 0) {
                if (!element.area.find((item) => item.type === type)) {
                  element.area.push(shapeItem)
                  // 如果新增之前没有形状，则修改图标
                  if (element.area.length === 1) {
                    element.icon = LEAF_ICON
                    needClone = true
                  }
                }
              } else {
                // 删除形状，则从area属性中寻找该形状
                const index = element.area.findIndex((item) => item.type === type)
                // 找到则删除
                if (index >= 0) {
                  element.area.splice(index, 1)
                  // 如果已经删除完所有形状，则修改图标
                  if (element.area.length === 0) {
                    element.icon = BRANCH_ICON
                    needClone = true
                  }
                }
              }
              // tag === 0 ? element.areaSet.add(type) : element.areaSet ? element.areaSet.delete(type) : ''
              // console.log('ssss22', element.area)
            }
          }
        }
      }
    }
    // 如果图标有变化，则需要重新绘制左侧树结构，因此对树的数据进行重新赋值
    if (needClone) {
      treeData.value = cloneDeep(treeData.value)
    }
  }
}
/**
 * 改变形状的点位置后，修改对应treeData数据中形状的点位置
 * @param shapeData 变化形状对象
 */
const changeDataAfterDrag = (shapeData) => {
  if (shapeData) {
    const { propertyId, type, pointSource } = shapeData
    if (propertyId) {
      const idArr = treeDataMap.value[propertyId] || []
      let tempData = treeData.value
      for (let index = 0; index < idArr.length; index++) {
        const element = tempData[idArr[index]]
        // 未到最后一个元素，则进入子节点数组中继续查找
        if (index < idArr.length - 1) {
          tempData = element.children
        } else {
          // 在形状所在数组中查找对应形状对象
          const changeArea = (element.area || []).find((item) => item.type === type)
          if (changeArea) {
            // 修改坐标点
            changeArea.pointSource = pointSource
          }
        }
      }
    }
  }
}

const getTreeData = () => {
  return toRaw(treeData.value)
}

const setTreeData = (data, dataMap) => {
  treeData.value = data
  treeDataMap.value = dataMap
  // console.log('####', data, dataMap)
}

const handleGetData = () => {
  emit('getData', toRaw(treeData.value))
}
defineExpose({ changeDataAfterSave, getTreeData, setTreeData, initTreeData, changeDataAfterDrag })
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
  .ant-radio-button-wrapper {
    padding: 0 15px;
  }
}
.w-230px {
  width: 230px;
}
.active-bg {
  background-color: #a5d4ff;
}
</style>
