export interface RecentExpenseHistory {
  id: number
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  created: string
  categoryId: number
  categoryName: string
}
