import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Store, MapPin } from "lucide-react";
import { LojaForm } from "@/components/LojaForm";
import { EnderecoForm } from "@/components/EnderecoForm";
import type { LojaInput, EnderecoInput } from "@shared/validators";
import { useLocation } from "wouter";

export default function PainelLojista() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("loja");

  // Fetch store data
  const { data: loja, isLoading: lojaLoading } = trpc.loja.obterLoja.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch address data
  const { data: endereco, isLoading: enderecoLoading } =
    trpc.loja.obterEndereco.useQuery(undefined, { enabled: !!user });

  // Mutations
  const cadastrarLojaMutation = trpc.loja.cadastrarLoja.useMutation();
  const cadastrarEnderecoMutation = trpc.loja.cadastrarEndereco.useMutation();
  const atualizarEnderecoMutation = trpc.loja.atualizarEndereco.useMutation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const handleLojaSubmit = async (data: LojaInput) => {
    await cadastrarLojaMutation.mutateAsync(data);
  };

  const handleEnderecoSubmit = async (data: EnderecoInput) => {
    if (endereco) {
      await atualizarEnderecoMutation.mutateAsync({ endereco: data });
    } else {
      await cadastrarEnderecoMutation.mutateAsync({ endereco: data });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel do Lojista
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie as informações da sua loja e endereço
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status do Cadastro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${
                      loja ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {loja ? "Loja Cadastrada" : "Loja Não Cadastrada"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loja
                        ? loja.nome
                        : "Complete o cadastro da sua loja"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${
                      endereco ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {endereco ? "Endereço Cadastrado" : "Endereço Não Cadastrado"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {endereco
                        ? `${endereco.rua}, ${endereco.numero}`
                        : "Adicione o endereço da sua loja"}
                    </p>
                  </div>
                </div>

                {loja && endereco && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Cadastro Completo
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Sua loja está pronta para receber pedidos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            {loja && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Informações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Categoria</p>
                    <p className="font-medium">{loja.categoria}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefone</p>
                    <p className="font-medium">{loja.telefone}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Forms */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="loja" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Informações da Loja
                </TabsTrigger>
                <TabsTrigger value="endereco" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço
                </TabsTrigger>
              </TabsList>

              {/* Loja Tab */}
              <TabsContent value="loja" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Loja</CardTitle>
                    <CardDescription>
                      Cadastre ou atualize as informações básicas da sua loja
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lojaLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                      </div>
                    ) : (
                      <LojaForm
                        initialData={
                          loja
                            ? {
                                nome: loja.nome,
                                categoria: loja.categoria,
                                telefone: loja.telefone,
                                horarioFuncionamento:
                                  loja.horarioFuncionamento || "",
                              }
                            : undefined
                        }
                        onSubmit={handleLojaSubmit}
                        isLoading={cadastrarLojaMutation.isPending}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Endereco Tab */}
              <TabsContent value="endereco" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Endereço da Loja</CardTitle>
                    <CardDescription>
                      Cadastre o endereço completo e localize sua loja no mapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!loja ? (
                      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          ℹ️ Primeiro, cadastre as informações da sua loja na aba
                          "Informações da Loja"
                        </p>
                      </div>
                    ) : enderecoLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                      </div>
                    ) : (
                      <EnderecoForm
                        initialData={
                          endereco
                            ? {
                                rua: endereco.rua,
                                numero: endereco.numero,
                                bairro: endereco.bairro,
                                cidade: endereco.cidade,
                                cep: endereco.cep,
                                latitude: endereco.latitude,
                                longitude: endereco.longitude,
                              }
                            : undefined
                        }
                        onSubmit={handleEnderecoSubmit}
                        isLoading={
                          cadastrarEnderecoMutation.isPending ||
                          atualizarEnderecoMutation.isPending
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
