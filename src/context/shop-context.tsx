"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { authApi, commerceApi } from "@/services/api";
import { getErrorMessage } from "@/services/api";
import type { CartData, CartLine, Product, User } from "@/types";

interface ShopContextValue {
  token: string | null;
  user: User | null;
  cart: CartData | null;
  wishlist: Product[];
  notice: { message: string; kind: "success" | "error" } | null;
  signIn: (values: { email: string; password: string }) => Promise<void>;
  signUp: (values: {
    name: string;
    email: string;
    password: string;
    rePassword: string;
    phone: string;
  }) => Promise<void>;
  replaceToken: (token: string) => void;
  signOut: () => void;
  refreshCart: () => Promise<CartData | null>;
  addToCart: (productId: string) => Promise<void>;
  updateCart: (productId: string, count: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  notify: (message: string, kind?: "success" | "error") => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

function getId(product: Product) {
  return product.id || product._id;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartData | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [notice, setNotice] = useState<ShopContextValue["notice"]>(null);

  const notify = useCallback(
    (message: string, kind: "success" | "error" = "success") => {
      setNotice({ message, kind });
      window.setTimeout(() => setNotice(null), 4200);
    },
    [],
  );

  const refreshCart = useCallback(async () => {
    if (!token) return null;
    const result = await commerceApi.cart();
    const nextCart = { ...result, products: result.products || [] };
    setCart(nextCart);
    return nextCart;
  }, [token]);

  const refreshWishlist = useCallback(async () => {
    if (!token) return;
    setWishlist(await commerceApi.wishlist());
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => {
      const savedToken = window.localStorage.getItem("freshcart-token");
      const savedUser = window.localStorage.getItem("freshcart-user");
      if (savedToken) setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser) as User);
        } catch {
          window.localStorage.removeItem("freshcart-user");
        }
      }
    });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setCart(null);
      setWishlist([]);
      notify("Your session expired. Please sign in again.", "error");
    };
    window.addEventListener("freshcart:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("freshcart:unauthorized", handleUnauthorized);
  }, [notify]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => {
      void Promise.allSettled([refreshCart(), refreshWishlist()]).then(
        (results) => {
          results.forEach((result) => {
            if (result.status === "rejected")
              notify(getErrorMessage(result.reason), "error");
          });
        },
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [token, refreshCart, refreshWishlist, notify]);

  const saveAuth = useCallback((result: { token: string; user?: User }) => {
    window.localStorage.setItem("freshcart-token", result.token);
    if (result.user) {
      window.localStorage.setItem(
        "freshcart-user",
        JSON.stringify(result.user),
      );
      setUser(result.user);
    }
    setToken(result.token);
  }, []);

  const signIn = useCallback(
    async (values: { email: string; password: string }) => {
      saveAuth(await authApi.login(values));
    },
    [saveAuth],
  );

  const signUp = useCallback(
    async (values: {
      name: string;
      email: string;
      password: string;
      rePassword: string;
      phone: string;
    }) => {
      saveAuth(await authApi.register(values));
    },
    [saveAuth],
  );

  const signOut = useCallback(() => {
    window.localStorage.removeItem("freshcart-token");
    window.localStorage.removeItem("freshcart-user");
    setToken(null);
    setUser(null);
    setCart(null);
    setWishlist([]);
  }, []);

  const replaceToken = useCallback((nextToken: string) => {
    window.localStorage.setItem("freshcart-token", nextToken);
    setToken(nextToken);
  }, []);

  const requireAuth = useCallback(() => {
    if (!token)
      throw new Error("Please sign in to use your cart and wishlist.");
  }, [token]);

  const addToCart = useCallback(
    async (productId: string) => {
      requireAuth();
      await commerceApi.addToCart(productId);
      await refreshCart();
      notify("Added to your cart.");
    },
    [notify, refreshCart, requireAuth],
  );

  const updateCart = useCallback(
    async (productId: string, count: number) => {
      requireAuth();
      await commerceApi.updateCart(productId, count);
      await refreshCart();
    },
    [refreshCart, requireAuth],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      requireAuth();
      await commerceApi.removeFromCart(productId);
      await refreshCart();
      notify("Item removed from your cart.");
    },
    [notify, refreshCart, requireAuth],
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      requireAuth();
      const id = getId(product);
      if (wishlist.some((item) => getId(item) === id)) {
        await commerceApi.removeFromWishlist(id);
        notify("Removed from your wishlist.");
      } else {
        await commerceApi.addToWishlist(id);
        notify("Added to your wishlist.");
      }
      await refreshWishlist();
    },
    [notify, refreshWishlist, requireAuth, wishlist],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      cart,
      wishlist,
      notice,
      signIn,
      signUp,
      signOut,
      replaceToken,
      refreshCart,
      addToCart,
      updateCart,
      removeFromCart,
      refreshWishlist,
      toggleWishlist,
      notify,
    }),
    [
      token,
      user,
      cart,
      wishlist,
      notice,
      signIn,
      signUp,
      signOut,
      replaceToken,
      refreshCart,
      addToCart,
      updateCart,
      removeFromCart,
      refreshWishlist,
      toggleWishlist,
      notify,
    ],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      {notice && (
        <div
          role="status"
          className={`toast ${notice.kind === "error" ? "toast-error" : ""}`}
        >
          {notice.message}
        </div>
      )}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
}

export function cartLineId(line: CartLine) {
  return getId(line.product);
}
