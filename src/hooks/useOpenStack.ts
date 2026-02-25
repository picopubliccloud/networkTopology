import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api-inventory";

export interface OSProject {
    id: string;
    name: string;
    enabled: boolean;
    region: string;
}

export interface OSPublicIP {
    id: string;
    floating: string;
    network_id: string;
    project_id: string;
    region: string;
    status: "ASSIGNED" | "UNASSIGNED";
    assigned_at: string; // ISO string
    last_updated: string; // ISO string
}

export interface IPOverview {
    total_ips: number;
    assigned_ips: number;
    unassigned_ips: number;
    projects: number;
    regions: number;
}

// ---------------------------
// Fetchers
// ---------------------------
const fetchProjects = async (): Promise<OSProject[]> => {
    const { data } = await apiClient.get("/openstack/projects");
    return Array.isArray(data.projects) ? data.projects : [];
};

const fetchPublicIPs = async (): Promise<OSPublicIP[]> => {
    const { data } = await apiClient.get("/openstack/public-ips");
    return Array.isArray(data.public_ips) ? data.public_ips : [];
};

const fetchOverview = async (): Promise<IPOverview> => {
    const { data } = await apiClient.get("/openstack/overview");
    return data;
};

// ---------------------------
// Combined Hook
// ---------------------------
export const useOpenStack = () => {
    const projectsQuery = useQuery<OSProject[], Error>({
        queryKey: ["osProjects"],
        queryFn: fetchProjects,
        refetchInterval: 60000,
    });

    const ipsQuery = useQuery<OSPublicIP[], Error>({
        queryKey: ["osPublicIPs"],
        queryFn: fetchPublicIPs,
        refetchInterval: 60000,
    });

    const overviewQuery = useQuery<IPOverview, Error>({
        queryKey: ["osOverview"],
        queryFn: fetchOverview,
        refetchInterval: 60000,
    });

    return {
        projects: projectsQuery.data || [],
        ips: ipsQuery.data || [],
        overview: overviewQuery.data || null,
        isLoading: projectsQuery.isLoading || ipsQuery.isLoading || overviewQuery.isLoading,
        error: projectsQuery.error || ipsQuery.error || overviewQuery.error,
    };
};
