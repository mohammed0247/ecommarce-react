import Link from "next/link";
import type { ReactNode } from "react";
import { ShoppingBasket } from "lucide-react";

export function EmptyState({
  title,
  description,
  href = "/products",
  action = "Explore products",
  icon,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon || <ShoppingBasket size={28} />}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button button-primary" href={href}>
        {action}
      </Link>
    </div>
  );
}
