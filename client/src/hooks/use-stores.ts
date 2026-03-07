import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertMerchant } from "@shared/schema";

export function useStores() {
  return useQuery({
    queryKey: [api.merchants.list.path],
    queryFn: async () => {
      const res = await fetch(api.merchants.list.path);
      if (!res.ok) throw new Error("Failed to fetch merchants");
      return api.merchants.list.responses[200].parse(await res.json());
    },
  });
}

export function useStore(id: number) {
  return useQuery({
    queryKey: [api.merchants.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.merchants.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch merchant");
      return api.merchants.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMerchant) => {
      const res = await fetch(api.merchants.create.path, {
        method: api.merchants.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create merchant");
      return api.merchants.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.merchants.list.path] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertMerchant>) => {
      const url = buildUrl(api.merchants.update.path, { id });
      const res = await fetch(url, {
        method: api.merchants.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update merchant");
      return api.merchants.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.merchants.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.merchants.get.path, variables.id] });
    },
  });
}
