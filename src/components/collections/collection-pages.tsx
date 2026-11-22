"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { catalogApi, getErrorMessage } from "@/services/api";
import { ProductGrid } from "@/components/products/product-card";
import { Loading } from "@/components/common/loading";
import { SectionTitle } from "@/components/common/section-title";
import type { Brand, Category, Product } from "@/types";

export function CollectionList({ type }: { type: "brands" | "categories" }) {
  const [items, setItems] = useState<(Brand | Category)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const request =
      type === "brands" ? catalogApi.brands() : catalogApi.categories();
    request
      .then(setItems)
      .catch((reason: unknown) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [type]);
  const noun = type === "brands" ? "brand" : "category";
  return (
    <main className="shell page-shell">
      <SectionTitle
        eyebrow="DISCOVER FRESHCART"
        title={type === "brands" ? "Brands we love" : "Shop by category"}
        description={`Find your next favorite ${noun} from the FreshCart collection.`}
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="inline-error">{error}</div>
      ) : (
        <div className="collection-grid">
          {items.map((item, index) => (
            <Link
              key={item.id || item._id}
              href={`/${type}/${item.id || item._id}`}
              className={`collection-card category-tone-${index % 4}`}
            >
              <div className="collection-image">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                )}
              </div>
              <div>
                <h2>{item.name}</h2>
                <span>Explore {noun} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export function CollectionDetail({
  id,
  type,
}: {
  id: string;
  type: "brands" | "categories";
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const getEntity =
      type === "brands" ? catalogApi.brand(id) : catalogApi.category(id);
    const getProducts = catalogApi.products({
      limit: 24,
      [type === "brands" ? "brand" : "category[in]"]: id,
    });
    Promise.all([getEntity, getProducts])
      .then(([entity, result]) => {
        setName(entity.name);
        setImage(entity.image || "");
        setProducts(result.data);
      })
      .catch((reason: unknown) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [id, type]);
  if (loading)
    return (
      <main className="shell page-shell">
        <Loading />
      </main>
    );
  if (error)
    return (
      <main className="shell page-shell">
        <div className="inline-error">{error}</div>
      </main>
    );
  return (
    <main className="shell page-shell">
      {image && (
        <div className="collection-banner">
          <Image src={image} alt="" fill sizes="100vw" unoptimized />
          <span>
            {type === "brands" ? "THE BRAND EDIT" : "A FRESHCART COLLECTION"}
          </span>
        </div>
      )}
      <SectionTitle
        eyebrow={type === "brands" ? "THE BRAND EDIT" : "CURATED FOR YOU"}
        title={name}
        description={`Explore ${name} picks, selected for everyday.`}
      />
      <ProductGrid products={products} />
    </main>
  );
}
