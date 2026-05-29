import { createContext, useContext, useState } from "react";

export interface ItemCarrito {
  id: number;
  name: string;
  description: string;
  price: number;
  image: number;
  tamaño: string;
  descripcionDiseño: string;
  mensajeTarta: string;
}

interface CarritoContextType {
  carrito: ItemCarrito[];
  añadir: (item: ItemCarrito) => void;
  eliminar: (index: number) => void;
  vaciar: () => void;
}

const CarritoContext = createContext<CarritoContextType>({
  carrito: [],
  añadir: () => {},
  eliminar: () => {},
  vaciar: () => {},
});

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

  const añadir = (item: ItemCarrito) => setCarrito((prev) => [...prev, item]);
  const eliminar = (index: number) => setCarrito((prev) => prev.filter((_, i) => i !== index));
  const vaciar = () => setCarrito([]);

  return (
    <CarritoContext.Provider value={{ carrito, añadir, eliminar, vaciar }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);