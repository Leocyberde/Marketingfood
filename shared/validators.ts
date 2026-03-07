import { z } from "zod";

/**
 * Validators for Loja (Store) operations
 */
export const lojaSchema = z.object({
  nome: z.string().min(1, "Nome da loja é obrigatório").max(255),
  categoria: z.string().min(1, "Categoria é obrigatória").max(100),
  telefone: z.string().min(1, "Telefone é obrigatório").max(20),
  horarioFuncionamento: z.string().optional(),
});

export type LojaInput = z.infer<typeof lojaSchema>;

/**
 * Validators for Endereco (Address) operations
 */
export const enderecoSchema = z.object({
  rua: z.string().min(1, "Rua é obrigatória").max(255),
  numero: z.string().min(1, "Número é obrigatório").max(20),
  bairro: z.string().min(1, "Bairro é obrigatório").max(100),
  cidade: z.string().min(1, "Cidade é obrigatória").max(100),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido").max(10),
  latitude: z.string().min(1, "Latitude é obrigatória").max(50),
  longitude: z.string().min(1, "Longitude é obrigatória").max(50),
});

export type EnderecoInput = z.infer<typeof enderecoSchema>;

/**
 * Combined validator for store registration with address
 */
export const storeRegistrationSchema = z.object({
  loja: lojaSchema,
  endereco: enderecoSchema,
});

export type StoreRegistrationInput = z.infer<typeof storeRegistrationSchema>;
