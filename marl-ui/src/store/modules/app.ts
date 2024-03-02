import { defineStore } from 'pinia'
import { store } from '@/store'
import { ProjectConfig } from '@/types/config'
import { deepMerge } from '@/utils'
import { MenuModeEnum, MenuTypeEnum } from '@/core/enums/menuEnum'
import * as mecApi from '@/services/api/mecApi'

export interface BeforeMiniState {
  menuCollapsed?: boolean
  menuSplit?: boolean
  menuMode?: MenuModeEnum
  menuType?: MenuTypeEnum
}

interface AppState {
  collapsed: boolean
  isReboot1: boolean
  isReboot2: boolean,
  isReboot3: boolean,
  projectConfig: any
  beforeMiniInfo: BeforeMiniState
}

export const useAppStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    collapsed: false,
    isReboot1: false,
    isReboot2: false,
    isReboot3: false,
    projectConfig: {},
    beforeMiniInfo: {},
  }),
  getters: {
    getCollapsed(): boolean {
      return this.collapsed
    },
    getProjectConfig(): ProjectConfig {
      return this.projectConfig || ({} as ProjectConfig)
    },
    getBeforeMiniInfo(): BeforeMiniState {
      return this.beforeMiniInfo
    },
  },
  actions: {
    setCollapsed(state: boolean): void {
      this.collapsed = state
    },
    setReboot(state: boolean): void {
      const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
      if (tab === '3') {
        this.isReboot3 = state
        localStorage.setItem('isReboot3', state.toString())
      } else if (tab === '2') {
        this.isReboot2 = state
        localStorage.setItem('isReboot2', state.toString())
      } else {
        this.isReboot1 = state
        localStorage.setItem('isReboot1', state.toString())
      }
    },
    setProjectConfig(config: DeepPartial<ProjectConfig>): void {
      this.projectConfig = deepMerge(this.projectConfig || {}, config)
    },
    setBeforeMiniInfo(state: BeforeMiniState): void {
      this.beforeMiniInfo = state
    },
    /**
     * 调用应用当前配置的接口使配置生效，并隐藏顶部导航栏的提示消息“设备配置有变动,重启应用生效”
     */
    async saveApplay() {
      await mecApi.saveApply()
      const tab = location.hash.indexOf('/index2') !== -1 ? '2' : location.hash.indexOf('/index3') !== -1 ? '3' : ''
      if(tab === '2') {
        this.setReboot2(false)
      } else if (tab === '3') {
        this.setReboot3(false)
      } else {
        this.setReboot1(false)
      }
    },
  },
})

// Need to be used outside the setup
export function useAppStoreWithOut() {
  return useAppStore(store)
}
