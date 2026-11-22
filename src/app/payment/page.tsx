import { Suspense } from "react";
import { Loading } from "@/components/common/loading";
import { PaymentReturn } from "@/components/checkout/payment-return";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="shell page-shell">
          <Loading />
        </main>
      }
    >
      <PaymentReturn />
    </Suspense>
  );
}
