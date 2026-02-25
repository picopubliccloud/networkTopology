// /src/components/ticketing/CreateTicketPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Text,
  Textarea,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  createTicket,
  listCustomers,
  listServices,
  type CreateTicketPayload,
  type CreateTicketResult,
  type Severity,
  type TicketType,
  type Visibility,
  type CustomerOption,
  type ServiceOption,
} from "../../services/ticketing";

function isUUIDLoose(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    (v ?? "").trim()
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.600" mb={1}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

export default function CreateTicketPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // project_id removed from frontend (backend will resolve via customer_id)
  const [form, setForm] = useState<CreateTicketPayload>({
    customer_id: "",
    service_id: "", // MUST be UUID (ops.service_catalog.service_id)
    ticket_type: "INCIDENT",
    severity: "HIGH",
    visibility: "INTERNAL",
    title: "",
    description: "",
    impact_summary: "",
    suspected_cause: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreateTicketResult | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingMeta(true);
      try {
        const [c, s] = await Promise.all([listCustomers(true), listServices(true)]);
        if (!alive) return;

        setCustomers(c);
        setServices(s);

        setForm((p) => ({
          ...p,
          customer_id: p.customer_id || (c[0]?.id ?? ""),
          service_id: p.service_id || (s[0]?.id ?? ""),
        }));
      } catch (e: any) {
        const msg =
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load customers/services";
        toast({
          title: "Failed to load form data",
          description: msg,
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        if (alive) setLoadingMeta(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [toast]);

  const errors = useMemo(() => {
    const e: string[] = [];

    if (!form.customer_id.trim()) e.push("customer_id is required");
    else if (!isUUIDLoose(form.customer_id)) e.push("customer_id format invalid");

    if (!form.service_id.trim()) e.push("service_id is required");
    else if (!isUUIDLoose(form.service_id)) e.push("service_id format invalid");

    if (!form.title.trim()) e.push("title is required");
    if (!form.description.trim()) e.push("description is required");

    return e;
  }, [form]);

  function setField<K extends keyof CreateTicketPayload>(key: K, value: CreateTicketPayload[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  const onSubmit = async () => {
    setCreated(null);

    if (errors.length) {
      toast({
        title: "Validation error",
        description: errors.join(", "),
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateTicketPayload = {
        ...form,
        customer_id: form.customer_id.trim(),
        service_id: form.service_id.trim(),
        impact_summary: form.impact_summary?.trim() || undefined,
        suspected_cause: form.suspected_cause?.trim() || undefined,
      };

      const res = await createTicket(payload);
      setCreated(res);

      toast({
        title: "Ticket created",
        description: `Ticket ID: ${res.ticket_id}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // go to upload page (step-2)
      navigate(`/tickets/${res.ticket_id}/attachments/upload`);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Unknown error";
      toast({
        title: "Failed to create ticket",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };


  const fillSample = () => {
    setForm((p) => ({
      ...p,
      ticket_type: "INCIDENT",
      severity: "LOW",
      visibility: "INTERNAL",

      title: "VM instance unreachable (network connectivity issue)",
      description:
        "A customer VM in project <project-name> is not reachable over SSH/ICMP.\n" +
        "- Instance: <vm-name> (<vm-id>)\n" +
        "- Tenant/Customer: <customer-name>\n" +
        "- Region/AZ: <region>\n" +
        "- Network/Subnet: <network-name> / <subnet-cidr>\n" +
        "- Fixed IP: <private-ip>\n" +
        "- Floating IP (if any): <public-ip>\n" +
        "- Observed since: <date-time>\n" +
        "Checks done:\n" +
        "- Ping/SSH fails from bastion and from same subnet\n" +
        "- Security group appears unchanged\n" +
        "- No planned maintenance reported",
      impact_summary:
        "Customer workload downtime: application unreachable and remote access unavailable.",
      suspected_cause:
        "Possible security group/NACL change, port down on compute host, or network path issue (router/L2/L3).",
    }));
  };


  const selectedCustomer = customers.find((c) => c.id === form.customer_id);
  const selectedService = services.find((s) => s.id === form.service_id);

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl" py={4}>
          <Flex align="center" justify="space-between">
            <HStack spacing={3}>
              <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
              <VStack align="start" spacing={0}>
                <Heading size="md">Create Ticket</Heading>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Button size="sm" variant="outline" onClick={fillSample} isDisabled={loadingMeta}>
                Fill sample
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onSubmit}
                isDisabled={submitting || loadingMeta}
              >
                {submitting ? (
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text>Creating...</Text>
                  </HStack>
                ) : (
                  "Create"
                )}
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={6}>
        <VStack spacing={4} align="stretch">
          <Box bg="white" border="1px solid" borderColor="gray.200" rounded="md" p={5}>
            <Heading size="sm" mb={3}>
              Customer & Service
            </Heading>

            {loadingMeta ? (
              <HStack py={2}>
                <Spinner size="sm" />
                <Text fontSize="sm" color="gray.600">
                  Loading customers/services...
                </Text>
              </HStack>
            ) : null}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Field label="Customer">
                <Select
                  value={form.customer_id}
                  onChange={(e) => setField("customer_id", e.target.value)}
                  placeholder="Select customer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                {selectedCustomer ? (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Selected: {selectedCustomer.name} ({selectedCustomer.id})
                  </Text>
                ) : null}
              </Field>

              <Field label="Service">
                <Select
                  value={form.service_id}
                  onChange={(e) => setField("service_id", e.target.value)}
                  placeholder="Select service"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                {selectedService ? (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    Selected: {selectedService.label} ({selectedService.id})
                  </Text>
                ) : null}
              </Field>
            </SimpleGrid>

            <Divider my={4} />

            <Heading size="sm" mb={3}>
              Ticket
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Field label="Ticket Type">
                <Select
                  value={form.ticket_type}
                  onChange={(e) => setField("ticket_type", e.target.value as TicketType)}
                >
                  <option value="INCIDENT">INCIDENT</option>
                  <option value="SERVICE_REQUEST">SERVICE_REQUEST</option>
                  <option value="QUESTION">QUESTION</option>
                  <option value="SECURITY_INCIDENT">SECURITY_INCIDENT</option>
                  <option value="CHANGE_REQUEST">CHANGE_REQUEST</option>
                </Select>
              </Field>

              <Field label="Severity">
                <Select
                  value={form.severity}
                  onChange={(e) => setField("severity", e.target.value as Severity)}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </Select>
              </Field>

              <Field label="Visibility">
                <Select
                  value={form.visibility}
                  onChange={(e) => setField("visibility", e.target.value as Visibility)}
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="INTERNAL">INTERNAL</option>
                </Select>
              </Field>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Core router down"
                />
              </Field>

              <Field label="Impact Summary (optional)">
                <Input
                  value={form.impact_summary ?? ""}
                  onChange={(e) => setField("impact_summary", e.target.value)}
                  placeholder="Site outage"
                />
              </Field>
            </SimpleGrid>

            <Field label="Description">
              <Textarea
                mt={1}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Router R1 is unreachable"
                rows={5}
              />
            </Field>

            <Field label="Suspected Cause (optional)">
              <Input
                value={form.suspected_cause ?? ""}
                onChange={(e) => setField("suspected_cause", e.target.value)}
                placeholder="Power failure"
              />
            </Field>

            {errors.length ? (
              <Box mt={4} bg="yellow.50" border="1px solid" borderColor="yellow.200" p={3} rounded="md">
                <Text fontSize="sm" color="yellow.800">
                  {errors.join(", ")}
                </Text>
              </Box>
            ) : null}
          </Box>

          {created ? (
            <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="md" p={5}>
              <Heading size="sm" mb={2}>
                Created
              </Heading>
              <Text fontSize="sm">
                Ticket ID: <Box as="span" fontFamily="mono">{created.ticket_id}</Box>
              </Text>
              {typeof created.ticket_number === "number" ? (
                <Text fontSize="sm">
                  Ticket Number: <Box as="span" fontFamily="mono">{created.ticket_number}</Box>
                </Text>
              ) : null}

              <HStack mt={3} spacing={3}>
                <Button size="sm" colorScheme="blue" onClick={() => navigate(`/tickets/${created.ticket_id}`)}>
                  Open details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCreated(null);
                    setForm((p) => ({ ...p, title: "", description: "" }));
                  }}
                >
                  Create another
                </Button>
              </HStack>
            </Box>
          ) : null}
        </VStack>
      </Container>
    </Box>
  );
}
