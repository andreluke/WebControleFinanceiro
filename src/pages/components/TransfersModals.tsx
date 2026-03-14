import { Dialog } from '@/components/ui'
import { TransactionModal, CategoryModal, PaymentMethodModal } from '.'
import type { Category } from '@/types/category'
import type { PaymentMethod } from '@/types/paymentMethod'
import type { Transaction } from '@/types/transaction'

interface TransfersModalsProps {
  transactionOpen: boolean
  categoryOpen: boolean
  paymentOpen: boolean
  transaction: Transaction | null
  categories: Category[]
  paymentMethods: PaymentMethod[]
  initialCategoryId?: string
  initialPaymentMethodId?: string
  onCloseTransaction: () => void
  onCloseCategory: () => void
  onClosePayment: () => void
  onCategorySelect: (categoryId: string) => void
  onPaymentMethodSelect: (methodId: string) => void
  onOpenCategory: () => void
  onOpenPayment: () => void
}

export function TransfersModals({
  transactionOpen,
  categoryOpen,
  paymentOpen,
  transaction,
  categories,
  paymentMethods,
  initialCategoryId,
  initialPaymentMethodId,
  onCloseTransaction,
  onCloseCategory,
  onClosePayment,
  onCategorySelect,
  onPaymentMethodSelect,
  onOpenCategory,
  onOpenPayment,
}: TransfersModalsProps) {
  return (
    <>
      <Dialog open={transactionOpen} onOpenChange={(open) => !open && onCloseTransaction()}>
        <TransactionModal
          isOpen={transactionOpen}
          onClose={onCloseTransaction}
          transaction={transaction}
          categories={categories}
          paymentMethods={paymentMethods}
          initialCategoryId={initialCategoryId}
          initialPaymentMethodId={initialPaymentMethodId}
          onOpenCategoryModal={onOpenCategory}
          onOpenPaymentMethodModal={onOpenPayment}
        />
      </Dialog>

      <Dialog open={categoryOpen} onOpenChange={(open) => !open && onCloseCategory()}>
        <CategoryModal
          isOpen={categoryOpen}
          onClose={onCloseCategory}
          category={null}
          categories={categories}
          onCategorySelect={onCategorySelect}
        />
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={(open) => !open && onClosePayment()}>
        <PaymentMethodModal
          isOpen={paymentOpen}
          onClose={onClosePayment}
          paymentMethod={null}
          paymentMethods={paymentMethods}
          onPaymentMethodSelect={onPaymentMethodSelect}
        />
      </Dialog>
    </>
  )
}
