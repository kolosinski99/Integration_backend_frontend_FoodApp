import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

const initialState = {
  restaurantId: null,
  restaurantName: null,
  items: [],
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialState);

  const clearCart = () => setCart(initialState);

  const addItem = (product, restaurantId, restaurantName) => {
    const menuProductId = product.id_menu_product;
    const productName = product.product_name;
    const price = Number(product.price);
    const imagePath = product.image_path || null;

    setCart((prev) => {
      const differentRestaurant =
        prev.restaurantId !== null && prev.restaurantId !== restaurantId;

      if (differentRestaurant) {
        const confirmed = window.confirm(
          'Koszyk zawiera dania z innej restauracji. Wyczyścić koszyk i dodać nowe danie?'
        );
        if (!confirmed) return prev;
        return {
          restaurantId,
          restaurantName,
          items: [{ menuProductId, productName, price, quantity: 1, imagePath }],
        };
      }

      const existing = prev.items.find((i) => i.menuProductId === menuProductId);
      if (existing) {
        return {
          ...prev,
          restaurantId,
          restaurantName,
          items: prev.items.map((i) =>
            i.menuProductId === menuProductId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }

      return {
        restaurantId,
        restaurantName,
        items: [...prev.items, { menuProductId, productName, price, quantity: 1, imagePath }],
      };
    });
  };

  const removeItem = (menuProductId) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.menuProductId !== menuProductId);
      if (items.length === 0) return initialState;
      return { ...prev, items };
    });
  };

  const updateQuantity = (menuProductId, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const items = prev.items.filter((i) => i.menuProductId !== menuProductId);
        if (items.length === 0) return initialState;
        return { ...prev, items };
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.menuProductId === menuProductId ? { ...i, quantity } : i
        ),
      };
    });
  };

  const itemCount = useMemo(
    () => cart.items.reduce((acc, i) => acc + i.quantity, 0),
    [cart.items]
  );

  const totalPrice = useMemo(
    () =>
      Number(
        cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)
      ),
    [cart.items]
  );

  const value = {
    restaurantId: cart.restaurantId,
    restaurantName: cart.restaurantName,
    items: cart.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    totalPrice,
    isEmpty: cart.items.length === 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
