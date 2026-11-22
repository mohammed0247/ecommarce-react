"use client";

import { useShop } from "@/context/shop-context";
import { EmptyState } from "@/components/common/empty-state";
import { ProductGrid } from "@/components/products/product-card";
import { SectionTitle } from "@/components/common/section-title";
import { Heart } from "lucide-react";

export function WishlistPage() {
  const { wishlist, token } = useShop();
  if (!token)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="Keep your favorites close"
          description="Sign in to see the products you've saved for later."
          href="/login"
          action="Sign in"
          icon={<Heart size={27} />}
        />
      </main>
    );
  if (!wishlist.length)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="A little room for favorites"
          description="Tap the heart on anything you love and it will be waiting here."
          icon={<Heart size={27} />}
        />
      </main>
    );
  return (
    <main className="shell page-shell">
      <SectionTitle
        eyebrow="SAVED FOR A GOOD DAY"
        title="Your wishlist"
        description={`${wishlist.length} things you love, all in one place.`}
      />
      <ProductGrid products={wishlist} />
    </main>
  );
}
