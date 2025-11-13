import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildStorageKey } from 'src/legacy/utils/localStorageUtils';

interface UserState {
  id: string | null;
  setUserId: (id: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    set => ({
      id: null,
      setUserId: id => set({ id }),
    }),
    {
      name: buildStorageKey('user'),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
