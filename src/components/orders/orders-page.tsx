"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { commerceApi, getErrorMessage } from "@/services/api";
import { useShop } from "@/context/shop-context";
import { EmptyState } from "@/components/common/empty-state";
import { Loading } from "@/components/common/loading";
import type { Order } from "@/types";

function getUserId(token: string, userId?: string) {
  if (userId) return userId;
  try {
    const encoded = token.split(".")[1];
    if (!encoded) return "";
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    ) as { id?: string; _id?: string };
    return payload.id || payload._id || "";
  } catch {
    return "";
  }
}

export function OrdersPage() {
  const { token, user } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    const userId = getUserId(token, user?._id || user?.id);
    if (!userId) {
      queueMicrotask(() => {
        setError(
          "Your account ID could not be read. Please sign out and sign in again.",
        );
        setLoading(false);
      });
      return;
    }
    commerceApi
      .orders(userId)
      .then((data) => {
        console.log("ORDERS DATA:", data);
        setOrders(data);
      })
      .catch((reason: unknown) => setError(getErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [token, user]);

  if (!token)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="Your orders live here"
          description="Sign in to keep track of every FreshCart delivery."
          href="/login"
          action="Sign in"
          icon={<PackageCheck size={27} />}
        />
      </main>
    );
  return (
    <main className="shell page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR FRESHCART</span>
          <h1>Order history</h1>
          <p>A little look at all the good things you&apos;ve ordered.</p>
        </div>
      </div>
      {loading ? (
        <Loading label="Fetching your orders..." />
      ) : error ? (
        <div className="inline-error">{error}</div>
      ) : !orders.length ? (
        <EmptyState
          title="No orders just yet"
          description="Your next favorite thing is only a click away."
        />
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-head">
                <div>
                  <span className="product-category">
                    ORDER #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <strong>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "Recently placed"}
                  </strong>
                </div>
                <span
                  className={`order-status ${order.isDelivered ? "status-done" : ""}`}
                >
                  {order.isDelivered ? "Delivered" : "In progress"}
                </span>
              </div>
              <div className="order-items">
                {(order.cartItems || []).map((line, index) => (
                  <div
                    className="order-item"
                    key={`${line.product._id}-${index}`}
                  >
                    <div className="order-thumb">
                      <Image
                        src={line.product.imageCover}
                        alt={line.product.title}
                        fill
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                    <span>
                      {line.product.title}
                      <small>Qty {line.count}</small>
                    </span>
                    <strong>
                      {(line.price * line.count).toLocaleString()} EGP
                    </strong>
                  </div>
                ))}
              </div>
              <div className="order-card-foot">
                <span>
                  {order.paymentMethodType || "Payment method not listed"} ·{" "}
                  {order.isPaid ? "Paid" : "Payment pending"}
                </span>
                <strong>
                  {(order.totalOrderPrice || 0).toLocaleString()} EGP
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
