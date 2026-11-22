import axios from "axios";
import type {
  ApiList,
  ApiObject,
  Brand,
  CartData,
  Category,
  Order,
  Product,
  User,
} from "@/types";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.routemisr.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

const apiV2 = axios.create({
  baseURL: (
    process.env.NEXT_PUBLIC_API_URL || "https://ecommerce.routemisr.com/api/v1"
  ).replace(/\/v1\/?$/, "/v2"),
  headers: { "Content-Type": "application/json" },
});

for (const client of [api, apiV2]) {
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("freshcart-token");
      if (token) config.headers.set("token", token);
    }
    return config;
  });
  client.interceptors.response.use(undefined, (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("freshcart-token")
    ) {
      window.localStorage.removeItem("freshcart-token");
      window.localStorage.removeItem("freshcart-user");
      window.dispatchEvent(new Event("freshcart:unauthorized"));
    }
    return Promise.reject(error);
  });
}

export function getErrorMessage(error: unknown): string {
  if (
    axios.isAxiosError<{ message?: string; errors?: { msg?: string }[] }>(error)
  ) {
    return (
      error.response?.data?.errors?.[0]?.msg ||
      error.response?.data?.message ||
      error.message
    );
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export const catalogApi = {
  products: async (params: Record<string, string | number> = {}) =>
    (await api.get<ApiList<Product>>("/products", { params })).data,
  product: async (id: string) =>
    (await api.get<ApiObject<Product>>(`/products/${id}`)).data.data,
  categories: async () =>
    (await api.get<ApiList<Category>>("/categories")).data.data,
  category: async (id: string) =>
    (await api.get<ApiObject<Category>>(`/categories/${id}`)).data.data,
  brands: async () => (await api.get<ApiList<Brand>>("/brands")).data.data,
  brand: async (id: string) =>
    (await api.get<ApiObject<Brand>>(`/brands/${id}`)).data.data,
};

export const authApi = {
  login: async (values: { email: string; password: string }) =>
    (await api.post<{ token: string; user?: User }>("/auth/signin", values))
      .data,
  register: async (values: {
    name: string;
    email: string;
    password: string;
    rePassword: string;
    phone: string;
  }) =>
    (await api.post<{ token: string; user?: User }>("/auth/signup", values))
      .data,
  forgotPassword: async (email: string) =>
    (await api.post<{ message?: string }>("/auth/forgotPasswords", { email }))
      .data,
  verifyResetCode: async (resetCode: string) =>
    (
      await api.post<{ status?: string }>("/auth/verifyResetCode", {
        resetCode,
      })
    ).data,
  resetPassword: async (email: string, newPassword: string) =>
    (
      await api.put<{ token?: string }>("/auth/resetPassword", {
        email,
        newPassword,
      })
    ).data,
  changePassword: async (values: {
    currentPassword: string;
    password: string;
    rePassword: string;
  }) =>
    (await api.put<{ token?: string }>("/users/changeMyPassword", values)).data,
};

export const commerceApi = {
  cart: async () => {
    const response = await apiV2.get<
      { cart?: CartData; data?: CartData } | CartData
    >("/cart");
    const payload = response.data;
    if ("cart" in payload && payload.cart) return payload.cart;
    if ("data" in payload && payload.data && typeof payload.data === "object")
      return payload.data;
    return payload as CartData;
  },
  addToCart: async (productId: string) => apiV2.post("/cart", { productId }),
  updateCart: async (productId: string, count: number) =>
    apiV2.put(`/cart/${productId}`, { count }),
  removeFromCart: async (productId: string) =>
    apiV2.delete(`/cart/${productId}`),
  wishlist: async () =>
    (await api.get<ApiList<Product>>("/wishlist")).data.data,
  addToWishlist: async (productId: string) =>
    api.post("/wishlist", { productId }),
  removeFromWishlist: async (productId: string) =>
    api.delete(`/wishlist/${productId}`),
  cashOrder: async (
    cartId: string,
    shippingAddress: {
      details: string;
      phone: string;
      city: string;
      postalCode: string;
    },
  ) =>
    (
      await apiV2.post<ApiObject<Order>>(`/orders/${cartId}`, {
        shippingAddress,
      })
    ).data,
  onlineCheckout: async (
    cartId: string,
    origin: string,
    shippingAddress: { details: string; phone: string; city: string },
  ) =>
    (
      await api.post<{ session?: { url?: string }; url?: string }>(
        `/orders/checkout-session/${cartId}`,
        {
          shippingAddress,
        },
        { params: { url: origin } },
      )
    ).data,
  orders: async (userId: string) => {
    const response = await api.get<Order[] | { data: Order[] }>(
      `/orders/user/${userId}`,
    );
    return Array.isArray(response.data) ? response.data : response.data.data;
  },
};
