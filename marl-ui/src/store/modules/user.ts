import { RoleEnum } from '@/core/enums/roleEnum'
import { defineStore } from 'pinia'
import { store } from '@/store'
type UserInfo = Record<string, any>
interface UserState {
  userInfo: UserInfo
  token?: string
  roleList: RoleEnum[]
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => {
    return {
      userInfo: {},
      token: '',
      roleList: [],
    }
  },
  getters: {
    getUserInfo(): UserInfo {
      return this.userInfo
    },
    getToken(): string | undefined {
      return this.token
    },
    getRoleList(): RoleEnum[] {
      return this.roleList
    },
  },
  actions: {
    setUserInfo(info: UserInfo) {
      this.userInfo = info
    },
    setToken(info: string | undefined) {
      this.token = info ? info : ''
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList
    },

    async getUserInfoAction(): Promise<UserInfo> {
      // 调用 用户信息api
      // const userInfo = await getUserInfo();
      const userInfo = {
        roles: [RoleEnum.SUPER, RoleEnum.TEST],
        name: 'lgj',
        age: 28,
      }
      const { roles = [] } = userInfo
      this.setRoleList(roles)
      this.setUserInfo(userInfo)
      return userInfo
    },
  },
})

export function useUserStoreWithOut() {
  return useUserStore(store)
}
