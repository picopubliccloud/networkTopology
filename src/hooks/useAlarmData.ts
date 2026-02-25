import { useQuery } from "@tanstack/react-query";
import apiInventory from "../services/api-inventory";

export interface DownDevice {
  alarm_id: string;
  name: string;
  ip: string;
  alarm_status: string;
  severity: string;
  down_since: string;
  site: string;
  comments: string;
  clear_by: string; // FIXME: Newly added to match backend model;
  acknowledge_by: string;
  clear_date: string;
  acknowledge_date: string;
}

export interface LinkDown {
  id: number;
  alarm_id: string;
  alarm_name: string;
  hostname: string;
  ipaddress: string;
  interface: string;
  link_type: string;
  description: string;
  link_status: string;
  alarm_status: string;
  severity: string;
  create_date: string;
  clear_date: string | null;
  acknowledge_date: string | null;
  last_sync_date: string | null;
  comments: string;
  acknowledge_by: string;
  clear_by: string;
  duration: number | null;
  flap_count: number;
  site: string;
}

export interface SiteSummary {
  site: string;
  total: number;
  totalactive: number;
  up: number;
  down: number;

  downDevices: DownDevice[];
  downLinks: LinkDown[]; // <-- NEW

  total_ips: string[];
  total_active_ips: string[];
  up_ips: string[];
  down_ips: string[];
}

export interface PSUHealth {
  site: string;
  total: number;
  redundant: number;
  failed: number;
  failed_ips: string[];
}

export interface AssetDistribution {
  name: string;
  value: number;
}

// ---------------------------
//   Fetchers
// ---------------------------
const fetchSites = async (): Promise<
  Omit<SiteSummary, "downDevices" | "downLinks">[]
> => {
  const { data } = await apiInventory.get("/sites");
  return Array.isArray(data.sites) ? data.sites : [];
};

const fetchDown = async (): Promise<DownDevice[]> => {
  const { data } = await apiInventory.get("/down");
  return Array.isArray(data.devices) ? data.devices : [];
};

const fetchDownLinks = async (): Promise<LinkDown[]> => {
  const { data } = await apiInventory.get("/down-links");
  // console.log("fetchDownLinks data: ", data);
  return Array.isArray(data.links) ? data.links : [];
};

const fetchPSU = async (): Promise<PSUHealth[]> => {
  const { data } = await apiInventory.get("/psu");
  return Array.isArray(data.psu_health) ? data.psu_health : [];
};

const fetchAssets = async (): Promise<AssetDistribution[]> => {
  const { data } = await apiInventory.get("/asset-distribution");
  return Array.isArray(data.asset_distribution) ? data.asset_distribution : [];
};

// ---------------------------
//   Combined Hook
// ---------------------------
const useAlarmData = () => {
  const sitesQuery = useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
    refetchInterval: 60000,
  });

  const downQuery = useQuery({
    queryKey: ["down"],
    queryFn: fetchDown,
    refetchInterval: 60000,
  });

  const downLinksQuery = useQuery({
    queryKey: ["down-links"],
    queryFn: fetchDownLinks,
    refetchInterval: 60000,
  });

  const psuQuery = useQuery({
    queryKey: ["psu"],
    queryFn: fetchPSU,
    refetchInterval: 60000,
  });

  const assetsQuery = useQuery({
    queryKey: ["assetDistribution"],
    queryFn: fetchAssets,
    refetchInterval: 60000,
  });

  const siteSummaries: SiteSummary[] = Array.isArray(sitesQuery.data)
    ? sitesQuery.data.map((site) => ({
        ...site,

        // Down devices already contain site
        downDevices: Array.isArray(downQuery.data)
          ? downQuery.data.filter((d) => d.site === site.site)
          : [],

        // Down links now contain site column
        downLinks: Array.isArray(downLinksQuery.data)
          ? downLinksQuery.data.filter((lnk) => lnk.site === site.site)
          : [],
      }))
    : [];

  return {
    siteSummaries,
    psuHealth: psuQuery.data || [],
    assetDistribution: assetsQuery.data || [],
    isLoading:
      sitesQuery.isLoading ||
      downQuery.isLoading ||
      downLinksQuery.isLoading ||
      psuQuery.isLoading ||
      assetsQuery.isLoading,
    error:
      sitesQuery.error ||
      downQuery.error ||
      downLinksQuery.error ||
      psuQuery.error ||
      assetsQuery.error,
  };
};

export default useAlarmData;
