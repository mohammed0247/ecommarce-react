import { CollectionDetail } from "@/components/collections/collection-pages";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CollectionDetail id={id} type="brands" />;
}
