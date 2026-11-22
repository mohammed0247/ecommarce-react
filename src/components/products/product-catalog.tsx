"use client";

import { useEffect, useState } from "react";
import { catalogApi, getErrorMessage } from "@/services/api";
import {
  ProductGrid,
  ProductSkeletonGrid,
} from "@/components/products/product-card";
import { SectionTitle } from "@/components/common/section-title";
import type { Product } from "@/types";

export function ProductCatalog({
  initialKeyword = "",
  initialSort = "",
}: {
  initialKeyword?: string;
  initialSort?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params: Record<string, string | number> = { limit: 12, page };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (sort) params.sort = sort;
    catalogApi
      .products(params)
      .then((result) => {
        if (!active) return;
        setProducts(result.data);
        setPages(result.metadata?.numberOfPages || 1);
        setError("");
      })
      .catch((reason: unknown) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [keyword, sort, page]);

  return (
    <main className="shell page-shell">
      <SectionTitle
        eyebrow="FIND YOUR NEW FAVORITE"
        title="All products"
        description="Explore thoughtful picks for your everyday."
      />
      <div className="catalog-controls">
        <label className="catalog-search">
          Search products
          <input
            value={keyword}
            onChange={(event) => {
              setLoading(true);
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Try a product name..."
          />
        </label>
        <label className="sort-control">
          Sort by
          <select
            value={sort}
            onChange={(event) => {
              setLoading(true);
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Featured</option>
            <option value="-ratingsAverage">Top rated</option>
            <option value="price">Price: low to high</option>
            <option value="-price">Price: high to low</option>
            <option value="-createdAt">Newest</option>
          </select>
        </label>
      </div>
      {loading ? (
        <ProductSkeletonGrid />
      ) : error ? (
        <div className="inline-error">{error}</div>
      ) : (
        <ProductGrid products={products} />
      )}
      {!loading && !error && pages > 1 && (
        <div className="pagination">
          <button
            disabled={page <= 1}
            onClick={() => {
              setLoading(true);
              setPage(page - 1);
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => {
              setLoading(true);
              setPage(page + 1);
            }}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
