"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useShop } from "@/context/shop-context";
import { getErrorMessage } from "@/services/api";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist, notify, token } = useShop();
  const id = product.id || product._id;
  const saved = wishlist.some((item) => (item.id || item._id) === id);
  const discount =
    product.priceAfterDiscount && product.priceAfterDiscount < product.price
      ? Math.round((1 - product.priceAfterDiscount / product.price) * 100)
      : 0;

  async function add() {
    try {
      await addToCart(id);
    } catch (error) {
      notify(
        token ? getErrorMessage(error) : "Sign in to add items to your cart.",
        "error",
      );
    }
  }

  async function wishlistAction() {
    try {
      await toggleWishlist(product);
    } catch (error) {
      notify(
        token
          ? getErrorMessage(error)
          : "Sign in to save items to your wishlist.",
        "error",
      );
    }
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${id}`} aria-label={`View ${product.title}`}>
          <Image
            src={product.imageCover}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
            className="product-image"
          />
        </Link>
        {discount > 0 && <span className="discount-tag">-{discount}%</span>}
        <button
          onClick={wishlistAction}
          className={`favorite-button ${saved ? "favorite-active" : ""}`}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        <button onClick={add} className="quick-add" aria-label="Add to cart">
          <ShoppingBag size={17} />
        </button>
      </div>
      <div className="product-info">
        <p className="product-category">
          {product.category?.name || "FreshCart selection"}
        </p>
        <Link href={`/products/${id}`} className="product-name">
          {product.title}
        </Link>
        <div className="product-meta">
          <span className="rating">
            <Star size={13} fill="currentColor" />{" "}
            {product.ratingsAverage?.toFixed(1) || "New"}{" "}
            <small>({product.ratingsQuantity || 0})</small>
          </span>
          <strong>
            {(product.priceAfterDiscount || product.price).toLocaleString()}{" "}
            <small>EGP</small>
          </strong>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length)
    return (
      <div className="inline-empty">
        No products found. Try a different search.
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id || product._id} product={product} />
      ))}
    </div>
  );
}

export function ProductSkeletonGrid() {
  return (
    <div className="product-grid" aria-label="Loading products">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="product-skeleton" key={index}>
          <span />
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
      ))}
    </div>
  );
}
