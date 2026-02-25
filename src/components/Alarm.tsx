import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  VStack,
  Text,
  Badge,
  HStack,
  Icon,
  useColorModeValue,
  Divider,
  useDisclosure,
  Menu,
  IconButton,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningTwoIcon } from "@chakra-ui/icons";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieLabelRenderProps,
} from "recharts"; //BarChart, Bar, XAxis, YAxis
import useAlarmData, {
  DownDevice,
  LinkDown,
  PSUHealth,
} from "../hooks/useAlarmData";
import { motion } from "framer-motion";
import LinkDownDetails from "./custom/LinkDownDetails";
import TableComponent, { columnRender } from "./custom/TableComponent";
import DeviceDownDetails from "./custom/Forms/DeviceDownDetails";
import { SlOptionsVertical } from "react-icons/sl";
import { FaEdit, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDeviceAlarmStore } from "../Store/deviceAlarmStore";
import { useLinkAlarmStore } from "../Store/linkAlarmStore";
import ExcelDownloadButton from "./custom/ExcelDownloadButton";
import { IoMdDownload } from "react-icons/io";

const MotionIcon = motion(Icon);

const COLORS = ["#3182ce", "#38a169", "#dd6b20", "#e53e3e"];

type PieData = { name: string; value: number };

const Alarm: React.FC = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryText = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // newly added:
  // Modal-1: Link Down Form:
  const {
    isOpen: isLinkOpen,
    onOpen: onLinkOpen,
    onClose: onLinkClose,
  } = useDisclosure();
  const [linkAlarm, setLinkAlarm] = useState<LinkDown | null>(null);

  // Modal-2: Device Down Form:
  const {
    isOpen: isDeviceOpen,
    onOpen: onDeviceOpen,
    onClose: onDeviceClose,
  } = useDisclosure();
  const [deviceAlarm, setDeviceAlarm] = useState<DownDevice | null>(null);

  /* ---------------------- useStates ---------------------- */
  const { siteSummaries, psuHealth, assetDistribution, isLoading, error } =
    useAlarmData();
  /* ---------------------- stores ---------------------- */
  const { setSelectedDeviceAlarm } = useDeviceAlarmStore();
  const { setSelectedLinkAlarm } = useLinkAlarmStore();

  const navigate = useNavigate();

  // Live time for down duration
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const calcDuration = (since: string) => {
    const diffMs = now.getTime() - new Date(since).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;
  };

  if (isLoading) return <Text p={6}>Loading...</Text>;
  if (error)
    return (
      <Text p={6} color="red.500">
        {error.message}
      </Text>
    ); // use error.message

  // Recharts label function
  const renderLabel = (props: PieLabelRenderProps) => {
    const { name, percent } = props;
    if (name && typeof percent === "number") {
      return `${name} ${(percent * 100).toFixed(0)}%`;
    }
    return null;
  };

  {
    /* ----------------------------------------------- <Data Flatmaps, Columns> ----------------------------------------------- */
  }
  // Down Devices:
  type downDeviceRow = Pick<
    DownDevice,
    | "alarm_id"
    | "alarm_status"
    | "severity"
    | "site"
    | "name"
    | "ip"
    | "down_since"
    | "comments"
  > & {
    duration: string;
    original: DownDevice;
  };
  const flattenDownDevices: downDeviceRow[] = siteSummaries.flatMap((site) =>
    site.downDevices.map((device) => ({
      alarm_id: device.alarm_id,
      alarm_status: device.alarm_status,
      severity: device.severity,
      site: site.site,
      name: device.name,
      ip: device.ip,
      down_since: new Date(device.down_since).toLocaleString(),
      duration: calcDuration(device.down_since),
      comments: device.comments,

      original: device,
    })),
  );

  const downDeviceColumns: columnRender<downDeviceRow>[] = [
    { label: "Site", objKey: "site" },
    { label: "Device", objKey: "name" },
    { label: "MGMT IP", objKey: "ip" },
    { label: "Down Since", objKey: "down_since" },
    { label: "Duration", objKey: "duration" },
    { label: "Comments", objKey: "comments" },
  ];

  // Down Links:
  type linkDownRow = Pick<
    LinkDown,
    | "alarm_id"
    | "site"
    | "hostname"
    | "ipaddress"
    | "interface"
    | "severity"
    | "comments"
  > & {
    original: LinkDown;
  };

  const flattenLinksDown: linkDownRow[] = siteSummaries.flatMap((site) =>
    site.downLinks.map((link) => ({
      ...link,
      alarm_id: link.alarm_id,
      site: site.site,
      hostname: link.hostname,
      ipaddress: link.ipaddress,
      interface: link.interface,
      severity: link.severity,
      comments: link.comments,

      original: link,
    })),
  );
  const linkDownColumn: columnRender<linkDownRow>[] = [
    { label: "Alarm ID", objKey: "alarm_id" },
    { label: "Site", objKey: "site" },
    { label: "Device", objKey: "hostname" },
    { label: "MGMT IP", objKey: "ipaddress" },
    { label: "Interface", objKey: "interface" },
    {
      label: "Severity",
      objKey: "severity",
      render: (value) => {
        const color =
          value === "critical"
            ? "red"
            : value === "major"
              ? "orange"
              : value === "minor"
                ? "yellow"
                : value === "warning"
                  ? "purple"
                  : value === "info"
                    ? "blue"
                    : "gray";
        return <Badge colorScheme={color}>{value.toString()}</Badge>;
      },
    },
    { label: "Remarks", objKey: "comments" },
  ];

  // PSU Health:
  const psuHealthColumn: columnRender<PSUHealth>[] = [
    { label: "Site", objKey: "site" },
    { label: "Total Device", objKey: "total" },
    {
      label: "Redundant PSU",
      objKey: "redundant",
      render: (value) => {
        return <Text color={"green.300"}>{value}</Text>;
      },
    },
    {
      label: "Failed PSU",
      objKey: "failed",
      render: (value, row) => {
        const failedCount = Number(value) || 0;
        const hasFailed = failedCount > 0;
        return (
          <Box
            as="span"
            color={hasFailed ? "red.300" : textColor}
            cursor={hasFailed ? "pointer" : "default"}
          >
            {hasFailed ? (
              <Text
                onClick={() => {
                  const ipsParam = row.failed_ips
                    .map((ip) => ip.split("/")[0])
                    .join(",");
                  window.open(`/device-details?ips=${ipsParam}`, "_blank");
                }}
              >
                <MotionIcon
                  as={WarningTwoIcon}
                  color="red.400"
                  boxSize={4}
                  animate={{ x: [0, -4, 4, -4, 4, 0] }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 5, // wait 5s between each cycle
                  }}
                />
                {row.failed}
              </Text>
            ) : (
              <Text>{row.failed}</Text>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box p={6} bg={bg} minH="100vh">
      <VStack align="start" spacing={8}>
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            Infrastructure Dashboard
          </Text>
          <Text fontSize="md" color={secondaryText}>
            Zone-wise device and power status overview
          </Text>
        </Box>

        {/* Site Summary Cards */}
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          gap={6}
          w="100%"
        >
          {siteSummaries.map((site, index) => (
            <Box
              key={index}
              p={6}
              borderRadius="xl"
              boxShadow="md"
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
              w="100%"
              minH="230px"
            >
              <VStack align="stretch" spacing={3} w="100%">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color={textColor}
                  textAlign="center"
                >
                  {site.site}
                </Text>
                <Divider borderColor={borderColor} />

                <HStack justify="space-between" w="100%">
                  <Text color={secondaryText}>Total Devices</Text>
                  <Text
                    color="purple.400"
                    fontWeight="bold"
                    cursor={site.total_ips.length > 0 ? "pointer" : "default"}
                    onClick={() => {
                      if (site.total_ips.length > 0) {
                        const ipsParam = site.total_ips.join(",");
                        window.open(
                          `/device-details?ips=${ipsParam}`,
                          "_blank",
                        );
                      }
                    }}
                  >
                    {site.total}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="100%">
                  <Text color={secondaryText}>Active Devices</Text>
                  <Text
                    color="blue.400"
                    fontWeight="bold"
                    cursor={
                      site.total_active_ips.length > 0 ? "pointer" : "default"
                    }
                    onClick={() => {
                      if (site.total_active_ips.length > 0) {
                        const ipsParam = site.total_active_ips.join(",");
                        window.open(
                          `/device-details?ips=${ipsParam}`,
                          "_blank",
                        );
                      }
                    }}
                  >
                    {site.totalactive}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="100%">
                  <Text color={secondaryText}>Up</Text>
                  <HStack>
                    <Icon as={CheckCircleIcon} color="green.400" />
                    <Text
                      color="green.400"
                      fontWeight="bold"
                      cursor={site.up_ips.length > 0 ? "pointer" : "default"}
                      onClick={() => {
                        if (site.up_ips.length > 0) {
                          const ipsParam = site.up_ips.join(",");
                          window.open(
                            `/device-details?ips=${ipsParam}`,
                            "_blank",
                          );
                        }
                      }}
                    >
                      {site.up}
                    </Text>
                  </HStack>
                </HStack>

                <HStack justify="space-between" w="100%">
                  <Text color={secondaryText}>Down</Text>
                  <HStack>
                    {/* <Icon as={WarningTwoIcon} color="red.400" /> */}
                    <MotionIcon
                      as={WarningTwoIcon}
                      color="red.400"
                      boxSize={4}
                      animate={{ x: [0, -4, 4, -4, 4, 0] }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 5, // wait 5s between each cycle
                      }}
                    />
                    <Text
                      color="red.400"
                      fontWeight="bold"
                      cursor={site.down_ips.length > 0 ? "pointer" : "default"}
                      onClick={() => {
                        if (site.down_ips.length > 0) {
                          const ipsParam = site.down_ips.join(",");
                          window.open(
                            `/device-details?ips=${ipsParam}`,
                            "_blank",
                          );
                        }
                      }}
                    >
                      {site.down}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </Box>
          ))}
        </Grid>

        {/* newly added: Down Device Details Modal */}
        {deviceAlarm && (
          <DeviceDownDetails
            isOpen={isDeviceOpen}
            onClose={onDeviceClose}
            deviceAlarm={deviceAlarm}
          />
        )}

        {/* Down Devices Table */}
        <Box
          w="100%"
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          border="1px solid"
          borderColor={borderColor}
        >
          {/* <HStack mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Devices Currently Down
            </Text>

            <HStack ms={"auto"} spacing={2}>
              <ExcelDownloadButton
                endpoint="/down-device/download"
                filename="down_device.xlsx"
              />

              <IconButton
                icon={<FaHistory />}
                aria-label="History"
                variant={"ghost"}
                onClick={() => {
                  navigate("/all-device-alarm-history");
                }}
              />
            </HStack>
          </HStack> */}

          <HStack mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Devices Currently Down
            </Text>

            <HStack ms={"auto"} spacing={2} bg={bg} borderRadius={"full"}>
              <ExcelDownloadButton
                endpoint="/down-device/download"
                filename="down_device.xlsx"
              />

              <IconButton
                icon={<FaHistory />}
                aria-label="History"
                variant={"ghost"}
                borderRadius={"full"}
                onClick={() => {
                  navigate("/all-device-alarm-history");
                }}
              />
            </HStack>
          </HStack>

          <TableComponent
            data={flattenDownDevices}
            columns={downDeviceColumns}
            renderActions={(row) => (
              <Menu>
                <MenuButton
                  as={IconButton}
                  size={"sm"}
                  rounded={"full"}
                  bg={"transparent"}
                  aria-label="Options"
                  icon={<SlOptionsVertical />}
                />
                <MenuList>
                  <MenuItem
                    icon={<FaEdit />}
                    onClick={() => {
                      setDeviceAlarm(row.original);
                      onDeviceOpen();
                    }}
                  >
                    Edit
                  </MenuItem>
                  <MenuItem
                    icon={<FaHistory />}
                    onClick={() => {
                      setSelectedDeviceAlarm(row.original);
                      navigate("/device-history");
                    }}
                  >
                    History
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          />
        </Box>

        {/* newly added: Down Links Details Modal */}
        {linkAlarm && (
          <LinkDownDetails
            isOpen={isLinkOpen}
            onClose={onLinkClose}
            linkAlarm={linkAlarm}
          />
        )}

        {/* Down Links Table */}
        <Box
          w="100%"
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack mb={4}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Links Currently Down
            </Text>
            <HStack ms={"auto"} spacing={2} bg={bg} borderRadius={"full"}>
              <ExcelDownloadButton
                endpoint="/down-link/download"
                filename="link_down.xlsx"
              />

              <IconButton
                icon={<FaHistory />}
                aria-label="History"
                variant={"ghost"}
                borderRadius={"full"}
                onClick={() => {
                  navigate("/all-link-alarm-history");
                }}
              />
            </HStack>
          </HStack>

          <TableComponent
            data={flattenLinksDown}
            columns={linkDownColumn}
            renderActions={(row) => (
              <Menu>
                <MenuButton
                  as={IconButton}
                  size={"sm"}
                  rounded={"full"}
                  bg={"transparent"}
                  aria-label="Options"
                  icon={<SlOptionsVertical />}
                />
                <MenuList>
                  <MenuItem
                    icon={<FaEdit />}
                    onClick={() => {
                      setLinkAlarm(row.original);
                      onLinkOpen();
                    }}
                  >
                    Edit
                  </MenuItem>

                  <MenuItem
                    icon={<FaHistory />}
                    onClick={() => {
                      setSelectedLinkAlarm(row.original);
                      navigate("/link-history");
                    }}
                  >
                    History
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          />
        </Box>

        {/* PSU Health Table */}
        <Box
          w="100%"
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
            Power Supply Health
          </Text>
          <TableComponent data={psuHealth} columns={psuHealthColumn} />
        </Box>

        {/* Device Type Distribution Pie Chart */}
        <Box
          w="100%"
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="md"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
            Device Type Distribution
          </Text>
          <ResponsiveContainer width="100%" height={550}>
            <PieChart>
              <Pie
                data={assetDistribution as PieData[]}
                cx="50%"
                cy="50%"
                label={renderLabel}
                labelLine={false}
                outerRadius={180}
                fill="#8884d8"
                dataKey="value"
              >
                {(assetDistribution as PieData[]).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </VStack>
    </Box>
  );
};

export default Alarm;
