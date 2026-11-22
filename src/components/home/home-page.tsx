"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { catalogApi, getErrorMessage } from "@/services/api";
import {
  ProductGrid,
  ProductSkeletonGrid,
} from "@/components/products/product-card";
import { SectionTitle } from "@/components/common/section-title";
import { Loading } from "@/components/common/loading";
import type { Brand, Category, Product } from "@/types";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      catalogApi.products({ limit: 8, sort: "-ratingsAverage" }),
      catalogApi.categories(),
      catalogApi.brands(),
    ])
      .then(([productResult, categoryResult, brandResult]) => {
        if (!active) return;
        setProducts(productResult.data);
        setCategories(categoryResult);
        setBrands(brandResult.slice(0, 8));
      })
      .catch((reason: unknown) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="shell hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span /> FRESH PICKS, JUST FOR YOU
          </span>
          <h1>
            Everyday good.
            <br />
            <em>Delivered fresh.</em>
          </h1>
          <p>
            Thoughtful finds for your home, closet and everything in between. A
            little more joy in every delivery.
          </p>
          <div className="hero-buttons">
            <Link className="button button-dark" href="/products">
              Shop the collection <ArrowRight size={17} />
            </Link>
            <Link className="hero-secondary" href="/categories">
              Explore categories
            </Link>
          </div>
          <div className="hero-proof">
            <span>
              <BadgeCheck size={16} /> Curated quality
            </span>
            <span>
              <Clock3 size={16} /> Quick delivery
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-blob" />
          <div className="hero-photo">
            <Image
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh produce arranged in a bright market"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
              unoptimized
            />
          </div>
          <div className="hero-note">
            <span className="note-icon">✳</span>
            <span>
              <strong>
                Good things
                <br />
                are in season.
              </strong>
              <small>Explore something new</small>
            </span>
          </div>
          <div className="hero-sticker">
            FRESH
            <br />
            EVERY DAY
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="shell benefit-grid">
          <div>
            <span className="benefit-icon green">
              <ShieldCheck size={20} />
            </span>
            <span>
              <strong>Quality you can trust</strong>
              <small>Handpicked, every time</small>
            </span>
          </div>
          <div>
            <span className="benefit-icon peach">
              <Clock3 size={20} />
            </span>
            <span>
              <strong>At your door, fast</strong>
              <small>Quick, reliable delivery</small>
            </span>
          </div>
          <div>
            <span className="benefit-icon yellow">
              <BadgeCheck size={20} />
            </span>
            <span>
              <strong>Easy returns</strong>
              <small>14-day return policy</small>
            </span>
          </div>
          <div>
            <span className="benefit-icon lilac">
              <Headphones size={20} />
            </span>
            <span>
              <strong>Here to help</strong>
              <small>Friendly 24/7 support</small>
            </span>
          </div>
        </div>
      </section>

      <section className="shell section-block">
        <SectionTitle
          eyebrow="A GOOD PLACE TO START"
          title="Shop by category"
          description="A little something for every part of your day."
          href="/categories"
        />
        {loading ? (
          <Loading label="Finding your favorites..." />
        ) : categories.length ? (
          <div className="category-grid">
            {categories.slice(0, 8).map((category, index) => (
              <Link
                className={`category-card category-tone-${index % 4}`}
                href={`/categories/${category.id || category._id}`}
                key={category.id || category._id}
              >
                <div className="category-image">
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                    />
                  )}
                </div>
                <span className="category-arrow">
                  <ArrowRight size={16} />
                </span>
                <strong>{category.name}</strong>
                <small>Explore collection</small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="inline-empty">
            {error || "Categories are currently unavailable."}
          </div>
        )}
      </section>

      <section className="shell promo-grid">
        <div className="promo-card promo-green">
          <span className="eyebrow">A LITTLE EXTRA GOOD</span>
          <h2>
            Small joys,
            <br />
            big savings.
          </h2>
          <p>Discover fresh finds at prices that feel just right.</p>
          <Link className="button button-dark" href="/products">
            Shop offers <ArrowRight size={16} />
          </Link>
          <span className="promo-decoration">20%</span>
        </div>
        <div className="promo-card promo-peach">
          <span className="eyebrow">THE GOOD STUFF</span>
          <h2>
            Made for
            <br />
            everyday living.
          </h2>
          <p>Meet the brands that make your routine brighter.</p>
          <Link className="button button-light" href="/brands">
            Meet our brands <ArrowRight size={16} />
          </Link>
          <span className="promo-spark">✳</span>
        </div>
      </section>

      <section className="shell section-block featured-section">
        <SectionTitle
          eyebrow="THE CROWD FAVORITES"
          title="A few good finds"
          description="Loved by the FreshCart community."
          href="/products"
        />
        {loading ? (
          <ProductSkeletonGrid />
        ) : products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="inline-empty">
            {error || "Products are currently unavailable."}
          </div>
        )}
      </section>

      <section className="brand-strip">
        <div className="shell">
          <SectionTitle
            eyebrow="GOOD COMPANY"
            title="Brands we love"
            href="/brands"
          />
          {brands.length > 0 && (
            <div className="brand-grid">
              {brands.map((brand) => (
                <Link
                  className="brand-tile"
                  href={`/brands/${brand.id || brand._id}`}
                  key={brand.id || brand._id}
                >
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      width={110}
                      height={56}
                      unoptimized
                    />
                  ) : (
                    <span>{brand.name}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
