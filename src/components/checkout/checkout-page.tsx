"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useShop } from "@/context/shop-context";
import { commerceApi, getErrorMessage } from "@/services/api";
import { EmptyState } from "@/components/common/empty-state";
import { Loading } from "@/components/common/loading";

const checkoutSchema = z.object({
  details: z.string().min(5, "Enter your street address."),
  phone: z.string().min(10, "Enter a valid phone number."),
  city: z.string().min(2, "Enter your city."),
  postalCode: z.string().min(3, "Enter a valid postal code."),
  paymentMethod: z.enum(["cash", "online"]),
});
type CheckoutValues = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { token, cart, notify, refreshCart } = useShop();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cash" },
  });
  if (!token)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="Sign in to check out"
          description="Your cart and checkout are connected to your account."
          href="/login"
          action="Sign in"
        />
      </main>
    );
  if (!cart)
    return (
      <main className="shell page-shell">
        <Loading label="Preparing your checkout..." />
      </main>
    );
  if (!cart.products.length || !cart._id)
    return (
      <main className="shell page-shell">
        <EmptyState
          title="Nothing to check out yet"
          description="Add a few things to your cart first."
        />
      </main>
    );
  const total =
    cart.totalCartPrice ??
    cart.products.reduce(
      (sum, line) => sum + line.count * line.product.price,
      0,
    );
  const submit = handleSubmit(async ({ paymentMethod, ...shippingAddress }) => {
    try {
      if (paymentMethod === "cash") {
        await commerceApi.cashOrder(cart._id!, shippingAddress);
        await refreshCart();
        notify("Your cash-on-delivery order has been placed.");
        router.push("/orders");
      } else {
        const result = await commerceApi.onlineCheckout(
          cart._id!,
          `${window.location.origin}/payment`,
          {
            details: shippingAddress.details,
            phone: shippingAddress.phone,
            city: shippingAddress.city,
          },
        );
        const checkoutUrl = result.session?.url || result.url;
        if (!checkoutUrl)
          throw new Error("The payment service did not return a checkout URL.");
        window.location.assign(checkoutUrl);
      }
    } catch (error) {
      notify(getErrorMessage(error), "error");
    }
  });
  return (
    <main className="shell page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ALMOST YOURS</span>
          <h1>Checkout</h1>
          <p>Where should we bring your good things?</p>
        </div>
        <Link href="/cart" className="text-link">
          ← Back to cart
        </Link>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <section className="checkout-section">
            <h2>
              <span>01</span> Delivery details
            </h2>
            <div className="checkout-fields">
              <label className="form-field field-wide">
                <span>Street address</span>
                <input
                  placeholder="Building, street, apartment..."
                  {...register("details")}
                />
                {errors.details && (
                  <small className="field-error">
                    {errors.details.message}
                  </small>
                )}
              </label>
              <label className="form-field">
                <span>Phone number</span>
                <input
                  type="tel"
                  placeholder="+20 100 000 0000"
                  {...register("phone")}
                />
                {errors.phone && (
                  <small className="field-error">{errors.phone.message}</small>
                )}
              </label>
              <label className="form-field">
                <span>City</span>
                <input placeholder="Cairo" {...register("city")} />
                {errors.city && (
                  <small className="field-error">{errors.city.message}</small>
                )}
              </label>
              <label className="form-field">
                <span>Postal code</span>
                <input placeholder="Postal code" {...register("postalCode")} />
                {errors.postalCode && (
                  <small className="field-error">
                    {errors.postalCode.message}
                  </small>
                )}
              </label>
            </div>
          </section>
          <section className="checkout-section">
            <h2>
              <span>02</span> Payment method
            </h2>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  value="cash"
                  {...register("paymentMethod")}
                />
                <span>
                  <strong>Cash on delivery</strong>
                  <small>Pay when your order arrives</small>
                </span>
                <i>COD</i>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="online"
                  {...register("paymentMethod")}
                />
                <span>
                  <strong>Pay online</strong>
                  <small>Continue to the secure payment page</small>
                </span>
                <i>••••</i>
              </label>
            </div>
          </section>
          <button
            className="button button-primary button-wide"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing your order..." : "Place order"}{" "}
            <span>→</span>
          </button>
        </form>
        <aside className="order-summary">
          <h2>Your order</h2>
          {cart.products.map((line) => (
            <div
              className="checkout-item"
              key={line.product.id || line.product._id}
            >
              <span>
                {line.count} × {line.product.title}
              </span>
              <strong>
                {(line.product.price * line.count).toLocaleString()} EGP
              </strong>
            </div>
          ))}
          <div className="summary-row">
            <span>Delivery</span>
            <strong>At checkout</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{total.toLocaleString()} EGP</strong>
          </div>
          <p className="summary-note">
            Your order is securely processed through FreshCart’s official
            checkout service.
          </p>
        </aside>
      </div>
    </main>
  );
}
