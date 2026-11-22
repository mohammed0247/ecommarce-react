import { ProductCatalog } from "@/components/products/product-catalog";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string; sort?: string }>;
}) {
  const params = await searchParams;
  return (
    <ProductCatalog
      initialKeyword={params.keyword || ""}
      initialSort={params.sort || ""}
    />
  );
}
