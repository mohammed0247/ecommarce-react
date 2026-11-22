"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useShop, cartLineId } from "@/context/shop-context";
import { getErrorMessage } from "@/services/api";
import { EmptyState } from "@/components/common/empty-state";
import { Loading } from "@/components/common/loading";

export function CartPage() {
  const { cart, token, updateCart, removeFromCart, notify } = useShop();
  const [busyId, setBusyId] = useState("");
  if (!token)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="Your cart is waiting"
          description="Sign in to see your cart and get back to shopping."
          href="/login"
          action="Sign in"
          icon={<ShoppingBag size={27} />}
        />
      </main>
    );
  if (!cart)
    return (
      <main className="shell page-shell">
        <Loading label="Loading your cart..." />
      </main>
    );
  console.log("CART DATA:", cart.products);
  if (!cart.products.length)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="Your cart is taking a breather"
          description="Looks like you haven't added anything yet. Let's find something good."
        />
      </main>
    );
  const subtotal =
    cart.totalCartPrice ??
    cart.products.reduce(
      (sum, item) => sum + item.product.price * item.count,
      0,
    );

  async function change(productId: string, count: number) {
    setBusyId(productId);
    try {
      if (count < 1) await removeFromCart(productId);
      else await updateCart(productId, count);
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="shell page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR FRESHCART</span>
          <h1>Your cart</h1>
          <p>
            {cart.products.reduce((sum, item) => sum + item.count, 0)} lovely
            things, ready when you are.
          </p>
        </div>
        <Link href="/products" className="text-link">
          Keep shopping →
        </Link>
      </div>
      <div className="cart-layout">
        <div className="cart-list">
          {cart.products.map((line) => {
            const id = cartLineId(line);
            return (
              <article className="cart-line" key={id}>
                <Link href={`/products/${id}`} className="cart-product-image">
                  <Image
                    src={line.product.imageCover}
                    alt={line.product.title}
                    fill
                    sizes="100px"
                    unoptimized
                  />
                </Link>
                <div className="cart-product-copy">
                  <span className="product-category">
                    {line.product.category?.name || "FRESHCART"}
                  </span>
                  <Link href={`/products/${id}`} className="cart-product-title">
                    {line.product.title}
                  </Link>
                  <span className="cart-unit-price">
                    {line.price.toLocaleString()} EGP / each
                  </span>
                </div>
                <div className="cart-line-actions">
                  <div className="quantity-picker">
                    <button
                      disabled={busyId === id}
                      onClick={() => void change(id, line.count - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <strong>{line.count}</strong>
                    <button
                      disabled={busyId === id}
                      onClick={() => void change(id, line.count + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <strong className="cart-line-price">
                    {(line.price * line.count).toLocaleString()} EGP
                  </strong>
                  <button
                    className="remove-button"
                    onClick={() => void change(id, 0)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{subtotal.toLocaleString()} EGP</strong>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <strong className="free-delivery">Calculated at checkout</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{subtotal.toLocaleString()} EGP</strong>
          </div>
          <Link className="button button-primary button-wide" href="/checkout">
            Continue to checkout <span>→</span>
          </Link>
          <p className="summary-note">
            Taxes and delivery are confirmed at checkout.
          </p>
        </aside>
      </div>
    </main>
  );
}
