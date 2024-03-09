import { createContext, ReactNode, useContext, useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";

type ShoppingCartProviderProps = {
  children: ReactNode;
};

type CartItem = {
  id: number;
  quantity: number;
};

type ShoppingCartContext = {
  openCart: () => void; // this is responsible for opening the cart
  closeCart: () => void; // this is responsible for closing the cart
  getItemQuantity: (id: number) => number; // this is responsible for getting the quantity of the item by id
  increaseCartQuantity: (id: number) => void; // this is responsible for incrementing the quantity of item by id
  decreaseCartQuantity: (id: number) => void; // this is responsible for decreasing the quantity of the item by id
  removeFromCart: (id: number) => void; // this is responsible for removing the item from the cart by id
  cartQuantity: number; // total quantity of the items in the cart
  cartItems: CartItem[]; // an array that represents the list of items
};

const ShoppingCartContext = createContext({} as ShoppingCartContext);

// The useShoppingCart hook allows components to easily access the provided context values. Below is the values that has been provided by ShoppingCartContext.Provider
export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}
export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    "shopping-cart",
    []
  );

  // Calculating the total quantity of items in the cart
  const cartQuantity = cartItems.reduce(
    (quantity, item) => item.quantity + quantity,
    0
  );

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  function getItemQuantity(id: number) {
    return cartItems.find((item) => item.id === id)?.quantity || 0;
  }

  // increasing the quantity
  function increaseCartQuantity(id: number) {
    setCartItems((currItems) => {
      if (currItems.find((item) => item.id === id) == null) {
        return [...currItems, { id, quantity: 1 }];
      } else {
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            return item;
          }
        });
      }
    });
  }

  // decreasing the quantity

  function decreaseCartQuantity(id: number) {
    // Using the setCartItems function provided by React's useState hook
    setCartItems((currItems) => {
      // Check if the item with the specified id is in the cart and has a quantity of 1
      if (currItems.find((item) => item.id === id)?.quantity === 1) {
        // If the item is found and has a quantity of 1, remove it from the cart
        return currItems.filter((item) => item.id !== id);
      } else {
        // If the item is found and has a quantity greater than 1, decrease its quantity by 1
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            // For other items, return them unchanged
            return item;
          }
        });
      }
    });
  }

  // removing an item from the cart
  function removeFromCart(id: number) {
    setCartItems((currItems) => {
      return currItems.filter((item) => item.id !== id);
    });
  }

  return (
    // ShoppingCartContext.Provider is making the context values accessible to its descendants ( values , children )
    <ShoppingCartContext.Provider
      value={{
        getItemQuantity,
        increaseCartQuantity,
        decreaseCartQuantity,
        removeFromCart,
        openCart,
        closeCart,
        cartItems,
        cartQuantity,
      }}
    >
      {children}
      <ShoppingCart isOpen={isOpen} />
    </ShoppingCartContext.Provider>
  );
}
