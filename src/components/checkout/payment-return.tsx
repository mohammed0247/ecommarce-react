"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard } from "lucide-react";

export function PaymentReturn() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  return (
    <main className="shell payment-return">
      <span className="payment-return-icon">
        {sessionId ? <CheckCircle2 size={30} /> : <CreditCard size={30} />}
      </span>
      <span className="eyebrow">SECURE CHECKOUT</span>
      <h1>{sessionId ? "You’re back from checkout" : "Payment checkout"}</h1>
      <p>
        {sessionId
          ? "Your payment provider returned a checkout session. Check your order history for the confirmed order status."
          : "Online payment is processed by the payment provider. If you have just completed checkout, check your orders for the latest status."}
      </p>
      <div className="payment-return-actions">
        <Link href="/orders" className="button button-primary">
          View my orders
        </Link>
        <Link href="/products" className="button button-outline">
          Continue shopping
        </Link>
      </div>
      <small>
        FreshCart does not mark a payment as successful until the order service
        confirms it.
      </small>
    </main>
  );
}
