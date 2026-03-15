import { Dialog } from '@/components/ui'
import { TransactionModal, CategoryModal, PaymentMethodModal, SubcategoryModal } from '.'
import type { Category } from '@/types/category'
import type { PaymentMethod } from '@/types/paymentMethod'
import type { Transaction } from '@/types/transaction'

interface TransfersModalsProps {
  transactionOpen: boolean
  categoryOpen: boolean
  subcategoryOpen: boolean
  paymentOpen: boolean
  transaction: Transaction | null
  categories: Category[]
  paymentMethods: PaymentMethod[]
  selectedCategoryId?: string
  initialCategoryId?: string
  initialPaymentMethodId?: string
  onCloseTransaction: () => void
  onCloseCategory: () => void
  onCloseSubcategory: () => void
  onClosePayment: () => void
  onCategorySelect: (categoryId: string) => void
  onPaymentMethodSelect: (methodId: string) => void
  onOpenCategory: () => void
  onOpenSubcategory: () => void
  onOpenPayment: () => void
}

export function TransfersModals({
  transactionOpen,
  categoryOpen,
  subcategoryOpen,
  paymentOpen,
  transaction,
  categories,
  paymentMethods,
  selectedCategoryId,
  initialCategoryId,
  initialPaymentMethodId,
  onCloseTransaction,
  onCloseCategory,
  onCloseSubcategory,
  onClosePayment,
  onCategorySelect,
  onPaymentMethodSelect,
  onOpenCategory,
  onOpenSubcategory,
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
          onOpenSubcategoryModal={onOpenSubcategory}
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

      <Dialog open={subcategoryOpen} onOpenChange={(open) => !open && onCloseSubcategory()}>
        <SubcategoryModal
          isOpen={subcategoryOpen}
          onClose={onCloseSubcategory}
          subcategory={null}
          categoryId={selectedCategoryId}
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
