// /src/components/ticketing/TicketDetailsPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Spinner,
  Tag,
  Text,
  VStack,
  useToast,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  Textarea,
  Code,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getTicket,
  addUpdate,
  assignOwner,
  unassignOwner,
  lockTicket,
  unlockTicket,
  closeTicket,
  listAttachments,
  getAttachmentTempUrl, // download tempurl
  getAttachmentUploadTempUrl, // upload tempurl (NEW)
  registerAttachment, // register after upload (NEW)
  getMe,
  listUsers,
} from "../../services/ticketing";

/* ============================================================
   Types
============================================================ */

type TicketDetails = {
  ticket_id: string;
  ticket_number: number;
  title?: string | null;

  project_id: string;
  customer_id: string;
  service_id: string;

  ticket_type: string;
  status: string;
  severity: string;
  priority_score?: number | null;
  visibility?: string | null;
  is_known_issue?: boolean;

  created_at: string;
  updated_at: string;

  closed_at?: string | null;
  closed_by?: string | null;
  resolution_code?: string | null;

  description?: string | null;
  impact_summary?: string | null;
  suspected_cause?: string | null;

  resources?: any[];
  updates?: any[];

  owner?: TicketOwner | null;
  lock?: TicketLock | null;
};

type TicketUpdate = {
  update_id?: string;
  created_at?: string;
  created_by?: string;
  created_by_actor?: string;
  update_type?: string;
  visibility?: string;
  body?: string;
  structured?: any;
};

type TicketAttachment = {
  attachment_id: string;
  file_name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  is_verification?: boolean;
  created_at?: string;
};

type TicketLock = {
  locked: boolean;
  locked_by?: string | null;
  locked_at?: string | null;
  lock_expires_at?: string | null;
  lock_reason_id?: number | null;
};

type TicketOwner = {
  user_id?: string | null;
  assigned_by?: string | null;
  assigned_at?: string | null;
};

/* ============================================================
   Helpers
============================================================ */

function SeverityTag({ severity }: { severity?: string }) {
  const s = (severity ?? "UNKNOWN").toUpperCase();
  const scheme =
    s === "CRITICAL"
      ? "red"
      : s === "HIGH"
      ? "orange"
      : s === "MEDIUM"
      ? "yellow"
      : "gray";
  return (
    <Tag colorScheme={scheme} size="sm">
      {s}
    </Tag>
  );
}

function StatusTag({ status }: { status?: string }) {
  const st = (status ?? "UNKNOWN").toUpperCase();
  const scheme =
    st === "NEW"
      ? "blue"
      : st === "IN_PROGRESS"
      ? "purple"
      : st === "WAITING_CUSTOMER" || st === "WAITING_VENDOR"
      ? "orange"
      : st === "RESOLVED"
      ? "green"
      : st === "CLOSED"
      ? "gray"
      : "gray";
  return (
    <Tag colorScheme={scheme} size="sm">
      {st}
    </Tag>
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | boolean | null;
}) {
  const text =
    value === null || value === undefined
      ? "-"
      : typeof value === "boolean"
      ? value
        ? "true"
        : "false"
      : String(value);

  return (
    <Box>
      <Text fontSize="xs" color="gray.600" mb={1}>
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontFamily={label.toLowerCase().includes("id") ? "mono" : "inherit"}
        noOfLines={2}
      >
        {text}
      </Text>
    </Box>
  );
}

function shortId(v?: string) {
  if (!v) return "-";
  if (v.length <= 12) return v;
  return `${v.slice(0, 8)}…${v.slice(-4)}`;
}

function normalizeUpdate(u: any): TicketUpdate {
  return {
    update_id: u?.update_id ?? u?.UpdateID ?? u?.id ?? u?.ID,
    created_at: u?.created_at ?? u?.CreatedAt ?? u?.createdAt,
    created_by: u?.created_by ?? u?.CreatedBy ?? u?.createdBy,
    created_by_actor:
      u?.created_by_actor ??
      u?.CreatedByActor ??
      u?.actor_type ??
      u?.ActorType,
    update_type: u?.update_type ?? u?.UpdateType ?? u?.type ?? u?.Type,
    visibility: u?.visibility ?? u?.Visibility,
    body: u?.body ?? u?.Body ?? u?.text ?? u?.Text,
    structured: u?.structured ?? u?.Structured ?? u?.meta ?? u?.Meta,
  };
}

function normalizeUpdatesList(raw: any): TicketUpdate[] {
  const arr = Array.isArray(raw) ? raw : [];
  const xs = arr.map(normalizeUpdate);

  xs.sort((a, b) => {
    const ta = new Date(a.created_at ?? 0).getTime();
    const tb = new Date(b.created_at ?? 0).getTime();
    return tb - ta;
  });
  return xs;
}

