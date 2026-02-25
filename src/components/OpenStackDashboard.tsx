import React, { useState, useMemo, useRef } from "react";
import {
  Box,
  Grid,
  Text,
  Badge,
  useColorModeValue,
  Input,
  Table,
  Tbody,
  Thead,
  Tr,
  Td,
  Th,
  Collapse,
  IconButton,
  HStack,
  Select,
  List,
  ListItem,
  useOutsideClick,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts";
import { useOpenStack, OSProject, OSIP } from "../hooks/useOpenStack";

const COLORS = ["#3182ce", "#38a169", "#dd6b20", "#e53e3e"];

const OpenStackDashboard: React.FC = () => {
  // -----------------------
  // Hooks (always unconditional)
  // -----------------------
  const { projects: fetchedProjects, overview, isLoading, error } = useOpenStack();
  const [search, setSearch] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("all");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsideClick({ ref: containerRef, handler: () => setSuggestionsOpen(false) });

  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // -----------------------
  // Data processing
  // -----------------------
  const projects: OSProject[] = useMemo(
    () =>
      (fetchedProjects || []).map((p) => ({
        ...p,
        ips: (p.ips || []).map((ip) => ({
          PublicIP: ip.floating_ip,
          Region: ip.region,
          Status: ip.status,
          AssignedAt: ip.assigned_at,
        })),
      })),
    [fetchedProjects]
  );

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (filter === "with_ips") filtered = filtered.filter((p) => p.total_ips && p.total_ips > 0);
    if (filter === "assigned_ips") filtered = filtered.filter((p) => p.assigned_ips && p.assigned_ips > 0);
    if (filter === "unassigned_ips") filtered = filtered.filter((p) => p.unassigned_ips && p.unassigned_ips > 0);
    if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  }, [projects, filter, search]);

  const suggestions = useMemo(() => {
    if (!search) return [];
    return projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [projects, search]);

  const toggleProject = (id: string) => setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleSelectSuggestion = (name: string) => { setSearch(name); setSuggestionsOpen(false); };

  // -----------------------
  // Visualization data
  // -----------------------
  const topProjects = useMemo(
    () => [...projects].sort((a, b) => (b.total_ips || 0) - (a.total_ips || 0)).slice(0, 5),
    [projects]
  );

  const enabledDisabledData = useMemo(() => {
    const enabled = projects.filter((p) => p.enabled).length;
    const disabled = projects.filter((p) => !p.enabled).length;
    return [
      { name: "Enabled", value: enabled },
      { name: "Disabled", value: disabled },
    ];
  }, [projects]);

  const ipStackedData = useMemo(
    () => [...projects].sort((a, b) => (b.total_ips || 0) - (a.total_ips || 0)).slice(0, 5),
    [projects]
  );
  const ipStackedDataTop20 = useMemo(
    () =>
        [...projects]
        .sort((a, b) => (b.unassigned_ips || 0) - (a.unassigned_ips || 0)) // sort by unassigned IPs desc
        .slice(0, 20), // top 20
    [projects]
    );


  // -----------------------
  // Conditional render
  // -----------------------
  if (isLoading) return <Text p={6}>Loading...</Text>;
  if (error) return <Text p={6} color="red.500">{error.message}</Text>;
  if (!overview) return <Text p={6}>No Data</Text>;

  // -----------------------
  // JSX
  // -----------------------
  return (
    <Box p={6} bg={bg} minH="100vh">
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold">OpenStack Dashboard</Text>
      </Box>

      {/* Summary Cards */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
        <Card label="Total Projects" value={overview.projects} />
        <Card label="Total Public IPs" value={overview.total_ips} />
        <Card label="Assigned IPs" value={overview.assigned_ips} />
        <Card label="Unassigned IPs" value={overview.unassigned_ips} />
      </Grid>

      {/* Visualizations */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
        {/* Top Projects */}
        <Box p={6} bg={cardBg} borderRadius="xl" border="1px solid gray">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Top Projects by IPs</Text>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topProjects} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="assigned_ips" stackId="a" fill="#38a169" />
              <Bar dataKey="unassigned_ips" stackId="a" fill="#dd6b20" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Assigned vs Unassigned IPs */}
        <Box p={6} bg={cardBg} borderRadius="xl" border="1px solid gray" gridColumn={{ md: "span 2" }}>
          <Text fontSize="lg" fontWeight="bold" mb={4}>Projects: Assigned vs Unassigned IPs</Text>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ipStackedDataTop20} margin={{ top: 20 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="assigned_ips" stackId="a" fill="#38a169" />
              <Bar dataKey="unassigned_ips" stackId="a" fill="#dd6b20" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Grid>

      {/* Filter & Search above Projects list */}
      <HStack spacing={4} w="100%" mb={6} ref={containerRef}>
        <Select maxW="300px" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Projects</option>
          <option value="with_ips">Projects with Public IPs</option>
          <option value="assigned_ips">Projects with Assigned IPs</option>
          <option value="unassigned_ips">Projects with Unassigned IPs</option>
        </Select>

        <Box position="relative" w="100%" maxW="400px">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSuggestionsOpen(true); }}
          />
          {suggestionsOpen && suggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left={0}
              right={0}
              bg="white"
              border="1px solid gray"
              borderRadius="md"
              zIndex={10}
            >
              <List>
                {suggestions.map((s) => (
                  <ListItem
                    key={s.id}
                    px={2}
                    py={1}
                    cursor="pointer"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => handleSelectSuggestion(s.name)}
                  >
                    {s.name}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </HStack>

      {/* Projects List */}
      <Box w="100%" p={6} bg={cardBg} borderRadius="xl" border="1px solid gray">
        <Text fontSize="xl" fontWeight="bold" mb={4}>Projects</Text>
        <Box maxH="70vh" overflowY="auto">
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            {filteredProjects.map((p) => (
              <Box key={p.id} p={4} bg={bg} borderRadius="md" border="1px solid gray">
                <HStack justify="space-between" align="start">
                  <HStack>
                    <IconButton
                      size="sm"
                      aria-label="Expand"
                      icon={expandedProjects[p.id] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      onClick={() => toggleProject(p.id)}
                    />
                    <Text fontWeight="bold">{p.name}</Text>
                    <Badge colorScheme={p.enabled ? "green" : "red"}>
                      {p.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </HStack>
                </HStack>

                <Box mt={1}>
                  <Text fontSize="sm">
                    Regions: {(p.regions && p.regions.length) ? p.regions.join(", ") : "None"}
                  </Text>
                  <Text fontSize="sm">
                    Total IPs: {p.total_ips || 0}, Assigned: {p.assigned_ips || 0}, Unassigned: {p.unassigned_ips || 0}
                  </Text>
                </Box>

                <Collapse in={expandedProjects[p.id]} animateOpacity>
                  {p.ips.length > 0 ? (
                    <Box mt={3} overflowX="auto">
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Public IP</Th>
                            <Th>Region</Th>
                            <Th>Status</Th>
                            <Th>Assigned At</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {p.ips.map((ip: OSIP, idx: number) => (
                            <Tr key={`${p.id}-${ip.PublicIP}-${idx}`}>
                              <Td>{ip.PublicIP || "-"}</Td>
                              <Td>{ip.Region || "-"}</Td>
                              <Td>{ip.Status || "-"}</Td>
                              <Td>{ip.AssignedAt ? new Date(ip.AssignedAt).toLocaleString() : "-"}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Text mt={2} fontSize="sm" color="gray.500">No IPs assigned yet.</Text>
                  )}
                </Collapse>
              </Box>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

// -----------------------
// Card component
// -----------------------
type CardProps = { label: string; value: number };
const Card: React.FC<CardProps> = ({ label, value }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  return (
    <Box p={6} bg={cardBg} borderRadius="xl" border="1px solid gray" cursor="default">
      <Text>{label}</Text>
      <Text fontWeight="bold" fontSize="2xl">{value}</Text>
    </Box>
  );
};

export default OpenStackDashboard;
