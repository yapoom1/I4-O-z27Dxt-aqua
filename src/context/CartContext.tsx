"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  subtitle?: string;
  price: string;
  numericPrice: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  checkoutLineId?: string;
  variantId?: string;
  productId?: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  streetAddress2?: string;
  cityState: string;
  city?: string;
  cityArea?: string;
  state?: string;
  companyName?: string;
  postalCode?: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  ordersCount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  shippingCost: number;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => Promise<void>;
  addresses: Address[];
  selectedAddressId: string | null;
  selectAddress: (id: string) => void;
  addAddress: (address: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => void;
  deleteAddress: (id: string) => void;
  setAddressAsDefault: (id: string) => void;
  
  // Auth Integration
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (phone: string, email?: string, name?: string, ordersCount?: number, addresses?: any[]) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const INITIAL_CART: CartItem[] = [];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const login = (phone: string, email?: string, name?: string, ordersCount?: number, userAddresses?: any[]) => {
    setIsLoggedIn(true);
    setUser({
      name: name || "Saleor User",
      email: email || "",
      phone: phone,
      avatar: "/images/profile.png",
      ordersCount: ordersCount || 0,
    });
    if (userAddresses && userAddresses.length > 0) {
      const mapped = userAddresses.map((addr: any) => ({
        id: addr.id,
        name: [addr.firstName, addr.lastName].filter(Boolean).join(" ") || name || "Saleor User",
        street: addr.streetAddress1 || "",
        streetAddress2: addr.streetAddress2 || "",
        cityState: [addr.city, addr.countryArea, addr.postalCode].filter(Boolean).join(", "),
        cityArea: addr.cityArea || "",
        state: addr.countryArea || "",
        companyName: addr.companyName || "",
        postalCode: addr.postalCode || "",
        country: addr.country?.country || addr.country?.code || "IN",
        phone: addr.phone || phone,
        isDefault: addr.isDefaultShippingAddress || false,
      }));
      setAddresses(mapped);
      const defaultAddr = mapped.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddr ? defaultAddr.id : (mapped[0]?.id || null));
    } else {
      setAddresses([]);
      setSelectedAddressId(null);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("saleor_auth_token");
    }
    setAddresses([
      {
        id: "1",
        name: "Home",
        street: "123 Main Street",
        cityState: "Chennai, Tamil Nadu, India",
        country: "India",
        phone: "+91 98765 43210",
        isDefault: true,
      },
      {
        id: "2",
        name: "Office",
        street: "456 Corporate Towers",
        cityState: "Chennai, Tamil Nadu, India",
        country: "India",
        phone: "+91 98765 43211",
        isDefault: false,
      },
    ]);
    setSelectedAddressId("1");
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        login(data.phone, data.email, data.name, data.ordersCount, data.addresses);
      })
      .catch((err) => {
        setIsLoggedIn(false);
        setUser(null);
      });
  }, []);

  // Synchronize cart items on login status changes
  useEffect(() => {
    if (isLoggedIn) {
      const stored = typeof window !== "undefined" ? localStorage.getItem("saleor_cart_items") : null;
      let localItems: any[] = [];
      if (stored) {
        try {
          localItems = JSON.parse(stored);
        } catch {}
      }

      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: localItems }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Sync failed");
          return res.json();
        })
        .then((data) => {
          if (data.success && data.items) {
            setCartItems(data.items);
            setAppliedCoupon(data.appliedCoupon || null);
            setDiscountAmount(data.discountAmount || 0);
            setBackendSubtotal(data.subtotal || 0);
            setBackendShippingCost(data.shippingCost || 0);
            setBackendTotalPrice(data.totalAmount || 0);
            if (typeof window !== "undefined") {
              localStorage.removeItem("saleor_cart_items");
            }
          }
        })
        .catch(() => {
          fetch("/api/cart")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.success && data?.items) {
                setCartItems(data.items);
                setAppliedCoupon(data.appliedCoupon || null);
                setDiscountAmount(data.discountAmount || 0);
                setBackendSubtotal(data.subtotal || 0);
                setBackendShippingCost(data.shippingCost || 0);
                setBackendTotalPrice(data.totalAmount || 0);
              }
            });
        });
    } else {
      const stored = typeof window !== "undefined" ? localStorage.getItem("saleor_cart_items") : null;
      if (stored) {
        try {
          setCartItems(JSON.parse(stored));
        } catch {}
      } else {
        setCartItems([]);
      }
    }
  }, [isLoggedIn]);

  // Persist guest cart locally
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoggedIn) {
      localStorage.setItem("saleor_cart_items", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoggedIn]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    if (!isLoggedIn) {
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.id === item.id && i.size === item.size && i.color === item.color
        );
        if (existingIndex > -1) {
          const newItems = [...prev];
          newItems[existingIndex].quantity += 1;
          return newItems;
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      return;
    }

    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: item.id, quantity: 1 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setCartItems(data.items);
          setAppliedCoupon(data.appliedCoupon || null);
          setDiscountAmount(data.discountAmount || 0);
          setBackendSubtotal(data.subtotal || 0);
          setBackendShippingCost(data.shippingCost || 0);
          setBackendTotalPrice(data.totalAmount || 0);
        }
      })
      .catch((err) => console.error("Add to cart failed:", err));
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    if (!isLoggedIn) {
      setCartItems((prev) =>
        prev.filter((i) => !(i.id === id && i.size === size && i.color === color))
      );
      return;
    }

    const item = cartItems.find((i) => i.id === id && i.size === size && i.color === color);
    const lineId = item?.checkoutLineId;
    if (!lineId) return;

    fetch(`/api/cart?lineId=${encodeURIComponent(lineId)}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setCartItems(data.items);
          setAppliedCoupon(data.appliedCoupon || null);
          setDiscountAmount(data.discountAmount || 0);
          setBackendSubtotal(data.subtotal || 0);
          setBackendShippingCost(data.shippingCost || 0);
          setBackendTotalPrice(data.totalAmount || 0);
        }
      })
      .catch((err) => console.error("Remove from cart failed:", err));
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }

    if (!isLoggedIn) {
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === id && i.size === size && i.color === color ? { ...i, quantity } : i
        )
      );
      return;
    }

    const item = cartItems.find((i) => i.id === id);
    const lineId = item?.checkoutLineId;

    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: id, lineId, quantity }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setCartItems(data.items);
          setAppliedCoupon(data.appliedCoupon || null);
          setDiscountAmount(data.discountAmount || 0);
          setBackendSubtotal(data.subtotal || 0);
          setBackendShippingCost(data.shippingCost || 0);
          setBackendTotalPrice(data.totalAmount || 0);
        }
      })
      .catch((err) => console.error("Update quantity failed:", err));
  };

  const clearCart = () => {
    if (!isLoggedIn) {
      setCartItems([]);
      return;
    }

    const lineIds = cartItems.map((i) => i.checkoutLineId).filter(Boolean) as string[];
    if (lineIds.length === 0) {
      setCartItems([]);
      return;
    }

    const deleteParams = lineIds.map((lid) => `lineId=${encodeURIComponent(lid)}`).join("&");
    fetch(`/api/cart?${deleteParams}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCartItems([]);
        }
      })
      .catch((err) => console.error("Clear cart failed:", err));
  };

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [backendSubtotal, setBackendSubtotal] = useState<number>(0);
  const [backendShippingCost, setBackendShippingCost] = useState<number>(0);
  const [backendTotalPrice, setBackendTotalPrice] = useState<number>(0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!isLoggedIn) {
      alert("Please log in to apply coupons.");
      return false;
    }

    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to apply coupon");
        return false;
      }

      setCartItems(data.items);
      setAppliedCoupon(data.appliedCoupon || null);
      setDiscountAmount(data.discountAmount || 0);
      setBackendSubtotal(data.subtotal || 0);
      setBackendShippingCost(data.shippingCost || 0);
      setBackendTotalPrice(data.totalAmount || 0);
      return true;
    } catch (err) {
      console.error(err);
      alert("Error applying coupon.");
      return false;
    }
  };

  const removeCoupon = async () => {
    if (!isLoggedIn) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return;
    }

    try {
      const code = appliedCoupon;
      const res = await fetch(`/api/cart/coupon?code=${encodeURIComponent(code || "")}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to remove coupon");
        return;
      }

      setCartItems(data.items);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setBackendSubtotal(data.subtotal || 0);
      setBackendShippingCost(data.shippingCost || 0);
      setBackendTotalPrice(data.totalAmount || 0);
    } catch (err) {
      console.error(err);
      alert("Error removing coupon.");
    }
  };

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Home",
      street: "123 Main Street",
      cityState: "Chennai, Tamil Nadu, India",
      country: "India",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    {
      id: "2",
      name: "Office",
      street: "456 Corporate Towers",
      cityState: "Chennai, Tamil Nadu, India",
      country: "India",
      phone: "+91 98765 43211",
      isDefault: false,
    },
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("1");

  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
  };

  const addAddress = async (newAddrData: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => {
    if (!isLoggedIn) {
      const isDefault = newAddrData.isDefault || addresses.length === 0;
      const newAddr: Address = {
        ...newAddrData,
        id: Date.now().toString(),
        isDefault,
      };
      setAddresses((prev) => {
        let updated = [...prev];
        if (newAddr.isDefault) {
          updated = updated.map((addr) => ({ ...addr, isDefault: false }));
          setSelectedAddressId(newAddr.id);
        }
        return [...updated, newAddr];
      });
      return;
    }

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddrData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create address");
        return;
      }
      
      if (newAddrData.isDefault && data.address?.id) {
        await fetch(`/api/addresses/default?id=${encodeURIComponent(data.address.id)}`, { method: "POST" });
      }

      const meRes = await fetch("/api/auth/me");
      const meData = meRes.ok ? await meRes.json() : null;
      if (meData) {
        login(meData.phone, meData.email, meData.name, meData.ordersCount, meData.addresses);
      }
    } catch (err) {
      console.error(err);
      alert("Error adding address.");
    }
  };

  const deleteAddress = async (id: string) => {
    if (!isLoggedIn) {
      setAddresses((prev) => {
        const filtered = prev.filter((addr) => addr.id !== id);
        if (filtered.length > 0 && prev.find((a) => a.id === id)?.isDefault) {
          filtered[0].isDefault = true;
          if (selectedAddressId === id) {
            setSelectedAddressId(filtered[0].id);
          }
        } else if (selectedAddressId === id) {
          setSelectedAddressId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
      return;
    }

    try {
      const res = await fetch(`/api/addresses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete address");
        return;
      }

      const meRes = await fetch("/api/auth/me");
      const meData = meRes.ok ? await meRes.json() : null;
      if (meData) {
        login(meData.phone, meData.email, meData.name, meData.ordersCount, meData.addresses);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting address.");
    }
  };

  const setAddressAsDefault = async (id: string) => {
    if (!isLoggedIn) {
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      setSelectedAddressId(id);
      return;
    }

    try {
      const res = await fetch(`/api/addresses/default?id=${encodeURIComponent(id)}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to set default address");
        return;
      }

      const meRes = await fetch("/api/auth/me");
      const meData = meRes.ok ? await meRes.json() : null;
      if (meData) {
        login(meData.phone, meData.email, meData.name, meData.ordersCount, meData.addresses);
      }
    } catch (err) {
      console.error(err);
      alert("Error setting default address.");
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = isLoggedIn ? backendSubtotal : cartItems.reduce((acc, item) => acc + item.numericPrice * item.quantity, 0);
  const shippingCost = isLoggedIn ? backendShippingCost : (cartItems.length > 0 ? (appliedCoupon === "FREESHIP" ? 0 : 15.21) : 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isSidebarOpen,
        setSidebarOpen,
        cartCount,
        subtotal,
        shippingCost,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        addresses,
        selectedAddressId,
        selectAddress,
        addAddress,
        deleteAddress,
        setAddressAsDefault,
        
        // Auth context value
        isLoggedIn,
        user,
        login,
        logout,
        isLoginModalOpen,
        setLoginModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
