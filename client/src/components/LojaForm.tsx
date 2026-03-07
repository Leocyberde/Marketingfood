import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lojaSchema, type LojaInput } from "@shared/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LojaFormProps {
  initialData?: LojaInput;
  onSubmit: (data: LojaInput) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES = [
  "Pizzaria",
  "Restaurante",
  "Lanchonete",
  "Café",
  "Padaria",
  "Sorveteria",
  "Churrascaria",
  "Comida Rápida",
  "Comida Italiana",
  "Comida Japonesa",
  "Comida Chinesa",
  "Comida Mexicana",
  "Comida Árabe",
  "Comida Vegana",
  "Outro",
];

export function LojaForm({
  initialData,
  onSubmit,
  isLoading = false,
}: LojaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LojaInput>({
    resolver: zodResolver(lojaSchema),
    defaultValues: initialData || {
      nome: "",
      categoria: "",
      telefone: "",
      horarioFuncionamento: "",
    },
  });

  const categoria = watch("categoria");

  const handleFormSubmit = async (data: LojaInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success("Loja cadastrada com sucesso!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao cadastrar loja");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Loja *</Label>
        <Input
          id="nome"
          placeholder="Ex: Pizzaria do João"
          {...register("nome")}
          disabled={isLoading || isSubmitting}
          className={errors.nome ? "border-red-500" : ""}
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria *</Label>
        <Select
          value={categoria}
          onValueChange={(value) => setValue("categoria", value)}
          disabled={isLoading || isSubmitting}
        >
          <SelectTrigger
            id="categoria"
            className={errors.categoria ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoria && (
          <p className="text-sm text-red-500">{errors.categoria.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone *</Label>
        <Input
          id="telefone"
          placeholder="Ex: (11) 98765-4321"
          {...register("telefone")}
          disabled={isLoading || isSubmitting}
          className={errors.telefone ? "border-red-500" : ""}
        />
        {errors.telefone && (
          <p className="text-sm text-red-500">{errors.telefone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="horarioFuncionamento">Horário de Funcionamento</Label>
        <Textarea
          id="horarioFuncionamento"
          placeholder="Ex: Seg-Sex: 11:00 - 23:00&#10;Sáb-Dom: 11:00 - 00:00"
          {...register("horarioFuncionamento")}
          disabled={isLoading || isSubmitting}
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Descreva os horários de funcionamento da sua loja
        </p>
      </div>

      <Button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="w-full"
      >
        {isLoading || isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar Informações da Loja"
        )}
      </Button>
    </form>
  );
}
