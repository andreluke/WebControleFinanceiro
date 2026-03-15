import { useState } from 'react'
import type { Transaction } from '@/types/transaction'

interface UseTransactionModalsReturn {
  transactionModal: boolean
  categoryModal: boolean
  subcategoryModal: boolean
  paymentModal: boolean
  editingTransaction: Transaction | null
  initialCategoryId: string | undefined
  initialPaymentMethodId: string | undefined
  selectedCategoryId: string | undefined
  setTransactionModal: (open: boolean) => void
  setCategoryModal: (open: boolean) => void
  setSubcategoryModal: (open: boolean) => void
  setPaymentModal: (open: boolean) => void
  setInitialCategoryId: (id: string | undefined) => void
  setInitialPaymentMethodId: (id: string | undefined) => void
  setSelectedCategoryId: (id: string | undefined) => void
  openCreate: () => void
  openEdit: (transaction: Transaction) => void
  closeTransaction: () => void
  openCategorySelect: (categoryId: string) => void
  openPaymentMethodSelect: (methodId: string) => void
}

export function useTransactionModals(initialOpen = false): UseTransactionModalsReturn {
  const [transactionModal, setTransactionModal] = useState(initialOpen)
  const [categoryModal, setCategoryModal] = useState(false)
  const [subcategoryModal, setSubcategoryModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [initialCategoryId, setInitialCategoryId] = useState<string | undefined>()
  const [initialPaymentMethodId, setInitialPaymentMethodId] = useState<string | undefined>()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()

  function openCreate() {
    setEditingTransaction(null)
    setInitialCategoryId(undefined)
    setInitialPaymentMethodId(undefined)
    setTransactionModal(true)
  }

  function openEdit(transaction: Transaction) {
    setEditingTransaction(transaction)
    setInitialCategoryId(undefined)
    setInitialPaymentMethodId(undefined)
    setTransactionModal(true)
  }

  function closeTransaction() {
    setTransactionModal(false)
    setEditingTransaction(null)
    setInitialCategoryId(undefined)
    setInitialPaymentMethodId(undefined)
  }

  function openCategorySelect(categoryId: string) {
    setInitialCategoryId(categoryId)
    setInitialPaymentMethodId(undefined)
    setEditingTransaction(null)
    setTransactionModal(true)
  }

  function openPaymentMethodSelect(methodId: string) {
    setInitialPaymentMethodId(methodId)
    setInitialCategoryId(undefined)
    setEditingTransaction(null)
    setTransactionModal(true)
  }

  return {
    transactionModal,
    categoryModal,
    subcategoryModal,
    paymentModal,
    editingTransaction,
    initialCategoryId,
    initialPaymentMethodId,
    selectedCategoryId,
    setTransactionModal,
    setCategoryModal,
    setSubcategoryModal,
    setPaymentModal,
    setInitialCategoryId,
    setInitialPaymentMethodId,
    setSelectedCategoryId,
    openCreate,
    openEdit,
    closeTransaction,
    openCategorySelect,
    openPaymentMethodSelect,
  }
}
