<template>
  <div class="flex px-2 py-1.5 items-center basic-tree-header" :class="getTreeTitleClass">
    <slot name="headerTitle" v-if="$slots.headerTitle"></slot>
    <BasicTitle :helpMessage="helpMessage" v-if="!$slots.headerTitle && title">
      {{ title }}
    </BasicTitle>

    <div class="flex flex-1 justify-self-stretch items-center cursor-pointer" v-if="search || toolbar">
      <div :class="getInputSearchCls" v-if="search">
        <InputSearch :placeholder="t('common.searchText')" size="small" allowClear v-model:value="searchValue" />
      </div>
      <Dropdown @click.prevent v-if="toolbar">
        <Icon icon="ion:ellipsis-vertical" />
        <template #overlay>
          <Menu @click="handleMenuClick">
            <template v-for="item in toolbarList" :key="item.value">
              <MenuItem v-bind="{ key: item.value }">
                {{ item.label }}
              </MenuItem>
              <MenuDivider v-if="item.divider" />
            </template>
          </Menu>
        </template>
      </Dropdown>
    </div>
    <slot name="treeTitle" v-if="$slots.treeTitle"></slot>
  </div>
</template>
<script lang="ts">
import { PropType } from 'vue'
import { defineComponent, computed, ref, watch } from 'vue'

import { Dropdown, Menu, Input } from 'ant-design-vue'
import { Icon } from '@/components/Icon'
import { BasicTitle } from '@/components/Basic'

import { propTypes } from '@/utils/propTypes'

import { useI18n } from '@/core/hooks/useI18n'
import { useDebounceFn } from '@vueuse/core'

enum ToolbarEnum {
  SELECT_ALL,
  UN_SELECT_ALL,
  EXPAND_ALL,
  UN_EXPAND_ALL,
  CHECK_STRICTLY,
  CHECK_UN_STRICTLY,
}

interface MenuInfo {
  key: ToolbarEnum
}
export default defineComponent({
  name: 'BasicTreeHeader',
  components: {
    BasicTitle,
    Icon,
    Dropdown,
    Menu,
    MenuItem: Menu.Item,
    MenuDivider: Menu.Divider,
    InputSearch: Input.Search,
  },
  props: {
    helpMessage: {
      type: [String, Array] as PropType<string | string[]>,
      default: '',
    },
    title: propTypes.string,
    toolbar: propTypes.bool,
    checkable: propTypes.bool,
    search: propTypes.bool,
    checkAll: propTypes.func,
    expandAll: propTypes.func,
    searchText: propTypes.string,
  },
  emits: ['strictly-change', 'search'],
  setup(props, { emit, slots }) {
    const { t } = useI18n()
    const searchValue = ref('')
    // 如果有名为treeTitle的slot，则设置class以修改样式
    const getTreeTitleClass = computed(() => [
      {
        'has-tree-title': slots.treeTitle,
      },
    ])
    const getInputSearchCls = computed(() => {
      const titleExists = slots.headerTitle || props.title
      return [
        'mr-1',
        'w-full',
        // titleExists ? 'w-2/3' : 'w-full',
        {
          ['ml-5']: titleExists,
        },
      ]
    })

    const toolbarList = computed(() => {
      const { checkable } = props
      const defaultToolbarList = [
        { label: t('component.tree.expandAll'), value: ToolbarEnum.EXPAND_ALL },
        {
          label: t('component.tree.unExpandAll'),
          value: ToolbarEnum.UN_EXPAND_ALL,
          divider: checkable,
        },
      ]

      return checkable
        ? [
            { label: t('component.tree.selectAll'), value: ToolbarEnum.SELECT_ALL },
            {
              label: t('component.tree.unSelectAll'),
              value: ToolbarEnum.UN_SELECT_ALL,
              divider: checkable,
            },
            ...defaultToolbarList,
            { label: t('component.tree.checkStrictly'), value: ToolbarEnum.CHECK_STRICTLY },
            { label: t('component.tree.checkUnStrictly'), value: ToolbarEnum.CHECK_UN_STRICTLY },
          ]
        : defaultToolbarList
    })

    function handleMenuClick(e: MenuInfo) {
      const { key } = e
      switch (key) {
        case ToolbarEnum.SELECT_ALL:
          ;(props.checkAll as any)?.(true)
          break
        case ToolbarEnum.UN_SELECT_ALL:
          ;(props.checkAll as any)?.(false)
          break
        case ToolbarEnum.EXPAND_ALL:
          ;(props.checkAll as any)?.(true)
          break
        case ToolbarEnum.UN_EXPAND_ALL:
          ;(props.checkAll as any)?.(false)
          break
        case ToolbarEnum.CHECK_STRICTLY:
          emit('strictly-change', false)
          break
        case ToolbarEnum.CHECK_UN_STRICTLY:
          emit('strictly-change', true)
          break
      }
    }

    function emitChange(value?: string): void {
      emit('search', value)
    }
    const debounceEmitChange = useDebounceFn(emitChange, 200)

    watch(
      () => searchValue.value,
      (v) => {
        debounceEmitChange(v)
      }
    )
    watch(
      () => props.searchText,
      (v) => {
        if (v !== searchValue.value) {
          searchValue.value = v as string
        }
      }
    )
    // function handleSearch(e: ChangeEvent): void {
    //   debounceEmitChange(e.target.value);
    // }

    return { t, toolbarList, handleMenuClick, searchValue, getInputSearchCls, getTreeTitleClass }
  },
})
</script>
<style lang="less" scoped>
.basic-tree-header {
  border-bottom: 1px solid @border-color-base;
}

.has-tree-title {
  display: block;
}
</style>
