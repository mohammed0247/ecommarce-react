"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useShop } from "@/context/shop-context";

export function Header() {
  const { cart, wishlist, user, signOut } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const cartCount =
    cart?.products.reduce((sum, line) => sum + line.count, 0) || 0;

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/products?keyword=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="topline">
        <div className="shell topline-inner">
          <span>
            Free shipping on orders over <strong>500 EGP</strong>
          </span>
          <span className="topline-right">
            <a href="tel:+201001234567">+20 (100) 123-4567</a>
            <span>New arrivals daily</span>
          </span>
        </div>
      </div>
      <div className="shell main-nav">
        <button
          className="icon-button mobile-menu"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link href="/" className="brand-logo" aria-label="FreshCart home">
          <span className="logo-mark">
            <ShoppingBag size={21} strokeWidth={2.6} />
          </span>
          <span>
            fresh<span>cart</span>
            <small>GOOD FOOD. GOOD MOOD.</small>
          </span>
        </Link>
        <form className="search-bar" onSubmit={search}>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for products..."
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>
        <div className="nav-actions">
          <Link
            className="nav-action"
            href="/wishlist"
            aria-label={`Wishlist, ${wishlist.length} items`}
          >
            <span className="nav-icon-wrap">
              <Heart size={20} />
              <i>{wishlist.length}</i>
            </span>
            <span className="action-label">Wishlist</span>
          </Link>
          <Link
            className="nav-action"
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
          >
            <span className="nav-icon-wrap">
              <ShoppingBag size={20} />
              <i>{cartCount}</i>
            </span>
            <span className="action-label">Cart</span>
          </Link>
          {user ? (
            <div className="account-menu">
              <Link className="nav-action" href="/orders">
                <UserRound size={20} />
                <span className="action-label">{user.name.split(" ")[0]}</span>
              </Link>
              <button onClick={signOut} className="signout-button">
                Sign out
              </button>
            </div>
          ) : (
            <Link className="sign-in-link" href="/login">
              Sign in <span>→</span>
            </Link>
          )}
        </div>
      </div>
      <nav className={`category-nav ${menuOpen ? "category-nav-open" : ""}`}>
        <div className="shell category-nav-inner">
          <Link href="/products" onClick={() => setMenuOpen(false)}>
            Shop all
          </Link>
          <Link href="/categories" onClick={() => setMenuOpen(false)}>
            Categories
          </Link>
          <Link href="/brands" onClick={() => setMenuOpen(false)}>
            Brands
          </Link>
          <Link
            href="/products?sort=-ratingsAverage"
            onClick={() => setMenuOpen(false)}
          >
            Best sellers
          </Link>
          <Link href="/products?sort=-price" onClick={() => setMenuOpen(false)}>
            Special offers
          </Link>
          <Link className="nav-help" href="/orders">
            My orders <span>↗</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
