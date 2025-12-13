// export interface Project {
//     id: number;
//     name: string;
//     description?: string;
//     flow: any; // Complicated JSON object
//     settings?: any;
//     created_at?: string;
//     updated_at?: string;
//   }
// interface ProjectState {
//     projects: Project[];
//     activeProjectId: number;
//     nodePanePinned: boolean;
//     chatPanePinned: boolean;
//     hoveredGroupId: string | null;
//     setProjects: (projects: Project[]) => void;
//     setActiveProjectId: (id: number) => void;
//     pinNodePane: (pinned: boolean) => void;
//     pinChatPane: (pinned: boolean) => void;
//     setHoveredGroupId: (id: string | null) => void;
//     updateProject: (id: number, project: Partial<Project>) => void;
//     deleteProject: (id: number) => void;
//     getProjectById: (id: number) => Project | undefined;
//   }
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useProjectState = create()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: -1,
      nodePanePinned: false,
      chatPanePinned: false,
      hoveredGroupId: null,

      setProjects: (projects) => set({ projects }),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      pinNodePane: (pinned) => set({ nodePanePinned: pinned }),
      pinChatPane: (pinned) => set({ chatPanePinned: pinned }),
      setHoveredGroupId: (id) => set({ hoveredGroupId: id }),

      updateProject: (id, newProject) =>
        set((state) => {
          console.log("updatation trying", { id, newProject });

          return {
            projects: state.projects.map((project) =>
              project.id === id
                ? { ...project, ...newProject }
                : project
            ),
          };
        }),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id.projectId),
        })),

      getProjectById: (id) => {
        const project = id
          ? get().projects.find((project) => project.id === id.projectId)
          : undefined;

        console.log('[getProjectById]', { id, project });

        return project;
      },
    }),
    {
      name: 'Wewin projects',
    }
  )
);

export default useProjectState;
