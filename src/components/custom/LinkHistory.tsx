import { data, useSearchParams } from "react-router-dom";
import { LinkDown } from "../../hooks/useAlarmData";
import { useLinkAlarmStore } from "../../Store/linkAlarmStore";
import TableComponent, { columnRender } from "./TableComponent";
import useData from "../../hooks/useData";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import Pagination from "./Pagination";

type linkRow = Pick<
  LinkDown,
  | "alarm_id"
  | "hostname"
  | "ipaddress"
  | "interface"
  | "alarm_status"
  | "clear_date"
  | "clear_by"
>;

const linkColumns: columnRender<linkRow>[] = [
  { label: "Alarm ID", objKey: "alarm_id" },
  { label: "Hostname", objKey: "hostname" },
  { label: "IP Address", objKey: "ipaddress" },
  { label: "Interface", objKey: "interface" },
  { label: "Alarm Status", objKey: "alarm_status" },
  { label: "Clear Date", objKey: "clear_date" },
  { label: "Clear By", objKey: "clear_by" },
];

function LinkHistory() {
  const { selectedLinkAlarm: link } = useLinkAlarmStore();

  if (!link) {
    return null;
  }

  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const endpoint = `/link-history/${link.ipaddress}/${link.interface}?${query.toString()}`;
  const {
    data: linkHistory,
    count,
    isLoading,
  } = useData<linkRow>(endpoint, [page, limit]);
  const totalPages = Math.max(1, Math.ceil(count / limit));

  const updatedHistory = linkHistory.map((link) => ({
    ...link,
    clear_date: link.clear_date
      ? new Date(link.clear_date).toLocaleString()
      : null,
  }));

  /* ------------------ Colors ------------------ */
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      <Box minH={"100%"} bg={bg} p={4}>
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
            Link Alarm History
          </Text>

          <TableComponent data={updatedHistory} columns={linkColumns} />

          <Pagination totalPages={totalPages} isLoading={isLoading} />
        </Box>
      </Box>
    </>
  );
}

export default LinkHistory;
