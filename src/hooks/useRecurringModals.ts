import { useState } from 'react'
import type { RecurringTransaction } from '@/types/recurring'

interface UseRecurringModalsReturn {
  isOpen: boolean
  editingRecurring: RecurringTransaction | null
  setOpen: (open: boolean) => void
  openCreate: () => void
  openEdit: (recurring: RecurringTransaction) => void
  close: () => void
}

export function useRecurringModals(): UseRecurringModalsReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)

  function openCreate() {
    setEditingRecurring(null)
    setIsOpen(true)
  }

  function openEdit(recurring: RecurringTransaction) {
    setEditingRecurring(recurring)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    setEditingRecurring(null)
  }

  return {
    isOpen,
    editingRecurring,
    setOpen: setIsOpen,
    openCreate,
    openEdit,
    close,
  }
}
