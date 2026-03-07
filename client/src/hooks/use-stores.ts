import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertStore } from "@shared/schema";

export function useStores() {
  return useQuery({
    queryKey: [api.stores.list.path],
    queryFn: async () => {
      const res = await fetch(api.stores.list.path);
      if (!res.ok) throw new Error("Failed to fetch stores");
      return api.stores.list.responses[200].parse(await res.json());
    },
  });
}

export function useStore(id: number) {
  return useQuery({
    queryKey: [api.stores.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.stores.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch store");
      return api.stores.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStore) => {
      const res = await fetch(api.stores.create.path, {
        method: api.stores.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create store");
      return api.stores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.stores.list.path] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertStore>) => {
      const url = buildUrl(api.stores.update.path, { id });
      const res = await fetch(url, {
        method: api.stores.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update store");
      return api.stores.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.stores.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stores.get.path, variables.id] });
    },
  });
}
