import { useSearchParams } from "react-router-dom";
import { LinkDown } from "../../hooks/useAlarmData";
import TableComponent, { columnRender } from "./TableComponent";
import useData from "../../hooks/useData";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import DateFilter from "./DateFilter";
import Pagination from "./Pagination";

type linkRow = Pick<
  LinkDown,
  | "alarm_id"
  | "hostname"
  | "ipaddress"
  | "interface"
  | "site"
  | "alarm_status"
  | "clear_date"
>;

const linkColumn: columnRender<linkRow>[] = [
  { label: "Alarm ID", objKey: "alarm_id" },
  { label: "Device", objKey: "hostname" },
  { label: "MGMT IP", objKey: "ipaddress" },
  { label: "Interface", objKey: "interface" },
  { label: "Site", objKey: "site" },
  { label: "Alarm Status", objKey: "alarm_status" },
  { label: "Clear Date", objKey: "clear_date" },
];

function AllLinkHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const handleDateChange = (field: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", "1");

    if (value) {
      newParams.set(field, value);
    } else {
      newParams.delete(field);
    }

    setSearchParams(newParams);
  };

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  const endpoint = `/all-link-alarm-history?${query.toString()}`;
  const {
    data: allLinks,
    count,
    isLoading,
  } = useData<linkRow>(endpoint, [page, limit, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / limit));

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
          <Flex align="center" mb={4} justifyContent={"space-between"}>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              All Device Alarm History
            </Text>

            <DateFilter
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
            />
          </Flex>

          <TableComponent data={allLinks} columns={linkColumn} />

          <Pagination totalPages={totalPages} isLoading={isLoading} />
        </Box>
      </Box>
    </>
  );
}

export default AllLinkHistory;
