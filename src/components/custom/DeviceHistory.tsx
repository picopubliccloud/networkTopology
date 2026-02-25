import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import { useDeviceAlarmStore } from "../../Store/deviceAlarmStore";
import TableComponent, { columnRender } from "./TableComponent";
import { DownDevice } from "../../hooks/useAlarmData";
import Pagination from "./Pagination";
import { useSearchParams } from "react-router-dom";
import useData from "../../hooks/useData";

type deviceRow = Pick<
  DownDevice,
  "alarm_id" | "name" | "alarm_status" | "site" | "clear_date"
>;

const deviceColumns: columnRender<deviceRow>[] = [
  { label: "Alarm ID", objKey: "alarm_id" },
  { label: "Hostname", objKey: "name" },
  { label: "Alarm Status", objKey: "alarm_status" },
  { label: "Site", objKey: "site" },
  { label: "Clear Date", objKey: "clear_date" },
];

function DeviceHistory() {
  const { selectedDeviceAlarm: device } = useDeviceAlarmStore();
  //   const [deviceHistory, setDeviceHistory] = useState<deviceRow[]>([]);

  if (!device) {
    return null;
  }

  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const endpoint = `/device-history/${device.ip}?${query.toString()}`;
  const {
    data: deviceHistory,
    count,
    isLoading,
  } = useData<deviceRow>(endpoint, [page, limit]);
  const totalPages = Math.max(1, Math.ceil(count / limit));

  const updatedHistory = deviceHistory.map((device) => ({
    ...device,
    clear_date: new Date(device.clear_date).toLocaleString(),
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
            Device Alarm History
          </Text>

          <TableComponent data={updatedHistory} columns={deviceColumns} />

          <Pagination totalPages={totalPages} isLoading={isLoading} />
        </Box>
      </Box>
    </>
  );
}

export default DeviceHistory;
