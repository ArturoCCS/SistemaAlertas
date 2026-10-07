import { create } from 'zustand';

type SesionState = {
  usuarioId: string | null;
  setUsuarioId: (usuarioId: string | null) => void;
};

export const useSesionStore = create<SesionState>((set) => ({
  usuarioId: null,
  setUsuarioId: (usuarioId) => set({ usuarioId }),
}));
