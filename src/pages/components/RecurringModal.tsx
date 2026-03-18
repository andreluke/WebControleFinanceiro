import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import type { RecurringTransaction, TransactionTypeR } from "@/types/recurring";
import type { FrequencyType } from "@/types/recurring";
import type { RecurringFormData } from "../RecurringPage.schemas";
import {
  recurringSchema,
  frequencyOptions,
  dayOfWeekOptions,
} from "../RecurringPage.schemas";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
} from "@/hooks/useRecurringTransactions";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays } from "lucide-react";
import { useRef } from "react";
import { useSubcategories } from "@/hooks/useSubcategories";
import { useCategories } from "@/hooks/useCategories";

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurring: RecurringTransaction | null;
}

const defaultValues: RecurringFormData = {
  description: "",
  subDescription: "",
  amount: 0,
  type: "expense",
  frequency: "monthly",
  dayOfMonth: 1,
  dayOfWeek: undefined,
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: "",
  categoryId: "",
  subcategoryId: "",
  paymentMethodId: "",
};

function toInputDate(isoDate: string) {
  return format(new Date(isoDate), "yyyy-MM-dd");
}

function toApiDate(inputDate: string) {
  return `${inputDate}T12:00:00.000Z`;
}

function formatCurrencyMasked(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseCurrencyMasked(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function RecurringModal({
  isOpen,
  onClose,
  recurring,
}: RecurringModalProps) {
  const { toast } = useToast();
  const createRecurring = useCreateRecurringTransaction();
  const updateRecurring = useUpdateRecurringTransaction();

  const form = useForm<RecurringFormData>({
    resolver: zodResolver(recurringSchema),
    defaultValues,
  });

  const selectedType = useWatch({ control: form.control, name: "type" });
  const selectedFrequency = useWatch({
    control: form.control,
    name: "frequency",
  });
  const selectedDayOfWeek = useWatch({
    control: form.control,
    name: "dayOfWeek",
  });
  const selectedCategoryId = useWatch({ control: form.control, name: "categoryId" });

  const { data: allSubcategories = [] } = useSubcategories();
  const { data: categories = [] } = useCategories();

  const subcategories = selectedCategoryId && selectedCategoryId !== "none"
    ? allSubcategories.filter((s: { categoryId: string }) => s.categoryId === selectedCategoryId)
    : [];

  const isEditing = !!recurring;
  const isLoading = createRecurring.isPending || updateRecurring.isPending;

  useEffect(() => {
    if (isOpen) {
      if (recurring) {
        form.reset({
          description: recurring.description,
          subDescription: recurring.subDescription ?? "",
          amount: Number(recurring.amount),
          type: recurring.type,
          frequency: recurring.frequency,
          customIntervalDays: recurring.customIntervalDays ?? undefined,
          dayOfMonth: recurring.dayOfMonth,
          dayOfWeek: recurring.dayOfWeek ?? undefined,
          startDate: toInputDate(recurring.startDate),
          endDate: recurring.endDate ? toApiDate(recurring.endDate) : "",
          categoryId: recurring.categoryId ?? "",
          subcategoryId: recurring.subcategoryId ?? "",
          paymentMethodId: recurring.paymentMethodId ?? "",
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [isOpen, recurring, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      description: values.description,
      subDescription: values.subDescription?.trim() || undefined,
      amount: values.amount,
      type: values.type,
      frequency: values.frequency,
      customIntervalDays:
        values.frequency === "custom" ? values.customIntervalDays : undefined,
      dayOfMonth: values.dayOfMonth,
      dayOfWeek: values.dayOfWeek,
      startDate: toApiDate(values.startDate),
      endDate: values.endDate ? toApiDate(values.endDate) : undefined,
      categoryId:
        values.categoryId && values.categoryId !== "none"
          ? values.categoryId
          : undefined,
      subcategoryId:
        values.subcategoryId && values.subcategoryId !== "none"
          ? values.subcategoryId
          : undefined,
      paymentMethodId:
        values.paymentMethodId && values.paymentMethodId !== "none"
          ? values.paymentMethodId
          : undefined,
    };

    try {
      if (recurring) {
        await updateRecurring.mutateAsync({ id: recurring.id, body: payload });
        toast({
          title: "Transacao atualizada",
          description: "As informacoes foram salvas.",
        });
      } else {
        await createRecurring.mutateAsync(payload);
        toast({
          title: "Transacao criada",
          description: "A nova transacao recorrente foi adicionada.",
        });
      }
      onClose();
      form.reset();
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Revise os dados e tente novamente.",
        variant: "destructive",
      });
    }
  });

  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);

  function openStartDatePicker() {
    startDateRef.current?.showPicker();
  }

  function openEndDatePicker() {
    endDateRef.current?.showPicker();
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isEditing
            ? "Editar transacao recorrente"
            : "Nova transacao recorrente"}
        </DialogTitle>
        <DialogDescription>
          Defina os detalhes da transacao que se repetira automaticamente.
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="description">Descricao</Label>
          <Input
            id="description"
            placeholder="Ex: Assinatura Netflix"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-danger text-xs">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subDescription">Observacao (opcional)</Label>
          <Input
            id="subDescription"
            placeholder="Ex: Plano familiar"
            {...form.register("subDescription")}
          />
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="top-1/2 left-3 absolute font-medium text-secondary text-sm -translate-y-1/2 pointer-events-none">
                R$
              </span>
              <Controller
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    className="pl-10"
                    value={formatCurrencyMasked(Number(field.value) || 0)}
                    onChange={(e) =>
                      field.onChange(parseCurrencyMasked(e.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-danger text-xs">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={selectedType}
              onValueChange={(value) =>
                form.setValue("type", value as TransactionTypeR)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="space-y-2">
            <Label>Frequencia</Label>
            <Select
              value={selectedFrequency}
              onValueChange={(value) =>
                form.setValue("frequency", value as FrequencyType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFrequency === "weekly" && (
            <div className="space-y-2">
              <Label>Dia da semana</Label>
              <Select
                value={selectedDayOfWeek?.toString() ?? ""}
                onValueChange={(value) =>
                  form.setValue("dayOfWeek", Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {dayOfWeekOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(selectedFrequency === "monthly" ||
            selectedFrequency === "yearly") && (
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Dia do mes (1-31)</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min={1}
                max={31}
                {...form.register("dayOfMonth", { valueAsNumber: true })}
              />
              {form.formState.errors.dayOfMonth && (
                <p className="text-danger text-xs">
                  {form.formState.errors.dayOfMonth.message}
                </p>
              )}
            </div>
          )}
        </div>

        {selectedFrequency !== "weekly" &&
          selectedFrequency !== "custom" &&
          form.formState.errors.dayOfWeek && (
            <p className="text-danger text-xs">
              {form.formState.errors.dayOfWeek.message}
            </p>
          )}

        {selectedFrequency === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customIntervalDays">Intervalo (dias)</Label>
            <Input
              id="customIntervalDays"
              type="number"
              min={1}
              max={365}
              placeholder="Ex: 15"
              {...form.register("customIntervalDays", { valueAsNumber: true })}
            />
            {form.formState.errors.customIntervalDays && (
              <p className="text-danger text-xs">
                {form.formState.errors.customIntervalDays.message}
              </p>
            )}
          </div>
        )}

        <div className="gap-4 grid grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data inicial</Label>

            <div className="relative">
              <Controller
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <Input
                    id="startDate"
                    type="date"
                    {...field}
                    ref={(el) => {
                      startDateRef.current = el;
                      field.ref(el);
                    }}
                    className="[&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [color-scheme:dark] [appearance:textfield]"
                  />
                )}
              />

              <button
                type="button"
                aria-label="Abrir calendario"
                className="top-1/2 right-2 absolute p-1 rounded text-secondary hover:text-foreground -translate-y-1/2"
                onClick={openStartDatePicker}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Data final (opcional)</Label>

            <div className="relative">
              <Controller
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <Input
                    id="endDate"
                    type="date"
                    {...field}
                    ref={(el) => {
                      endDateRef.current = el;
                      field.ref(el);
                    }}
                    className="[&::-webkit-calendar-picker-indicator]:opacity-0 pr-10 [&::-webkit-calendar-picker-indicator]:pointer-events-none [color-scheme:dark] [appearance:textfield]"
                  />
                )}
              />

              <button
                type="button"
                aria-label="Abrir calendario"
                className="top-1/2 right-2 absolute p-1 rounded text-secondary hover:text-foreground -translate-y-1/2"
                onClick={openEndDatePicker}
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="gap-4 grid grid-cols-2">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={selectedCategoryId || "none"}
              onValueChange={(value) => {
                form.setValue("categoryId", value);
                form.setValue("subcategoryId", "none");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategoryId && selectedCategoryId !== "none" && (
            <div className="space-y-2">
              <Label>Subcategoria</Label>
              <Select
                value={form.getValues("subcategoryId") || "none"}
                onValueChange={(value) => form.setValue("subcategoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem subcategoria</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar alteracoes"
            ) : (
              "Criar transacao"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
