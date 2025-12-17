import { create } from 'zustand';
import { persist } from 'zustand/middleware';



const useToolStore = create()(
  persist(
    (set, get) => ({
      tools: [],
      setTools: (tools) => set({ tools }),
      updateTool: (id, newTool) =>
        set((state) => {
          const tools = state.tools.map((tool) => {
            if (tool.id === id) {
              return { ...newTool, ...tool };
            }
            return tool;
          });
          return { tools };
        }),
      deleteTool: (id) =>
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
        })),
      getToolById: (id) =>
        id ? get().tools.find((tool) => tool.id === id) : undefined,
    }),
    {
      name: 'agentok-projects',
    }
  )
);

export default useToolStore;
