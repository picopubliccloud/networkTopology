import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Code,
  Heading,
  HStack,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ticketingHealth, listTickets } from "../../services/ticketing";

type ApiState = {
  loading: boolean;
  data: any;
  error: string | null;
};

const pretty = (v: any) => JSON.stringify(v, null, 2);

export default function TicketingApiTest() {
  const toast = useToast();
  const [health, setHealth] = useState<ApiState>({ loading: false, data: null, error: null });
  const [tickets, setTickets] = useState<ApiState>({ loading: false, data: null, error: null });

  const runHealth = async () => {
    setHealth({ loading: true, data: null, error: null });
    try {
      const data = await ticketingHealth();
      setHealth({ loading: false, data, error: null });
      toast({ title: "Health OK", status: "success", duration: 1500, isClosable: true });
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Unknown error";
      setHealth({ loading: false, data: null, error: msg });
      toast({ title: "Health failed", description: msg, status: "error", duration: 2500, isClosable: true });
    }
  };

  const runListTickets = async () => {
    setTickets({ loading: true, data: null, error: null });
    try {
      const data = await listTickets({ limit: 10 });
      setTickets({ loading: false, data, error: null });
      toast({ title: "List OK", status: "success", duration: 1500, isClosable: true });
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Unknown error";
      setTickets({ loading: false, data: null, error: msg });
      toast({ title: "List failed", description: msg, status: "error", duration: 2500, isClosable: true });
    }
  };

  // Optional: auto-run health when page opens
  useEffect(() => {
    runHealth();
  }, []);

  return (
    <Box p={6}>
      <Stack spacing={6}>
        <Heading size="md">Ticketing API Test</Heading>
        

        <HStack spacing={3}>
          <Button onClick={runHealth} isDisabled={health.loading}>
            {health.loading ? <Spinner size="sm" mr={2} /> : null}
            GET /health
          </Button>

          <Button onClick={runListTickets} isDisabled={tickets.loading}>
            {tickets.loading ? <Spinner size="sm" mr={2} /> : null}
            GET / (List Tickets)
          </Button>
        </HStack>

        <Box borderWidth="1px" rounded="md" p={4}>
          <Heading size="sm" mb={2}>Health result</Heading>
          {health.error ? (
            <Text color="red.500">{health.error}</Text>
          ) : health.data ? (
            <Code whiteSpace="pre" display="block" width="100%">
              {pretty(health.data)}
            </Code>
          ) : (
            <Text color="gray.500">No data yet.</Text>
          )}
        </Box>

        <Box borderWidth="1px" rounded="md" p={4}>
          <Heading size="sm" mb={2}>List tickets result</Heading>
          {tickets.error ? (
            <Text color="red.500">{tickets.error}</Text>
          ) : tickets.data ? (
            <Code whiteSpace="pre" display="block" width="100%">
              {pretty(tickets.data)}
            </Code>
          ) : (
            <Text color="gray.500">No data yet.</Text>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
