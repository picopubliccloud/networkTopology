import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useToast,
  Tag,
  Divider,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  listAttachments,
  getAttachmentUploadTempUrl,
  registerAttachment,
} from "../../services/ticketing";

type TicketAttachment = {
  attachment_id: string;
  file_name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  is_verification?: boolean;
  visibility?: "INTERNAL" | "PUBLIC" | string;
  created_at?: string;
};

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function UploadTicketAttachmentsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { ticket_id } = useParams();

  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);

  const [visibility, setVisibility] = useState<"INTERNAL" | "PUBLIC">("INTERNAL");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const canUpload = useMemo(() => !!ticket_id && !!file && file.size > 0 && !uploading, [ticket_id, file, uploading]);

  const refreshList = async () => {
    if (!ticket_id) return;
    const at = await listAttachments(ticket_id);
    const items = Array.isArray(at) ? at : (at?.items ?? []);
    setAttachments(items);
  };

  useEffect(() => {
    (async () => {
      if (!ticket_id) {
        setLoading(false);
        return;
      }
      try {
        await refreshList();
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket_id]);

  const uploadOne = async () => {
    if (!ticket_id) return;
    if (!file || file.size <= 0) {
      toast({ title: "Select a file", status: "warning", duration: 1500, isClosable: true });
      return;
    }

    try {
      setUploading(true);

      // 1) Ask backend for signed PUT URL
      const up = await getAttachmentUploadTempUrl(ticket_id, {
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        is_verification: false,
      });

      if (!up?.upload_url) throw new Error("No upload_url returned");

      // 2) PUT to Swift
      const putRes = await fetch(up.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!putRes.ok) throw new Error(`Swift upload failed (${putRes.status})`);

      // 3) Register in backend DB
      await registerAttachment(ticket_id, {
        bucket: up.bucket,
        key: up.key,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        is_verification: false,
        visibility,
      } as any);

      toast({ title: "Uploaded", status: "success", duration: 1500, isClosable: true });

      setFile(null);
      await refreshList();
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.response?.data?.error || e?.message || "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <HStack spacing={3}>
              <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
              <VStack align="start" spacing={0}>
                <Heading size="md">Upload Attachments</Heading>
                <Text fontSize="sm" color="gray.600">
                  Ticket ID: <Box as="span" fontFamily="mono">{ticket_id ?? "-"}</Box>
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => ticket_id && navigate(`/tickets/${ticket_id}`)}
              >
                Skip / Done
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={6}>
        {loading ? (
          <HStack spacing={3}>
            <Spinner size="sm" />
            <Text fontSize="sm" color="gray.600">Loading...</Text>
          </HStack>
        ) : !ticket_id ? (
          <Box bg="red.50" border="1px solid" borderColor="red.200" p={4} rounded="md">
            <Text color="red.700">Missing ticket_id</Text>
          </Box>
        ) : (
          <VStack align="stretch" spacing={4}>
            {/* Upload box */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
              <Heading size="sm" mb={3}>Add attachment</Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>Visibility</Text>
                  <Select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="PUBLIC">PUBLIC</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="xs" color="gray.600" mb={1}>File</Text>
                  <Input
                    type="file"
                    accept="*/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <Text fontSize="xs" color="gray.700" mt={2}>
                      Selected: {file.name} ({file.size} bytes)
                    </Text>
                  ) : (
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      For multiple files, zip and upload.
                    </Text>
                  )}
                </Box>
              </SimpleGrid>

              <HStack mt={4}>
                <Button colorScheme="blue" size="sm" isLoading={uploading} isDisabled={!canUpload} onClick={uploadOne}>
                  Upload
                </Button>

                <Button size="sm" variant="outline" onClick={() => refreshList()} isDisabled={uploading}>
                  Refresh list
                </Button>

                <Button size="sm" variant="outline" onClick={() => navigate(`/tickets/${ticket_id}`)} isDisabled={uploading}>
                  Go to details
                </Button>
              </HStack>
            </Box>

            {/* Existing attachments list */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
              <Flex align="center" justify="space-between" mb={3}>
                <Heading size="sm">Uploaded attachments</Heading>
                <HStack spacing={2}>
                  <Tag size="sm" colorScheme="gray">{attachments.length}</Tag>
                </HStack>
              </Flex>

              <Divider mb={3} />

              {attachments.length === 0 ? (
                <Text fontSize="sm" color="gray.600">No attachments yet.</Text>
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
                        <Text fontSize="sm" fontWeight="600">{a.file_name}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {String(a.visibility ?? "INTERNAL").toUpperCase()} • {formatDateTime(a.created_at)}
                        </Text>
                      </Box>

                      <Text fontSize="xs" color="gray.600" fontFamily="mono">
                        {a.size_bytes ? `${a.size_bytes} bytes` : ""}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  );
}