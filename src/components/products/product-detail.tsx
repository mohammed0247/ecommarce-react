"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { catalogApi, getErrorMessage } from "@/services/api";
import { useShop } from "@/context/shop-context";
import { Loading } from "@/components/common/loading";
import type { Product } from "@/types";

export function ProductDetail({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, updateCart, toggleWishlist, wishlist, notify, token } =
    useShop();
  useEffect(() => {
    catalogApi
      .product(id)
      .then(setProduct)
      .catch((reason: unknown) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <main className="shell page-shell">
        <Loading label="Loading product details..." />
      </main>
    );
  if (error || !product)
    return (
      <main className="shell page-shell">
        <div className="inline-error">
          {error || "This product could not be found."}
        </div>
        <Link href="/products" className="text-link">
          Back to products
        </Link>
      </main>
    );
  const productId = product.id || product._id;
  const inWishlist = wishlist.some(
    (item) => (item.id || item._id) === productId,
  );

  async function addItem() {
    try {
      await addToCart(productId);
      if (quantity > 1) await updateCart(productId, quantity);
    } catch (reason) {
      notify(
        token ? getErrorMessage(reason) : "Sign in to add items to your cart.",
        "error",
      );
    }
  }

  return (
    <main className="shell page-shell">
      <Link href="/products" className="back-link">
        <ArrowLeft size={16} /> All products
      </Link>
      <div className="detail-layout">
        <div className="detail-image">
          {product.imageCover && (
            <Image
              src={product.imageCover}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 52vw"
              unoptimized
            />
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {product.category?.name || "FRESHCART SELECTION"}
          </span>
          <h1>{product.title}</h1>
          <div className="detail-rating">
            <span className="rating">
              <Star size={15} fill="currentColor" />{" "}
              {product.ratingsAverage?.toFixed(1) || "New"}
            </span>
            <span>{product.ratingsQuantity || 0} reviews</span>
            <span className="stock-tag">In stock</span>
          </div>
          <div className="detail-price">
            {(product.priceAfterDiscount || product.price).toLocaleString()}{" "}
            <small>EGP</small>
            {product.priceAfterDiscount &&
              product.priceAfterDiscount < product.price && (
                <del>{product.price.toLocaleString()} EGP</del>
              )}
          </div>
          <p className="detail-description">
            {product.description ||
              "A thoughtful pick, selected for quality and everyday enjoyment."}
          </p>
          <div className="detail-rule" />
          <div className="detail-quantity">
            <span>Quantity</span>
            <div className="quantity-picker">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <strong>{quantity}</strong>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.quantity || 99, quantity + 1))
                }
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <small>{product.quantity || 0} available</small>
          </div>
          <div className="detail-actions">
            <button className="button button-primary" onClick={addItem}>
              <ShoppingBag size={18} /> Add to cart
            </button>
            <button
              className={`button button-outline ${inWishlist ? "favorite-active" : ""}`}
              onClick={async () => {
                try {
                  await toggleWishlist(product);
                } catch (reason) {
                  notify(
                    token ? getErrorMessage(reason) : "Sign in to save items.",
                    "error",
                  );
                }
              }}
            >
              <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />{" "}
              Save
            </button>
          </div>
          <div className="detail-perks">
            <span>✓ Secure checkout</span>
            <span>✓ Cash on delivery</span>
            <span>✓ Easy returns</span>
          </div>
        </div>
      </div>
    </main>
  );
}
