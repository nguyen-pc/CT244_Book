import { defineStore } from 'pinia'
import { useApi, useApiPrivate } from '../composables/useApi'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name?: string
}

export interface State {
  user: User
  accessToken: string
  authReady: boolean
}

export interface LoginData {
  email: string
  password: string
}

export interface ResetPassword {
  userId: string
  token: string,
  password: string
}

export interface RegisterData {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export interface EditData {
  username: string
  email: string
  first_name: string
  last_name: string
}

export const useAuthStore = defineStore('auth', {
  state: (): State => {
    return {
      user: {} as User,
      accessToken: '' as string,
      authReady: false as boolean
    }
  },

  getters: {
    userDetail: (state: State) => state.user,
    isAuthenticated: (state: State) => (state.accessToken ? true : false)
  },

  actions: {
    async attempt() {
      try {
        await this.refresh()
        await this.getUser()
      } catch (error) {
        return
      }
      return
    },

    async login(payload: LoginData) {
      try {
        const { data } = await useApi().post(`/api/auth/login`, payload)
        this.accessToken = data.access_token
        await this.getUser()
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async forgotPassword(payload: LoginData) {
      try {
        const { data } = await useApi().post(`/api/auth/reset-password-request`, payload)
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async resetPassword(payload: ResetPassword) {
      console.log(payload)
      try {
        const { data } = await useApi().post(`/api/auth/reset-password`, payload)
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async register(payload: RegisterData) {
      try {
        const { data } = await useApi().post(`/api/auth/register`, payload)
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async getUser() {
      try {
        const { data } = await useApiPrivate().get(`/api/auth/user`)
        this.user = data
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async logout() {
      try {
        const { data } = await useApiPrivate().post(`/api/auth/logout`)
        this.accessToken = ''
        this.user = {} as User
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async getUserById(userId: string) {
      try {
        const { data } = await useApiPrivate().get(`/api/auth/user/${userId}`)
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async updateUser(userId: string, userData: any) {
      try {
        await useApiPrivate().put(`/api/auth/user/${userId}`, userData)
      } catch (error: Error | any) {
        throw error.message
      }
    },

    async refresh() {
      try {
        const { data } = await useApi().post(`/api/auth/refresh`)
        this.accessToken = data.access_token
        return data
      } catch (error: Error | any) {
        throw error.message
      }
    }
  }
})
