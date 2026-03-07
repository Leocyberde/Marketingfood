import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enderecoSchema, type EnderecoInput } from "@shared/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MapSelector } from "@/components/MapSelector";

interface EnderecoFormProps {
  initialData?: EnderecoInput;
  onSubmit: (data: EnderecoInput) => Promise<void>;
  isLoading?: boolean;
}

export function EnderecoForm({
  initialData,
  onSubmit,
  isLoading = false,
}: EnderecoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EnderecoInput>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: initialData || {
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      cep: "",
      latitude: "",
      longitude: "",
    },
  });

  const cep = watch("cep");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Handle CEP search (ViaCEP API)
  const handleCepSearch = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setValue("rua", data.logradouro);
      setValue("bairro", data.bairro);
      setValue("cidade", data.localidade);

      // Get coordinates from OpenStreetMap Nominatim
      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`
          )}&limit=1`
        );
        const nominatimData = await nominatimResponse.json();

        if (nominatimData.length > 0) {
          setValue("latitude", nominatimData[0].lat);
          setValue("longitude", nominatimData[0].lon);
        }
      } catch (error) {
        console.error("Error getting coordinates:", error);
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
      toast.error("Erro ao buscar CEP");
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Debounce CEP search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cep && cep.length >= 8) {
        handleCepSearch(cep);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cep]);

  const handleFormSubmit = async (data: EnderecoInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success("Endereço cadastrado com sucesso!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao cadastrar endereço");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (lat: string, lng: string) => {
    setValue("latitude", lat);
    setValue("longitude", lng);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cep">CEP *</Label>
        <Input
          id="cep"
          placeholder="Ex: 01310-100"
          {...register("cep")}
          disabled={isLoading || isSubmitting || isLoadingCep}
          className={errors.cep ? "border-red-500" : ""}
        />
        {isLoadingCep && (
          <p className="text-sm text-blue-500 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Buscando informações do CEP...
          </p>
        )}
        {errors.cep && (
          <p className="text-sm text-red-500">{errors.cep.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rua">Rua *</Label>
        <Input
          id="rua"
          placeholder="Ex: Rua das Flores"
          {...register("rua")}
          disabled={isLoading || isSubmitting}
          className={errors.rua ? "border-red-500" : ""}
        />
        {errors.rua && (
          <p className="text-sm text-red-500">{errors.rua.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            placeholder="Ex: 123"
            {...register("numero")}
            disabled={isLoading || isSubmitting}
            className={errors.numero ? "border-red-500" : ""}
          />
          {errors.numero && (
            <p className="text-sm text-red-500">{errors.numero.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            placeholder="Ex: Centro"
            {...register("bairro")}
            disabled={isLoading || isSubmitting}
            className={errors.bairro ? "border-red-500" : ""}
          />
          {errors.bairro && (
            <p className="text-sm text-red-500">{errors.bairro.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cidade">Cidade *</Label>
        <Input
          id="cidade"
          placeholder="Ex: São Paulo"
          {...register("cidade")}
          disabled={isLoading || isSubmitting}
          className={errors.cidade ? "border-red-500" : ""}
        />
        {errors.cidade && (
          <p className="text-sm text-red-500">{errors.cidade.message}</p>
        )}
      </div>

      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-lg">Localização no Mapa</h3>
        <MapSelector
          latitude={latitude}
          longitude={longitude}
          onLocationChange={handleLocationChange}
        />
      </div>

      {errors.latitude && (
        <p className="text-sm text-red-500">{errors.latitude.message}</p>
      )}
      {errors.longitude && (
        <p className="text-sm text-red-500">{errors.longitude.message}</p>
      )}

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
          "Salvar Endereço"
        )}
      </Button>
    </form>
  );
}
