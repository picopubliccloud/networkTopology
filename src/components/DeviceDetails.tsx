import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  Divider,
  Badge,
} from "@chakra-ui/react";

import TableComponent, { columnRender } from "./custom/TableComponent";

import Pagination from "./custom/Pagination";

interface Device {
  id: number;
  asset_type: string | null;
  asset_tag: string | null;
  brand_model: string | null;
  nic_line_card: string | null;
  psu: string | null;
  site: string | null;
  rack: string | null;
  unit: string | null;
  owner: string | null;
  status: string | null;
  remark: string | null;
  mgmt_ip_address: string | null;
  secondary_ip: string | null;
  host_name: string | null;
  os: string | null;
  os_version: string | null;
  added_date: string | null;
  last_down_time: string | null;
  last_up_time: string | null;
  total_power_supply_count: number | null;
  up_power_supply_count: number | null;
  down_power_supply_count: number | null;
}

const DeviceDetails: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const ipsParam = query.get("ips");
  const [ipCount, setIPCount] = useState<string[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------ Pagination Logic ------------------------ */
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (!ipsParam) {
      setError("No IPs provided.");
      setIPCount([]);
      setLoading(false);
      return;
    }

    const downIps: string[] = ipsParam
      ? ipsParam
          .split(",")
          .map((ip) => ip.trim())
          .filter((ip) => ip.length > 0)
      : [];

    setIPCount(downIps);

    fetch(
      `https://192.168.30.120:8080/api/devices?ips=${ipsParam}&page=${currentPage}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        setDevices(data.devices || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch devices");
        setLoading(false);
      });
  }, [ipsParam, currentPage, limit]);

  if (isLoading) return <Text p={6}>Loading...</Text>;
  if (error) return <Text p={6} color="red.500">{error}</Text>;


  {
    /* ------------------------ Pagination Logic ------------------------ */
  }
  const total_down_ips = ipCount.length;
  const totalPages = Math.max(1, Math.ceil(total_down_ips / limit));

  const deviceColumn: columnRender<Device>[] = [
    { label: "Device Name", objKey: "host_name" },
    { label: "Mgmt IP", objKey: "mgmt_ip_address" },
    { label: "Asset Type", objKey: "asset_type" },
    { label: "Model", objKey: "brand_model" },
    {
      label: "Rack/Unit",
      objKey: "rack",
      render: (value, row) => {
        return <Text>{value ? `${row.rack}/${row.unit || "-"}` : "-"}</Text>;
      },
    },
    {
      label: "Status",
      objKey: "status",
      render: (value) => {
        const color =
          value === "Used" ? "green" : value === "Faulty" ? "red" : "gray";

        return <Badge colorScheme={color}>{value || "-"}</Badge>;
      },
    },
    {
      label: "Down/Up Time",
      objKey: "last_down_time",
      render: (value, row) => {
        return (
          <Text>
            {row.last_down_time
              ? `Down: ${new Date(row.last_down_time).toLocaleString()}`
              : ""}
            {row.last_up_time
              ? ` | Up: ${new Date(row.last_up_time).toLocaleString()}`
              : ""}
          </Text>
        );
      },
    },
    {
      label: "PSU (Up/Down)",
      objKey: "up_power_supply_count",
      render: (value, row) => {
        return (
          <Text>
            {row.up_power_supply_count ?? 0}/{row.down_power_supply_count ?? 0}
          </Text>
        );
      },
    },
  ];

  return (
    <Box p={6} bg={bg} minH="100vh">
      <VStack align="start" spacing={6} w="100%">
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          Device Details
        </Text>
        <Divider borderColor={borderColor} />

        <Box
          w="100%"
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          border="1px solid"
          borderColor={borderColor}
          overflowX="auto"
        >
          <TableComponent data={devices} columns={deviceColumn} />

          {/* Pagination below the table */}
          <Pagination totalPages={totalPages} isLoading={isLoading} />
        </Box>
      </VStack>
    </Box>
  );
};

export default DeviceDetails;
