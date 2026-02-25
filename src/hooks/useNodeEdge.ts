import { useEffect } from "react";
import useData from "./useData";

export interface Node {
  ip: string;
  hostname: string;
}

export interface Edge {
  local_hostname: string;
  local_ipaddress: string;
  local_intf: string;
  neighbor_hostname: string;
  neighbor_ipaddress: string;
  neighbor_intf: string;
  description: string;
}

export interface NodeEdgeResponse {
  [ip: string]: {
    nodes: Node[];
    edges: Edge[];
  };
}

const useNodeEdge = (selectedCity: string) => {
  const city = selectedCity || 'Jessore';
  // console.log('==> useNodeEdge , city = ', city);
  const endpoint = `/get-nodes-edges/${city}`;
  const { data, count, error, isLoading } = useData<NodeEdgeResponse>(endpoint, [selectedCity]

  );
  console.log('==> useNodeEdge data: ', data);

  useEffect(() => {
    // Perform any additional logic here if needed after fetching data
    // For example, you can access 'data', 'count', 'error', 'isLoading'
    // and perform specific actions based on their values.
  }, [data, count, error, isLoading]);

  return { data, count, error, isLoading };
};

export default useNodeEdge;