/* ============================================================
   Normalize Backend Response
============================================================ */

function normalizeTicketResponse(raw: any): TicketDetails {
  if (raw?.ticket_id) return raw as TicketDetails;

  const h = raw?.header ?? {};
  const t = raw?.text ?? {};

  return {
    ticket_id: h.TicketID ?? t.TicketID ?? "",
    ticket_number: h.TicketNumber ?? 0,
    title: t.Title ?? null,

    project_id: h.ProjectID ?? "",
    customer_id: h.CustomerID ?? "",
    service_id: h.ServiceID ?? "",

    ticket_type: h.TicketType ?? "",
    status: h.Status ?? "",
    severity: h.Severity ?? "",

    priority_score: h.Priority ?? 0,
    visibility: h.Visibility ?? null,
    is_known_issue: h.IsKnownIssue ?? false,

    created_at: h.CreatedAt ?? t.CreatedAt ?? "",
    updated_at: h.UpdatedAt ?? "",

    closed_at: h.ClosedAt ?? null,
    closed_by: h.ClosedBy ?? null,
    resolution_code: h.ResolutionCode ?? null,

    description: t.Description ?? null,
    impact_summary: t.ImpactSummary ?? null,
    suspected_cause: t.SuspectedCause ?? null,

    resources: raw?.resources ?? [],
    updates: raw?.updates ?? [],

    owner: raw?.owner ?? null,
    lock: raw?.lock ?? null,
  };
}

/* ============================================================
   Component
============================================================ */

