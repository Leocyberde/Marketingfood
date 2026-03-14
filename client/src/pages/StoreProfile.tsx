import { useRef, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Store, Camera, MapPin, Phone, Mail, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function StoreProfile() {
  const { data: store, isLoading, refetch } = trpc.stores.getFirst.useQuery();
  const logoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: "",
    phone: "",
    email: "",
    zipCode: "",
    address: "",
    number: "",
    city: "",
    state: "",
  });
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name || "",
        description: store.description || "",
        logo: (store as any).logo || "",
        phone: store.phone || "",
        email: store.email || "",
        zipCode: (store as any).zipCode || "",
        address: store.address || "",
        number: (store as any).number || "",
        city: (store as any).city || "",
        state: (store as any).state || "",
      });
    }
  }, [store]);

  const updateMutation = trpc.stores.update.useMutation({
    onSuccess: () => { toast.success("Perfil da loja atualizado!"); refetch(); },
    onError: (e) => toast.error("Erro ao salvar: " + e.message),
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, logo: ev.target?.result as string }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCepBlur = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error("CEP não encontrado"); return; }
      setForm((f) => ({
        ...f,
        address: data.logradouro || f.address,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }));
      toast.success("Endereço preenchido automaticamente!");
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 8);
    const formatted = nums.length > 5 ? `${nums.slice(0, 5)}-${nums.slice(5)}` : nums;
    setForm((f) => ({ ...f, zipCode: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;
    const fullAddress = [form.address, form.number, form.city, form.state].filter(Boolean).join(", ");
    updateMutation.mutate({
      id: store.id,
      name: form.name,
      description: form.description,
      logo: form.logo || undefined,
      phone: form.phone,
      email: form.email,
      address: fullAddress || store.address,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      number: form.number,
    } as any);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="text-xl font-bold text-cyan-500">Carregando...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-orange-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1"><Home className="w-4 h-4" /></Button></Link>
          <Link href="/store/products"><Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1 text-xs">← Produtos</Button></Link>
          <h1 className="text-3xl font-black text-white">Perfil da Loja</h1>
        </div>
        <p className="text-orange-400 mb-8 ml-20">Configure os dados da sua loja</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo */}
          <Card className="card-cinematic">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Camera className="w-5 h-5 text-orange-400" /> Logo da Loja</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-12 h-12 text-slate-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    className="absolute -bottom-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
                <div>
                  <p className="text-white font-semibold">{form.name || "Nome da Loja"}</p>
                  <p className="text-slate-400 text-sm mt-1">Clique no ícone da câmera para trocar a logo</p>
                  <p className="text-slate-500 text-xs mt-1">Recomendado: imagem quadrada, mínimo 200x200px</p>
                  {form.logo && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, logo: "" }))} className="text-red-400 hover:text-red-300 text-xs mt-2">
                      Remover logo
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações básicas */}
          <Card className="card-cinematic">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Store className="w-5 h-5 text-cyan-400" /> Informações da Loja</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-1 block">Nome da Loja *</label>
                <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome da sua loja" required />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-1 block">Descrição</label>
                <textarea className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:border-orange-400 outline-none resize-none" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descreva sua loja..." />
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="card-cinematic">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Phone className="w-5 h-5 text-green-400" /> Contato</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</label>
                  <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> E-mail</label>
                  <Input type="email" className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="loja@email.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="card-cinematic">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><MapPin className="w-5 h-5 text-red-400" /> Endereço Principal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* CEP */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-1 block">CEP</label>
                <div className="relative">
                  <Input
                    className="bg-slate-800 border-slate-700 text-white focus:border-orange-400 pr-10"
                    value={form.zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />}
                </div>
                <p className="text-slate-500 text-xs mt-1">Digite o CEP para preencher o endereço automaticamente</p>
              </div>

              {/* Logradouro + Número */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Rua / Logradouro</label>
                  <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Nome da rua" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Número</label>
                  <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} placeholder="Ex: 123" />
                </div>
              </div>

              {/* Cidade + Estado */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Cidade</label>
                  <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Cidade" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-1 block">Estado (UF)</label>
                  <Input className="bg-slate-800 border-slate-700 text-white focus:border-orange-400" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="SP" maxLength={2} />
                </div>
              </div>

              {/* Preview do endereço completo */}
              {(form.address || form.city) && (
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Endereço completo:</p>
                  <p className="text-white text-sm font-semibold">
                    {[form.address, form.number, form.city, form.state, form.zipCode].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full h-12 btn-primary text-base font-bold flex items-center gap-2" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Perfil da Loja
          </Button>
        </form>
      </div>
    </div>
  );
}
