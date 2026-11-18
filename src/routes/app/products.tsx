import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney, label, PRODUCT_AVAILABILITIES, type ProductAvailability } from "@/lib/domain";
import { pageHead } from "@/lib/seo";
import { productsService, type Product } from "@/services/db";

export const Route = createFileRoute("/app/products")({
  head: pageHead(
    "Products | WhatsApp AI Assistant",
    "Add products with prices, photos and availability so your assistant can answer buying questions accurately.",
  ),
  component: ProductsPage,
});

interface Draft {
  name: string;
  description: string;
  price: string;
  currency: string;
  availability: ProductAvailability;
  category: string;
  product_url: string;
  image_url: string;
}

const emptyDraft: Draft = {
  name: "",
  description: "",
  price: "",
  currency: "TZS",
  availability: "IN_STOCK",
  category: "",
  product_url: "",
  image_url: "",
};

function ProductsPage() {
  const { business } = useAuth();
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", businessId, search],
    queryFn: () => productsService.list(businessId!, search || undefined),
    enabled: Boolean(businessId),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["products", businessId] });

  const save = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business");
      const payload = {
        business_id: businessId,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        price: Number(draft.price || 0),
        currency: draft.currency || "TZS",
        availability: draft.availability,
        category: draft.category.trim() || null,
        product_url: draft.product_url.trim() || null,
        image_url: draft.image_url || null,
      };
      if (!payload.name) throw new Error("Product name is required");
      return editing
        ? productsService.update(editing.id, payload)
        : productsService.create(payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Product updated" : "Product added");
      setOpen(false);
      setEditing(null);
      setDraft(emptyDraft);
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: async () => {
      toast.success("Product deleted");
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setDraft({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price ?? ""),
      currency: product.currency,
      availability: product.availability,
      category: product.category ?? "",
      product_url: product.product_url ?? "",
      image_url: product.image_url ?? "",
    });
    setOpen(true);
  };

  const onUpload = async (file: File) => {
    if (!businessId) return;
    setUploading(true);
    try {
      const url = await productsService.uploadImage(businessId, file);
      setDraft((d) => ({ ...d, image_url: url }));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        description="What your assistant can sell and describe."
        actions={<Button onClick={openNew}>Add product</Button>}
      />

      <Input
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 max-w-sm"
      />

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={(error as Error).message} onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product so the assistant can share prices and photos."
          action={<Button onClick={openNew}>Add product</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <CardContent className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <Badge variant={product.availability === "IN_STOCK" ? "default" : "secondary"}>
                    {label(product.availability)}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatMoney(product.price, product.currency)}
                </p>
                {product.description ? (
                  <p className="line-clamp-3 text-sm text-muted-foreground">{product.description}</p>
                ) : null}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(product)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove.mutate(product.id)}
                    disabled={remove.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="p-price">Price</Label>
                <Input
                  id="p-price"
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="p-currency">Currency</Label>
                <Input
                  id="p-currency"
                  value={draft.currency}
                  onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Availability</Label>
              <Select
                value={draft.availability}
                onValueChange={(v) => setDraft({ ...draft, availability: v as ProductAvailability })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_AVAILABILITIES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {label(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="p-category">Category</Label>
              <Input
                id="p-category"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="p-url">Product link</Label>
              <Input
                id="p-url"
                value={draft.product_url}
                onChange={(e) => setDraft({ ...draft, product_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="p-image">Photo</Label>
              <Input
                id="p-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                }}
              />
              {uploading ? <p className="mt-1 text-xs text-muted-foreground">Uploading…</p> : null}
              {draft.image_url ? (
                <img
                  src={draft.image_url}
                  alt="Product preview"
                  className="mt-2 h-32 w-full rounded-lg object-cover"
                />
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
