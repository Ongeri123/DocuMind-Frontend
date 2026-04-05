import { create } from 'zustand'

const useDocuMind = create((set) => ({
  documents: [],
  activeDocument: null,
  activePage: 'documents', // use null instead of 'null'

  setDocuments: (docs) => set({ documents: docs }),

  addDocument: (doc) => set((state) => ({
    documents: [doc, ...state.documents],
  })),

  setActiveDocument: (doc) => set({ activeDocument: doc }),

  setActivePage: (page) => set({ activePage: page }),

  toggleStarred: (documentId) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === documentId ? { ...d, starred: !d.starred } : d
      ),
    })),

  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
}));


export default useDocuMind