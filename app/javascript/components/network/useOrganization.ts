import { useQuery } from "react-query";
import { axiosInstance } from "../api/v1/API";
import { IGetOrganizationResponse } from "../api/v1/OrganizationsAPI";

export const useOrganization = (options: { organizationId: string }) =>
    useQuery(["organization", options], async ({ signal }) => {
        const response = await axiosInstance.get<IGetOrganizationResponse>(`organizations/${options.organizationId}`, {
            signal
        });

        return response.data;
    });
