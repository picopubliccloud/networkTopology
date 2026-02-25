import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export interface columnRender<T, K extends keyof T = keyof T> {
  label: string;
  objKey: K;
  render?: (value: T[K], row: T) => React.ReactNode;
}

interface extraColumn<T> {
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends object> {
  // T extends Record<string, unknown>
  columns: columnRender<T>[];
  data: T[];
  renderActions?: (row: T) => React.ReactNode;
  extraColumns?: extraColumn<T>[];
  onRowClick?: (row: T) => void;
}

function TableComponent<T extends object>({
  // T extends Record<string, unknown>
  columns,
  data,
  renderActions,
  extraColumns = [],
  onRowClick,
}: Props<T>) {
  // colors:
  const headerBg = useColorModeValue("gray.100", "gray.700");
  // const hoverBG = useColorModeValue("gray.50", "gray.700");

  if (!data) return null;

  return (
    <>
      <TableContainer
        w={"100%"}
        maxH={"75vh"}
        overflowY={"auto"}
        sx={{
          scrollbarWidth: "thin",
        }}
      >
        <Table variant={"simple"} size={"sm"}>
          {/* Headers */}
          <Thead position="sticky" top={0} bg={headerBg} zIndex={1}>
            <Tr>
              {/* Actions Column */}
              {renderActions && <Th>Actions</Th>}

              {/* Headers */}
              {columns.map((col) => (
                <Th key={col.label}>{col.label}</Th>
              ))}

              {/* extra column headers */}
              {extraColumns?.map((extra) => (
                <Th key={extra.label}>{extra.label}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                cursor={onRowClick ? "pointer" : "default"}
              >
                {/* Actions Column */}
                {renderActions && <Td>{renderActions(row)}</Td>}

                {/* Data */}
                {columns.map((col) => (
                  <Td key={col.label}>
                    {col.render
                      ? col.render(row[col.objKey], row)
                      : String(row[col.objKey] ?? "-")}
                  </Td>
                ))}

                {/* extra column data */}
                {extraColumns &&
                  extraColumns.map((extra) => (
                    <Td key={extra.label}>
                      {extra.render && extra.render(row)}
                    </Td>
                  ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}

export default TableComponent;
