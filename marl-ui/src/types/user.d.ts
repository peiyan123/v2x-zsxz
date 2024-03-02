export interface LoginRequest {
  password: string
  username: string
}

export interface LoginResponse {
  username: string
  token: string
}

export type ResetFormState = {
  old_password: string
  new_password: string
  confirm_password: string
}
