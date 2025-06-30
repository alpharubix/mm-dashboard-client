import { create } from 'zustand'

type Store = {
  anchorId: string
  setAnchorId: () => void
}

export const useAnchorIdStore = create<Store>()((set) => ({
  anchorId: localStorage.getItem('mm_anchor') || 'ckpl',
  setAnchorId: () => set((state) => ({ anchorId: state.anchorId })),
}))
