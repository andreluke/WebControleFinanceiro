import { Dialog } from '@/components/ui'
import { TransactionModal, CategoryModal, PaymentMethodModal, SubcategoryModal } from '.'
import type { Category, Subcategory } from '@/types/category'
import type { PaymentMethod } from '@/types/paymentMethod'
import type { Transaction } from '@/types/transaction'

interface TransfersModalsProps {
  transactionOpen: boolean
  categoryOpen: boolean
  subcategoryOpen: boolean
  paymentOpen: boolean
  transaction: Transaction | null
  editingCategory: Category | null
  editingSubcategory: Subcategory | null
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
  onEditCategory: (category: Category | null) => void
  onEditSubcategory: (subcategory: Subcategory | null) => void
}

export function TransfersModals({
  transactionOpen,
  categoryOpen,
  subcategoryOpen,
  paymentOpen,
  transaction,
  editingCategory,
  editingSubcategory,
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
  onEditCategory,
  onEditSubcategory,
}: TransfersModalsProps) {
  const handleCloseCategory = () => {
    onCloseCategory()
    onEditCategory(null)
  }

  const handleCloseSubcategory = () => {
    onCloseSubcategory()
    onEditSubcategory(null)
  }

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

      <Dialog open={categoryOpen} onOpenChange={(open) => !open && handleCloseCategory()}>
        <CategoryModal
          isOpen={categoryOpen}
          onClose={handleCloseCategory}
          category={editingCategory}
          categories={categories}
          onCategorySelect={onCategorySelect}
          onEdit={onEditCategory}
        />
      </Dialog>

      <Dialog open={subcategoryOpen} onOpenChange={(open) => !open && handleCloseSubcategory()}>
        <SubcategoryModal
          isOpen={subcategoryOpen}
          onClose={handleCloseSubcategory}
          subcategory={editingSubcategory}
          categoryId={selectedCategoryId}
          onEdit={onEditSubcategory}
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
