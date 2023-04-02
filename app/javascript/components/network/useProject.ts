import { useQuery } from "react-query";
import { axiosInstance } from "../api/v1/API";
import { IGetProjectResponse } from "../api/v1/ProjectsAPI";

export const useProject = (options: { projectId?: string }) =>
    useQuery(
        ["project", options],
        async ({ signal }) => {
            const response = await axiosInstance.get<IGetProjectResponse>(`projects/${options.projectId}`, {
                signal
            });

            return response.data;
        },
        {
            enabled: !!options.projectId
        }
    );
