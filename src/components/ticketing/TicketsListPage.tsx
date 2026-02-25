// /src/components/ticketing/TicketsListPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tag,
  VStack,
  useToast,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  SkeletonText,
  Checkbox,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ChevronDownIcon, RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { listTickets, listPoolTickets, summaryTickets } from "../../services/ticketing";

/* ============================================================
   Types
============================================================ */

type TicketRow = {
  ticket_id: string;
  ticket_number?: number;
  title?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  customer_id?: string | null;
  service_id?: string | null;
  status?: string;
  severity?: string;
  ticket_type?: string;
  visibility?: string;
  priority_score?: number | null;
  is_known_issue?: boolean;
  created_at?: string;
  updated_at?: string;
  has_owner?: boolean;
  is_locked?: boolean;

  owner_user_id?: string | null;
  owner_display_name?: string | null;
  owner_assigned_at?: string | null;
};

type PagedResponse = {
  has_more?: boolean;
  items?: TicketRow[];
  next_cursor?: string;
};

/* ============================================================
   UI Helpers
============================================================ */

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function since(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return "-";
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d`;
  if (hr > 0) return `${hr}h`;
  if (min > 0) return `${min}m`;
  return `${sec}s`;
}

function SeverityBadge({ severity }: { severity?: string }) {
  const s = (severity ?? "UNKNOWN").toUpperCase();
  const scheme =
    s === "CRITICAL" ? "red" :
    s === "HIGH" ? "orange" :
    s === "MEDIUM" ? "yellow" :
    s === "LOW" ? "green" :
    "gray";
  return <Badge colorScheme={scheme} variant="subtle">{s}</Badge>;
}

function StatusBadge({ status }: { status?: string }) {
  const st = (status ?? "UNKNOWN").toUpperCase();
  const scheme =
    st === "NEW" ? "blue" :
    st === "ACKNOWLEDGED" ? "cyan" :
    st === "IN_PROGRESS" ? "purple" :
    st === "WAITING_CUSTOMER" || st === "WAITING_VENDOR" ? "orange" :
    st === "MITIGATED" ? "teal" :
    st === "RESOLVED" ? "green" :
    st === "CLOSED" ? "gray" :
    "gray";
  return <Badge colorScheme={scheme} variant="subtle">{st}</Badge>;
}

function normalizeTicketsResponse(resp: any): { items: TicketRow[]; has_more: boolean; next_cursor: string } {
  // Supports:
  // 1) Ticket[]
  // 2) { items: Ticket[], next_cursor?: string, has_more?: bool }
  if (Array.isArray(resp)) return { items: resp, has_more: false, next_cursor: "" };
  const items = Array.isArray(resp?.items) ? resp.items : [];
  return {
    items,
    has_more: Boolean(resp?.has_more),
    next_cursor: String(resp?.next_cursor ?? ""),
  };
}

function safeLower(v: any) {
  return String(v ?? "").toLowerCase();
}

function matchesQuery(t: TicketRow, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;

  // match by number, id prefix, title, project id
  if (String(t.ticket_number ?? "").includes(s)) return true;
  if (safeLower(t.ticket_id).includes(s)) return true;
  if (safeLower(t.title).includes(s)) return true;
  if (safeLower(t.project_id).includes(s)) return true;
  if (safeLower(t.customer_id).includes(s)) return true;
  if (safeLower(t.service_id).includes(s)) return true;
  return false;
}

/* ============================================================
   Component
============================================================ */

export default function TicketsListPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // data state
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<TicketRow[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string>("");

  // summary
  const [summary, setSummary] = useState<{
    total: number;
    by_status?: Record<string, number>;
    by_severity?: Record<string, number>;
  } | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);

  // view / filters
  const [poolMode, setPoolMode] = useState(false);
  const [showClosed, setShowClosed] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [limit, setLimit] = useState<number>(25);
  const [q, setQ] = useState<string>("");

  // sorting
  const [sortBy, setSortBy] = useState<"updated_desc" | "created_desc" | "severity_desc">("updated_desc");

  // refresh safety
  const reqSeq = useRef(0);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    try {
      const data = await summaryTickets({
        pool: poolMode,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        include_closed: showClosed,
      });
      setSummary(data);
    } catch (e) {
      // don’t hard-fail the page just because summary failed
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchFirstPage = async () => {
    const seq = ++reqSeq.current;
    setLoading(true);
    setError(null);

    try {
      const params = {
        limit,
        cursor: undefined as string | undefined,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
      };

      const data = poolMode
        ? await listPoolTickets({ limit })
        : await listTickets(params);

      // ignore stale responses
      if (seq !== reqSeq.current) return;

      const norm = normalizeTicketsResponse(data);
      setItems(norm.items);
      setHasMore(norm.has_more);
      setCursor(norm.next_cursor || "");

      toast({
        title: poolMode ? "Pool tickets loaded" : "Tickets loaded",
        status: "success",
        duration: 900,
        isClosable: true,
      });
    } catch (e: any) {
      if (seq !== reqSeq.current) return;
      const msg = e?.response?.data?.error || e?.message || "Unknown error";
      setError(msg);
      toast({
        title: "Failed to load tickets",
        description: msg,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      if (seq === reqSeq.current) setLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!hasMore || loadingMore || loading) return;
    const seq = ++reqSeq.current;
    setLoadingMore(true);
    setError(null);

    try {
      const data = poolMode
        ? await listPoolTickets({ limit, cursor })
        : await listTickets({
            limit,
            cursor,
            status: statusFilter || undefined,
            severity: severityFilter || undefined,
          });

      if (seq !== reqSeq.current) return;

      const norm = normalizeTicketsResponse(data);
      setItems((prev) => {
        // de-dupe by ticket_id
        const seen = new Set(prev.map((x) => x.ticket_id));
        const merged = [...prev];
        for (const it of norm.items) {
          if (!seen.has(it.ticket_id)) merged.push(it);
        }
        return merged;
      });
      setHasMore(norm.has_more);
      setCursor(norm.next_cursor || "");
    } catch (e: any) {
      if (seq !== reqSeq.current) return;
      const msg = e?.response?.data?.error || e?.message || "Unknown error";
      setError(msg);
      toast({
        title: "Failed to load more tickets",
        description: msg,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      if (seq === reqSeq.current) setLoadingMore(false);
    }
  };

  // initial + refetch on key params
  useEffect(() => {
    fetchFirstPage();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolMode, statusFilter, severityFilter, limit, showClosed]);

  const viewItems = useMemo(() => {
    let xs = items.slice();

    // client-side type filter (API doesn't show type filter in list params yet)
    if (typeFilter) {
      xs = xs.filter((t) => String(t.ticket_type ?? "").toUpperCase() === typeFilter);
    }

    // closed toggle
    if (!showClosed) {
      xs = xs.filter((t) => String(t.status ?? "").toUpperCase() !== "CLOSED");
    }

    // search
    if (q.trim()) {
      xs = xs.filter((t) => matchesQuery(t, q));
    }

    // sort
    if (sortBy === "updated_desc") {
      xs.sort((a, b) => {
        const ta = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
        const tb = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
        return tb - ta;
      });
    } else if (sortBy === "created_desc") {
      xs.sort((a, b) => {
        const ta = new Date(a.created_at ?? 0).getTime();
        const tb = new Date(b.created_at ?? 0).getTime();
        return tb - ta;
      });
    } else if (sortBy === "severity_desc") {
      const rank = (s?: string) => {
        const x = String(s ?? "").toUpperCase();
        return x === "CRITICAL" ? 4 : x === "HIGH" ? 3 : x === "MEDIUM" ? 2 : x === "LOW" ? 1 : 0;
      };
      xs.sort((a, b) => rank(b.severity) - rank(a.severity));
    }

    return xs;
  }, [items, q, showClosed, sortBy, typeFilter]);

  // const counts = useMemo(() => {
  //   const total = viewItems.length;
  //   const critical = viewItems.filter((t) => String(t.severity ?? "").toUpperCase() === "CRITICAL").length;
  //   const high = viewItems.filter((t) => String(t.severity ?? "").toUpperCase() === "HIGH").length;
  //   const newCount = viewItems.filter((t) => String(t.status ?? "").toUpperCase() === "NEW").length;
  //   const inProg = viewItems.filter((t) => String(t.status ?? "").toUpperCase() === "IN_PROGRESS").length;
  //   return { total, critical, high, newCount, inProg };
  // }, [viewItems]);
  const counts = useMemo(() => {
    const byStatus = summary?.by_status ?? {};
    const bySev = summary?.by_severity ?? {};

    const total = summary?.total ?? 0;
    const critical = Number(bySev["CRITICAL"] ?? bySev["critical"] ?? 0);
    const high = Number(bySev["HIGH"] ?? bySev["high"] ?? 0);
    const newCount = Number(byStatus["NEW"] ?? byStatus["new"] ?? 0);
    const inProg = Number(byStatus["IN_PROGRESS"] ?? byStatus["in_progress"] ?? 0);

    return { total, critical, high, newCount, inProg };
  }, [summary]);

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex align="start" justify="space-between" gap={4} wrap="wrap">
            <VStack align="start" spacing={1}>
              <Heading size="md">Ticketing</Heading>
              <Text fontSize="sm" color="gray.600">
                {poolMode ? "Pool queue" : "All tickets"} ·
              </Text>

              <HStack spacing={2} mt={1} flexWrap="wrap">
                <Tag size="sm" colorScheme="gray">Total: {counts.total}</Tag>
                <Tag size="sm" colorScheme="red">Critical: {counts.critical}</Tag>
                <Tag size="sm" colorScheme="orange">High: {counts.high}</Tag>
                <Tag size="sm" colorScheme="blue">New: {counts.newCount}</Tag>
                <Tag size="sm" colorScheme="purple">In-Progress: {counts.inProg}</Tag>
              </HStack>
            </VStack>

            <HStack spacing={2} align="center">
              <Button size="sm" colorScheme="blue" onClick={() => navigate("/tickets/create")}>
                Create Ticket
              </Button>

              <IconButton
                aria-label="Refresh"
                size="sm"
                icon={<RepeatIcon />}
                variant="outline"
                isLoading={loading}
                onClick={() => { fetchFirstPage(); fetchSummary(); }}
              />

              
            </HStack>
          </Flex>

          {/* Controls */}
          <Flex mt={4} gap={3} wrap="wrap" align="center">
            <InputGroup maxW="420px" size="sm">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by title, ticket number, ticket_id, project/customer/service id…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </InputGroup>

            <Select
              size="sm"
              maxW="200px"
              placeholder="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="NEW">NEW</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_CUSTOMER">WAITING_CUSTOMER</option>
              <option value="WAITING_VENDOR">WAITING_VENDOR</option>
              <option value="MITIGATED">MITIGATED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </Select>

            <Select
              size="sm"
              maxW="200px"
              placeholder="Severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </Select>

            <Select
              size="sm"
              maxW="200px"
              placeholder="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="INCIDENT">INCIDENT</option>
              <option value="REQUEST">REQUEST</option>
              <option value="CHANGE">CHANGE</option>
              <option value="PROBLEM">PROBLEM</option>
            </Select>

            <Select
              size="sm"
              maxW="220px"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="updated_desc">Sort: Latest updated</option>
              <option value="created_desc">Sort: Newest created</option>
              <option value="severity_desc">Sort: Highest severity</option>
            </Select>

            <Select
              size="sm"
              maxW="150px"
              value={String(limit)}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </Select>

            <HStack spacing={2}>
              <Checkbox
                isChecked={showClosed}
                onChange={(e) => setShowClosed(e.target.checked)}
              >
                <Text fontSize="sm" color="gray.700">Show closed</Text>
              </Checkbox>
            </HStack>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQ("");
                setStatusFilter("");
                setSeverityFilter("");
                setTypeFilter("");
                setShowClosed(false);
                setSortBy("updated_desc");
              }}
            >
              Reset
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Body */}
      <Container maxW="7xl" py={6}>
        {loading ? (
          <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
            <Skeleton height="22px" mb={4} />
            <SkeletonText noOfLines={6} spacing={3} />
          </Box>
        ) : error ? (
          <Box bg="red.50" border="1px solid" borderColor="red.200" p={4} rounded="md">
            <Text color="red.700" fontWeight="600">Failed to load tickets</Text>
            <Text color="red.700" fontSize="sm">{error}</Text>
          </Box>
        ) : viewItems.length === 0 ? (
          <Box bg="white" border="1px solid" borderColor="gray.200" p={6} rounded="md">
            <Text>No tickets found.</Text>
          </Box>
        ) : (
          <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md">
            <TableContainer>
              <Table size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th w="80px">#</Th>
                    <Th w="420px" maxW="420px">Title</Th>
                    <Th w="160px">Status</Th>
                    <Th w="160px">Severity</Th>
                    <Th w="180px">Owner</Th>
                    <Th w="120px">Age</Th>
                    <Th w="190px">Updated</Th>
                    <Th w="240px">Project</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {viewItems.map((t) => (
                    <Tr
                      key={t.ticket_id}
                      cursor="pointer"
                      _hover={{ bg: "gray.50" }}
                      onClick={() => navigate(`/tickets/${t.ticket_id}`)}
                    >
                      <Td fontWeight="700">{t.ticket_number ?? "-"}</Td>

                      <Td w="420px" maxW="420px">
                        <VStack align="start" spacing={0} w="full">
                          <Text
                            fontWeight="600"
                            whiteSpace="normal"
                            overflowWrap="anywhere"
                            wordBreak="break-word"
                            noOfLines={2}   // remove this line if you want unlimited lines
                          >
                            {t.title ?? "(no title)"}
                          </Text>

                          <Text fontSize="xs" color="gray.600" fontFamily="mono" noOfLines={1}>
                            {t.ticket_id}
                          </Text>
                        </VStack>
                      </Td>


                      <Td>
                        <HStack spacing={2} flexWrap="wrap">
                          <StatusBadge status={t.status} />

                          {t.is_locked ? (
                            <Badge colorScheme="orange" variant="subtle">
                              LOCKED
                            </Badge>
                          ) : null}

                          {t.has_owner ? (
                            <Badge colorScheme="purple" variant="subtle">
                              OWNED
                            </Badge>
                          ) : (
                            <Badge colorScheme="gray" variant="outline">
                              POOL
                            </Badge>
                          )}
                        </HStack>
                      </Td>

                      <Td>
                        <SeverityBadge severity={t.severity} />
                        {t.is_known_issue ? (
                          <Badge ml={2} colorScheme="gray" variant="outline">
                            Known
                          </Badge>
                        ) : null}
                      </Td>

                      <Td>
                        <VStack align="start" spacing={0} maxW="180px">
                          <Text fontSize="sm" noOfLines={1}>
                            {t.owner_display_name
                              ? t.owner_display_name
                              : t.has_owner
                                ? (t.owner_user_id ?? "Owned")
                                : "Pool"}
                          </Text>
                          {t.owner_assigned_at ? (
                            <Text fontSize="xs" color="gray.600" noOfLines={1}>
                              since {since(t.owner_assigned_at)}
                            </Text>
                          ) : null}
                        </VStack>
                      </Td>

                      <Td>
                        <Text fontSize="sm" color="gray.800">
                          {since(t.created_at)}
                        </Text>
                      </Td>

                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.800">
                            {formatDateTime(t.updated_at)}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            created {formatDateTime(t.created_at)}
                          </Text>
                        </VStack>
                      </Td>

                      <Td>
                        <VStack align="start" spacing={0} maxW="240px">
                          <Text fontSize="sm" fontFamily="mono" noOfLines={1}>
                            {t.project_name || t.project_id || "-"}
                          </Text>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {t.ticket_type ? `type: ${String(t.ticket_type).toUpperCase()}` : ""}
                            {t.visibility ? ` · ${String(t.visibility).toUpperCase()}` : ""}
                          </Text>
                        </VStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Flex justify="space-between" align="center" px={4} py={3} borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" color="gray.600">
                Showing {viewItems.length} item(s){hasMore ? " · more available" : ""}
              </Text>

              <HStack>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!hasMore || loadingMore}
                  isLoading={loadingMore}
                  onClick={fetchNextPage}
                >
                  Load more
                </Button>
              </HStack>
            </Flex>
          </Box>
        )}
      </Container>
    </Box>
  );
}
