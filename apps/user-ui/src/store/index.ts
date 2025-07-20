import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sendKafkaEvent } from "../actions/track-user";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
};

// 👇 Step 1: Setup store with persist
const setUpStore = persist<Store>(
  (set, get) => ({
    cart: [],
    wishlist: [],

    addToCart: (product, user, location, deviceInfo) => {
      set((state) => {
        const existing = state.cart?.find((item) => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                : item
            ),
          };
        }
        return {
          cart: [...state.cart, { ...product, quantity: product?.quantity }],
        };
      });
      // send kafka event
      if (user?.id && location && deviceInfo) {
        sendKafkaEvent({
          userId: user?.id,
          productId: product?.id,
          shopId: product?.shopId,
          action: "add_to_cart",
          country: location?.country || "Unknown country",
          city: location?.city || "Unknown city",
          device: deviceInfo || "Unknown device",
        });
      }
    },

    removeFromCart: (id, user, location, deviceInfo) => {
      const removeProduct = get().cart.find((item) => item.id === id);
      set((state) => ({
        cart: state.cart?.filter((item) => item.id !== id),
      }));
      // send kafka event
      if (user?.id && location && deviceInfo && removeProduct) {
        sendKafkaEvent({
          userId: user?.id,
          productId: removeProduct?.id,
          shopId: removeProduct?.shopId,
          action: "remove_from_cart",
          country: location?.country || "Unknown country",
          city: location?.city || "Unknown city",
          device: deviceInfo || "Unknown device",
        });
      }
    },

    addToWishlist: (product, user, location, deviceInfo) => {
      set((state) => {
        if (state.wishlist.find((item) => item.id === product.id)) return state;
        return { wishlist: [...state.wishlist, product] };
      });
      if (user?.id && location && deviceInfo) {
        sendKafkaEvent({
          userId: user?.id,
          productId: product?.id,
          shopId: product?.shopId,
          action: "add_to_wishlist",
          country: location?.country || "Unknown country",
          city: location?.city || "Unknown city",
          device: deviceInfo || "Unknown device",
        });
      }
    },

    removeFromWishlist: (id, user, location, deviceInfo) => {
      const removeProduct = get().wishlist.find((item) => item.id === id);
      set((state) => ({
        wishlist: state.wishlist.filter((item) => item.id !== id),
      }));
      if (user?.id && location && deviceInfo && removeProduct) {
        sendKafkaEvent({
          userId: user?.id,
          productId: removeProduct?.id,
          shopId: removeProduct?.shopId,
          action: "remove_from_wishlist",
          country: location?.country || "Unknown country",
          city: location?.city || "Unknown city",
          device: deviceInfo || "Unknown device",
        });
      }
    },
  }),
  {
    name: "store-storage",
  }
);

// 👇 Step 2: Create the store
export const useStore = create<Store>()(setUpStore);