export default function TicketDetailsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { ticket_id } = useParams();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketDetails | null>(null);

  // Updates timeline state
  const [updates, setUpdates] = useState<TicketUpdate[]>([]);
  const [updatesExpanded, setUpdatesExpanded] = useState(true);

  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingClose, setUploadingClose] = useState(false);

  // Add update form
  const [updateBody, setUpdateBody] = useState("");
  const [updateVisibility, setUpdateVisibility] = useState<
    "PUBLIC" | "INTERNAL"
  >("INTERNAL");
  const canSubmitUpdate = useMemo(
    () => updateBody.trim().length > 0,
    [updateBody]
  );

  // me
  const [me, setMe] = useState<{ user_id: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMe(await getMe());
      } catch {}
    })();
  }, []);

  const isClosed = useMemo(
    () => String(ticket?.status ?? "").toUpperCase() === "CLOSED",
    [ticket?.status]
  );
  const isLocked = Boolean(ticket?.lock?.locked);
  const lockedBy = (ticket?.lock?.locked_by ?? "").toString();
  const lockedByMe = Boolean(isLocked && me?.user_id && lockedBy === me.user_id);
  const hasOwner = Boolean(ticket?.owner?.user_id);

  // Status change UI
  const [newStatus, setNewStatus] = useState<string>("IN_PROGRESS");
  const canChangeStatus = useMemo(
    () => !!ticket && !isClosed && (!isLocked || lockedByMe),
    [ticket, isClosed, isLocked, lockedByMe]
  );

  const canAssign = useMemo(
    () => !!ticket && !isClosed && (!isLocked || lockedByMe),
    [ticket, isClosed, isLocked, lockedByMe]
  );

  // Assign modal (updated: search + select)
  const [showAssign, setShowAssign] = useState(false);
  const [assignQ, setAssignQ] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignUsers, setAssignUsers] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [assignSelected, setAssignSelected] = useState("");
  const assignTimerRef = useRef<number | null>(null);

  // Unassign modal
  const [showUnassign, setShowUnassign] = useState(false);
  const [unassignReasonId, setUnassignReasonId] = useState<number>(7);
  const [unassignNote, setUnassignNote] = useState("");

  // Lock modal
  const [showLock, setShowLock] = useState(false);
  const [lockReasonId, setLockReasonId] = useState<number>(1);

  // Close modal
  const [showClose, setShowClose] = useState(false);
  const [closeForm, setCloseForm] = useState({
    fix_headline: "",
    symptoms: "",
    root_cause: "",
    fix_applied: "",
    verification_steps: "",
    prevention: "",
    resolution_code: "FIXED",
    verification_attachment: {
      bucket: "",
      key: "",
      file_name: "",
      mime_type: "",
      size_bytes: 0,
      sha256_hex: "",
    },
  });

  // Add attachment (generic)
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [attachVisibility, setAttachVisibility] = useState<
    "INTERNAL" | "PUBLIC"
  >("INTERNAL");
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const canSubmitAttachment = useMemo(() => {
    return !!attachFile && attachFile.size > 0;
  }, [attachFile]);

  const requiresVerification = useMemo(() => {
    const sev = String(ticket?.severity ?? "").toUpperCase();
    return sev === "HIGH" || sev === "CRITICAL";
  }, [ticket?.severity]);

  const canSubmitClose = useMemo(() => {
    const baseOk = [
      closeForm.fix_headline,
      closeForm.symptoms,
      closeForm.root_cause,
      closeForm.fix_applied,
      closeForm.verification_steps,
      String(closeForm.resolution_code),
    ].every((v) => String(v ?? "").trim().length > 0);

    if (!baseOk) return false;

    if (!requiresVerification) return true;

    return !!selectedFile && selectedFile.size > 0;
  }, [closeForm, requiresVerification, selectedFile]);

  const fetchTicket = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const raw = await getTicket(id);
      const data = normalizeTicketResponse(raw);
      setTicket(data);

      try {
        const at = await listAttachments(id);
        setAttachments(Array.isArray(at) ? at : at?.items ?? []);
      } catch {
        setAttachments([]);
      }

      const ups = normalizeUpdatesList(data.updates ?? raw?.updates ?? []);
      setUpdates(ups);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Unknown error";
      setError(msg);
      toast({
        title: "Failed to load ticket",
        description: msg,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (label: string, fn: () => Promise<any>) => {
    if (!ticket_id) return;
    setActionLoading(label);
    try {
      await fn();
      toast({
        title: `${label} success`,
        status: "success",
        duration: 1200,
        isClosable: true,
      });
      await fetchTicket(ticket_id);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Unknown error";
      toast({
        title: `${label} failed`,
        description: msg,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (!ticket_id) {
      setError("Missing ticket_id in route");
      return;
    }
    if (ticket_id === "create") return;
    fetchTicket(ticket_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket_id]);

  const addUpdateNow = async () => {
    if (!ticket_id) return;
    if (!canSubmitUpdate) {
      toast({
        title: "Update body is empty",
        status: "warning",
        duration: 1200,
        isClosable: true,
      });
      return;
    }

    await runAction("Add update", async () => {
      await addUpdate(ticket_id, {
        update_type: "COMMENT",
        visibility: updateVisibility,
        body: updateBody.trim(),
      });

      setUpdateBody("");
      setUpdatesExpanded(true);
    });
  };

  const changeStatusNow = async () => {
    if (!ticket_id) return;

    const target = String(newStatus || "").toUpperCase().trim();
    if (!target) {
      toast({
        title: "Select a status",
        status: "warning",
        duration: 1200,
        isClosable: true,
      });
      return;
    }

    await runAction("Change status", async () => {
      await addUpdate(ticket_id, {
        update_type: "STATUS_CHANGE",
        visibility: "INTERNAL",
        body: `Moving to ${target}`,
        structured: { status: target },
      });
    });
  };

  const downloadAttachment = async (attachmentId: string) => {
    if (!ticket_id) return;

    try {
      setDownloadLoading(attachmentId);

      const res = await getAttachmentTempUrl(ticket_id, attachmentId);

      if (!res?.url) {
        throw new Error("No download URL returned");
      }

      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({
        title: "Download failed",
        description: e?.message || "Unable to generate download link",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setDownloadLoading(null);
    }
  };

  // 1) Ask backend for signed Swift TempURL (PUT)
  // 2) PUT file directly to Swift
  // 3) Register attachment metadata in backend DB
  const uploadToSwiftThenRegister = async (
    file: File,
    isVerification: boolean,
    visibility: "INTERNAL" | "PUBLIC" = "INTERNAL"
  ) => {
    if (!ticket_id) throw new Error("Missing ticket_id");

    const up = await getAttachmentUploadTempUrl(ticket_id, {
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      is_verification: isVerification,
    });

    if (!up?.upload_url) throw new Error("No upload_url returned");

    const putRes = await fetch(up.upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!putRes.ok) throw new Error(`Swift upload failed (${putRes.status})`);

    const reg = await registerAttachment(
      ticket_id,
      {
        bucket: up.bucket,
        key: up.key,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        is_verification: isVerification,
        visibility,
      } as any
    );

    return reg?.attachment ?? reg;
  };

  // =========================
  // Assign: load users
  // =========================
  const loadAssignableUsers = async (q: string) => {
    if (!ticket?.project_id) return;
    setAssignLoading(true);
    try {
      const items = await listUsers({
        q,
        active: true,
        only_ops: true,
        limit: 80,
      } as any);

      const arr = Array.isArray(items) ? items : items?.items ?? [];
      setAssignUsers(
        arr.map((u: any) => {
          const dn = (u.display_name ?? "").toString().trim();
          const em = (u.email ?? "").toString().trim();
          const at = (u.actor_type ?? "").toString().trim();
          const label = `${dn || em || u.user_id}${em && dn ? ` (${em})` : ""}${
            at ? ` - ${at}` : ""
          }`;
          return { value: String(u.user_id), label };
        })
      );
    } catch (e: any) {
      toast({
        title: "Failed to load users",
        description: e?.response?.data?.error || e?.message || "Unknown error",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const openAssignModal = () => {
    setAssignSelected("");
    setAssignQ("");
    setShowAssign(true);
    loadAssignableUsers("");
  };

  const onAssignConfirm = async () => {
    if (!ticket_id) return;
    const uid = assignSelected.trim();
    if (!uid) {
      toast({ title: "Select a user", status: "warning", duration: 1200, isClosable: true });
      return;
    }

    setShowAssign(false);
    await runAction("Assign", () => assignOwner(ticket_id, { user_id: uid }));
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            <HStack spacing={3}>
              <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>

              <VStack align="start" spacing={0}>
                <Heading size="md">Ticket {ticket?.ticket_number ?? ""}</Heading>
                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                  {ticket?.title ?? (loading ? "Loading..." : "-")}
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2} flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                isLoading={loading}
                onClick={() => ticket_id && fetchTicket(ticket_id)}
              >
                Refresh
              </Button>

              <StatusTag status={ticket?.status} />
              <SeverityTag severity={ticket?.severity} />

              {/* ASSIGN / REASSIGN / UNASSIGN */}
              {!hasOwner ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    isDisabled={!canAssign || !me?.user_id}
                    isLoading={actionLoading === "Assign"}
                    onClick={() =>
                      ticket_id &&
                      me?.user_id &&
                      runAction("Assign", () => assignOwner(ticket_id, { user_id: me.user_id }))
                    }
                  >
                    Assign to Me
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    isDisabled={!canAssign}
                    onClick={openAssignModal}
                  >
                    Assign to Member
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    isDisabled={!canAssign}
                    onClick={openAssignModal}
                  >
                    Reassign
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    isDisabled={isClosed || isLocked}
                    onClick={() => setShowUnassign(true)}
                  >
                    Unassign
                  </Button>
                </>
              )}

              {/* LOCK / UNLOCK */}
              {!isLocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={isClosed}
                  onClick={() => setShowLock(true)}
                >
                  Lock
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={actionLoading === "Unlock"}
                  isDisabled={isClosed || !lockedByMe}
                  onClick={() => ticket_id && runAction("Unlock", () => unlockTicket(ticket_id))}
                >
                  Unlock
                </Button>
              )}

              <Button
                size="sm"
                colorScheme="red"
                isDisabled={isClosed}
                onClick={() => setShowClose(true)}
              >
                Close
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={6}>
        {loading ? (
          <Flex align="center" justify="center" py={16}>
            <HStack spacing={3}>
              <Spinner />
              <Text>Loading ticket...</Text>
            </HStack>
          </Flex>
        ) : error ? (
          <Box bg="red.50" border="1px solid" borderColor="red.200" p={4} rounded="md">
            <Text color="red.700" fontWeight="600">
              Failed to load ticket
            </Text>
            <Text color="red.700" fontSize="sm">
              {error}
            </Text>
          </Box>
        ) : !ticket ? (
          <Box bg="white" border="1px solid" borderColor="gray.200" p={6} rounded="md">
            <Text>No ticket data.</Text>
          </Box>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* SUMMARY */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
              <Heading size="sm" mb={3}>
                Summary
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Field label="Ticket ID" value={ticket.ticket_id} />
                <Field label="Ticket Number" value={ticket.ticket_number} />
                <Field label="Title" value={ticket.title ?? "-"} />

                <Field label="Status" value={ticket.status} />
                <Field label="Severity" value={ticket.severity} />
                <Field label="Ticket Type" value={ticket.ticket_type} />
              </SimpleGrid>

              <Divider my={4} />

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Field label="Project ID" value={ticket.project_id} />
                <Field label="Customer ID" value={ticket.customer_id} />
                <Field label="Service ID" value={ticket.service_id} />

                <Field label="Created At" value={formatDateTime(ticket.created_at)} />
                <Field label="Updated At" value={formatDateTime(ticket.updated_at)} />
                <Field label="Closed At" value={formatDateTime(ticket.closed_at ?? undefined)} />
              </SimpleGrid>

              {(ticket.closed_by || ticket.resolution_code) ? (
                <>
                  <Divider my={4} />
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Field label="Closed By" value={ticket.closed_by ?? "-"} />
                    <Field label="Resolution Code" value={ticket.resolution_code ?? "-"} />
                    <Field label=" " value=" " />
                  </SimpleGrid>
                </>
              ) : null}
            </Box>

            {/* DETAILS */}
            {(ticket.description || ticket.impact_summary || ticket.suspected_cause) ? (
              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
                <Heading size="sm" mb={3}>
                  Details
                </Heading>

                {ticket.description ? (
                  <Box mb={3}>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Description
                    </Text>
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {ticket.description}
                    </Text>
                  </Box>
                ) : null}

                {ticket.impact_summary ? (
                  <Box mb={3}>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Impact Summary
                    </Text>
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {ticket.impact_summary}
                    </Text>
                  </Box>
                ) : null}

                {ticket.suspected_cause ? (
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Suspected Cause
                    </Text>
                    <Text fontSize="sm" whiteSpace="pre-wrap">
                      {ticket.suspected_cause}
                    </Text>
                  </Box>
                ) : null}
              </Box>
            ) : null}

            {/* UPDATES TIMELINE */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
              <Flex align="center" justify="space-between" mb={3}>
                <Heading size="sm">Updates</Heading>
                <HStack spacing={2}>
                  <Tag
                    size="sm"
                    colorScheme="gray"
                    cursor="pointer"
                    onClick={() => setUpdatesExpanded((p) => !p)}
                  >
                    {updatesExpanded ? "Hide" : "Show"} ({updates.length})
                  </Tag>
                  <Tag
                    size="sm"
                    colorScheme="blue"
                    cursor="pointer"
                    onClick={() => ticket_id && fetchTicket(ticket_id)}
                  >
                    Refresh
                  </Tag>
                </HStack>
              </Flex>

              {!updatesExpanded ? null : updates.length === 0 ? (
                <Text fontSize="sm" color="gray.600">
                  No updates yet.
                </Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {updates.map((u, idx) => (
                    <Box
                      key={u.update_id ?? `${idx}`}
                      border="1px solid"
                      borderColor="gray.200"
                      rounded="md"
                      p={3}
                      bg={
                        String(u.visibility ?? "").toUpperCase() === "PUBLIC"
                          ? "green.50"
                          : "gray.50"
                      }
                    >
                      <Flex justify="space-between" align="start" gap={3}>
                        <VStack align="start" spacing={0} w="full">
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge colorScheme="purple" variant="subtle">
                              {(u.update_type ?? "UPDATE").toUpperCase()}
                            </Badge>
                            <Badge
                              colorScheme={
                                String(u.visibility ?? "").toUpperCase() === "PUBLIC"
                                  ? "green"
                                  : "gray"
                              }
                              variant="subtle"
                            >
                              {(u.visibility ?? "INTERNAL").toUpperCase()}
                            </Badge>
                            {u.created_by_actor ? (
                              <Badge colorScheme="blue" variant="outline">
                                {String(u.created_by_actor).toUpperCase()}
                              </Badge>
                            ) : null}
                            {u.created_by ? (
                              <Text fontSize="xs" color="gray.600" fontFamily="mono">
                                by {shortId(u.created_by)}
                              </Text>
                            ) : null}
                          </HStack>

                          <Text mt={2} fontSize="sm" whiteSpace="pre-wrap">
                            {u.body ?? "-"}
                          </Text>
                        </VStack>

                        <VStack align="end" spacing={0} minW="150px">
                          <Text fontSize="xs" color="gray.600">
                            {formatDateTime(u.created_at)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {u.update_id ? `id ${shortId(u.update_id)}` : ""}
                          </Text>
                        </VStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            {/* ATTACHMENTS */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
              <Flex align="center" justify="space-between" mb={3}>
                <Heading size="sm">Attachments</Heading>
                <HStack spacing={2}>
                  <Tag size="sm" colorScheme="gray">
                    {attachments.length}
                  </Tag>
                  <Button size="sm" variant="outline" onClick={() => setShowAddAttachment(true)}>
                    Add attachment
                  </Button>
                </HStack>
              </Flex>

              {attachments.length === 0 ? (
                <Text fontSize="sm" color="gray.600">
                  No attachments.
                </Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {attachments.map((a) => (
                    <Flex
                      key={a.attachment_id}
                      border="1px solid"
                      borderColor="gray.200"
                      rounded="md"
                      p={3}
                      justify="space-between"
                      align="center"
                    >
                      <Box>
                        <Text fontSize="sm" fontWeight="600">
                          {a.file_name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {a.is_verification ? "verification" : "attachment"} •{" "}
                          {formatDateTime(a.created_at)}
                        </Text>
                      </Box>

                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={downloadLoading === a.attachment_id}
                        onClick={() => downloadAttachment(a.attachment_id)}
                      >
                        Download
                      </Button>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Box>

            {/* ADD UPDATE */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
              <Heading size="sm" mb={3}>
                Add Update
              </Heading>

              {/* Status change row */}
              <Flex gap={3} wrap="wrap" mb={3} align="center">
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  isDisabled={!canChangeStatus}
                >
                  {[
                    "NEW",
                    "ACKNOWLEDGED",
                    "IN_PROGRESS",
                    "WAITING_CUSTOMER",
                    "WAITING_VENDOR",
                    "MITIGATED",
                    "RESOLVED",
                  ]
                    .filter((s) => s !== ticket?.status)
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!canChangeStatus}
                  isLoading={actionLoading === "Change status"}
                  onClick={changeStatusNow}
                >
                  Change status
                </Button>

                {/* NEW: quick reassign button near status */}
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={!canAssign}
                  onClick={openAssignModal}
                >
                  {hasOwner ? "Reassign" : "Assign"}
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
                <Select
                  value={updateVisibility}
                  onChange={(e) => setUpdateVisibility(e.target.value as any)}
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="PUBLIC">PUBLIC</option>
                </Select>

                <Textarea
                  gridColumn={{ base: "1 / -1", md: "2 / -1" }}
                  value={updateBody}
                  onChange={(e) => setUpdateBody(e.target.value)}
                  placeholder="Write update..."
                  minH="100px"
                />
              </SimpleGrid>

              <HStack>
                <Button
                  size="sm"
                  colorScheme="blue"
                  isDisabled={!canSubmitUpdate}
                  isLoading={actionLoading === "Add update"}
                  onClick={addUpdateNow}
                >
                  Add update
                </Button>

                <Text fontSize="sm" color="gray.600">
                  {canSubmitUpdate ? " " : "Write something to enable submit."}
                </Text>
              </HStack>
            </Box>
          </VStack>
        )}
      </Container>

      {/* Assign Modal (UPDATED: search + select) */}
      <Modal
        isOpen={showAssign}
        onClose={() => {
          setShowAssign(false);
          setAssignQ("");
          setAssignSelected("");
        }}
        size="lg"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{hasOwner ? "Reassign Owner" : "Assign Owner"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Search and select an ops user.
                </Text>
                <Input
                  placeholder="Search by name or email"
                  value={assignQ}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAssignQ(v);

                    if (assignTimerRef.current) window.clearTimeout(assignTimerRef.current);
                    assignTimerRef.current = window.setTimeout(() => {
                      loadAssignableUsers(v);
                    }, 250);
                  }}
                />
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  User
                </Text>
                <Select
                  placeholder={assignLoading ? "Loading..." : "Select a user"}
                  value={assignSelected}
                  onChange={(e) => setAssignSelected(e.target.value)}
                  isDisabled={assignLoading}
                >
                  {assignUsers.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Select>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Only users who have membership in this ticket project will appear.
                </Text>
              </Box>

              {ticket?.owner?.user_id ? (
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Current owner user_id
                  </Text>
                  <Code fontSize="xs">{ticket.owner.user_id}</Code>
                </Box>
              ) : null}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              mr={3}
              variant="outline"
              onClick={() => {
                setShowAssign(false);
                setAssignQ("");
                setAssignSelected("");
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={actionLoading === "Assign"}
              isDisabled={!canAssign || !assignSelected}
              onClick={onAssignConfirm}
            >
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Unassign Modal */}
      <Modal isOpen={showUnassign} onClose={() => setShowUnassign(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unassign Owner</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={1} spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Unassign reason
                </Text>
                <Select
                  value={String(unassignReasonId)}
                  onChange={(e) => setUnassignReasonId(Number(e.target.value))}
                >
                  <option value="1">SHIFT_ENDED</option>
                  <option value="2">NEED_L2</option>
                  <option value="3">NEED_SECURITY</option>
                  <option value="4">WAITING_VENDOR</option>
                  <option value="5">MISROUTED</option>
                  <option value="6">CUSTOMER_UNRESPONSIVE</option>
                  <option value="7">WORKLOAD_TOO_HIGH</option>
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Note (optional)
                </Text>
                <Textarea value={unassignNote} onChange={(e) => setUnassignNote(e.target.value)} />
              </Box>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="outline" onClick={() => setShowUnassign(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={actionLoading === "Unassign"}
              onClick={() => {
                setShowUnassign(false);
                ticket_id &&
                  runAction("Unassign", () =>
                    unassignOwner(ticket_id, {
                      unassign_reason_id: unassignReasonId,
                      note: unassignNote.trim() || undefined,
                    })
                  );
              }}
            >
              Unassign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Lock Modal */}
      <Modal isOpen={showLock} onClose={() => setShowLock(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Lock Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Choose a lock reason.
            </Text>
            <Select value={String(lockReasonId)} onChange={(e) => setLockReasonId(Number(e.target.value))}>
              <option value="1">PICKUP_FROM_POOL</option>
              <option value="2">LEAD_REASSIGNMENT</option>
              <option value="3">MERGE_IN_PROGRESS</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="outline" onClick={() => setShowLock(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              isLoading={actionLoading === "Lock"}
              onClick={() => {
                setShowLock(false);
                ticket_id && runAction("Lock", () => lockTicket(ticket_id, { lock_reason_id: lockReasonId }));
              }}
            >
              Lock
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Attachment modal */}
      <Modal isOpen={showAddAttachment} onClose={() => setShowAddAttachment(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Attachment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={1} spacing={3}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Visibility
                </Text>
                <Select
                  value={attachVisibility}
                  onChange={(e) => setAttachVisibility(e.target.value as any)}
                >
                  <option value="INTERNAL">INTERNAL</option>
                  <option value="PUBLIC">PUBLIC</option>
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  File
                </Text>
                <Input
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setAttachFile(f);
                  }}
                />
                {attachFile ? (
                  <Text fontSize="xs" color="gray.700" mt={2}>
                    Selected: {attachFile.name} ({attachFile.size} bytes)
                  </Text>
                ) : null}
                <Text fontSize="xs" color="gray.500" mt={2}>
                  For multiple files please zip and upload.
                </Text>
              </Box>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              variant="outline"
              onClick={() => {
                setShowAddAttachment(false);
                setAttachFile(null);
                setAttachVisibility("INTERNAL");
              }}
            >
              Cancel
            </Button>

            <Button
              colorScheme="blue"
              isLoading={uploadingAttachment}
              isDisabled={!canSubmitAttachment}
              onClick={async () => {
                if (!ticket_id) return;
                if (!attachFile) return;

                try {
                  setUploadingAttachment(true);

                  await uploadToSwiftThenRegister(attachFile, false, attachVisibility);

                  toast({
                    title: "Attachment added",
                    status: "success",
                    duration: 1500,
                    isClosable: true,
                  });

                  setShowAddAttachment(false);
                  setAttachFile(null);

                  const at = await listAttachments(ticket_id);
                  setAttachments(Array.isArray(at) ? at : at?.items ?? []);
                } catch (e: any) {
                  toast({
                    title: "Upload failed",
                    description: e?.message || "Unable to upload attachment",
                    status: "error",
                    duration: 2500,
                    isClosable: true,
                  });
                } finally {
                  setUploadingAttachment(false);
                }
              }}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Close Modal */}
      <Modal isOpen={showClose} onClose={() => setShowClose(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Close Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={1} spacing={3}>
              <Input
                placeholder="Fix headline"
                value={closeForm.fix_headline}
                onChange={(e) => setCloseForm((p) => ({ ...p, fix_headline: e.target.value }))}
              />

              <Textarea
                placeholder="Symptoms"
                value={closeForm.symptoms}
                onChange={(e) => setCloseForm((p) => ({ ...p, symptoms: e.target.value }))}
              />

              <Textarea
                placeholder="Root cause"
                value={closeForm.root_cause}
                onChange={(e) => setCloseForm((p) => ({ ...p, root_cause: e.target.value }))}
              />

              <Textarea
                placeholder="Fix applied"
                value={closeForm.fix_applied}
                onChange={(e) => setCloseForm((p) => ({ ...p, fix_applied: e.target.value }))}
              />

              <Textarea
                placeholder="Verification steps"
                value={closeForm.verification_steps}
                onChange={(e) =>
                  setCloseForm((p) => ({ ...p, verification_steps: e.target.value }))
                }
              />

              <Textarea
                placeholder="Prevention"
                value={closeForm.prevention}
                onChange={(e) => setCloseForm((p) => ({ ...p, prevention: e.target.value }))}
              />

              <Select
                value={closeForm.resolution_code}
                onChange={(e) => setCloseForm((p) => ({ ...p, resolution_code: e.target.value }))}
              >
                <option value="FIXED">FIXED</option>
                <option value="WORKAROUND">WORKAROUND</option>
                <option value="DUPLICATE">DUPLICATE</option>
                <option value="WONT_FIX">WONT_FIX</option>
              </Select>
            </SimpleGrid>

            {requiresVerification ? (
              <Box border="1px solid" borderColor="orange.200" rounded="md" p={3} mt={4}>
                <Text fontSize="sm" fontWeight="600" color="orange.700" mb={2}>
                  Verification attachment required (HIGH/CRITICAL)
                </Text>

                <Input
                  type="file"
                  accept="*/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setSelectedFile(f);

                    setCloseForm((p) => ({
                      ...p,
                      verification_attachment: f
                        ? {
                            ...p.verification_attachment,
                            file_name: f.name,
                            size_bytes: f.size,
                            mime_type: f.type || "",
                          }
                        : {
                            ...p.verification_attachment,
                            file_name: "",
                            size_bytes: 0,
                            mime_type: "",
                          },
                    }));
                  }}
                />

                <Text fontSize="xs" color="gray.600" mt={2}>
                  Upload a file here. For multiple files please zip and upload.
                </Text>

                {closeForm.verification_attachment?.file_name ? (
                  <Text fontSize="xs" color="gray.700" mt={2}>
                    Selected: {closeForm.verification_attachment.file_name}{" "}
                    {closeForm.verification_attachment.size_bytes
                      ? `(${closeForm.verification_attachment.size_bytes} bytes)`
                      : ""}
                  </Text>
                ) : null}
              </Box>
            ) : (
              <Text fontSize="xs" color="gray.500" mt={4}>
                Verification attachment is optional for LOW/MEDIUM tickets.
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              mr={3}
              variant="outline"
              onClick={() => {
                setShowClose(false);
                setCloseForm((p) => ({
                  ...p,
                  fix_headline: "",
                  symptoms: "",
                  root_cause: "",
                  fix_applied: "",
                  verification_steps: "",
                  prevention: "",
                  resolution_code: "FIXED",
                  verification_attachment: {
                    bucket: "",
                    key: "",
                    file_name: "",
                    mime_type: "",
                    size_bytes: 0,
                    sha256_hex: "",
                  },
                }));
              }}
            >
              Cancel
            </Button>

            <Button
              colorScheme="red"
              isLoading={actionLoading === "Close" || uploadingClose}
              isDisabled={!canSubmitClose}
              onClick={async () => {
                if (!ticket_id) return;

                if (!canSubmitClose) {
                  toast({
                    title: "Missing required fields",
                    description: requiresVerification
                      ? "For HIGH/CRITICAL tickets you must upload a verification file."
                      : "Please fill all required closure fields.",
                    status: "warning",
                    duration: 2500,
                    isClosable: true,
                  });
                  return;
                }

                try {
                  setUploadingClose(true);

                  let verificationMeta: any = undefined;

                  if (requiresVerification) {
                    if (!selectedFile) throw new Error("No file selected");
                    const up = await getAttachmentUploadTempUrl(ticket_id, {
                      file_name: selectedFile.name,
                      mime_type: selectedFile.type || "application/octet-stream",
                      size_bytes: selectedFile.size,
                      is_verification: true,
                    });

                    const putRes = await fetch(up.upload_url, {
                      method: "PUT",
                      headers: { "Content-Type": selectedFile.type || "application/octet-stream" },
                      body: selectedFile,
                    });
                    if (!putRes.ok) throw new Error(`Swift upload failed (${putRes.status})`);

                    verificationMeta = {
                      bucket: up.bucket,
                      key: up.key,
                      file_name: selectedFile.name,
                      mime_type: selectedFile.type || "application/octet-stream",
                      size_bytes: selectedFile.size,
                      is_verification: true,
                    };
                  }

                  const payload: any = {
                    fix_headline: closeForm.fix_headline.trim(),
                    symptoms: closeForm.symptoms.trim(),
                    root_cause: closeForm.root_cause.trim(),
                    fix_applied: closeForm.fix_applied.trim(),
                    verification_steps: closeForm.verification_steps.trim(),
                    prevention: closeForm.prevention.trim() || undefined,
                    resolution_code: closeForm.resolution_code,
                    ...(verificationMeta ? { verification_attachment: verificationMeta } : {}),
                  };

                  setShowClose(false);
                  await runAction("Close", () => closeTicket(ticket_id, payload));

                  setSelectedFile(null);
                } catch (e: any) {
                  toast({
                    title: "Close failed",
                    description: e?.message || "Unable to close ticket",
                    status: "error",
                    duration: 2500,
                    isClosable: true,
                  });
                } finally {
                  setUploadingClose(false);
                }
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}