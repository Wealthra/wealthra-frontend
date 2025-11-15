export interface UserData {
  email?: string
  id?: string | number
  firstName?: string
  lastName?: string
  lastLogin?: string
  [key: string]: unknown
}
