import {
  Button,
  GridItem,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa6";

interface Props {
  startDate: string;
  endDate: string;
  onChange: (field: "startDate" | "endDate", value: string) => void;
}

function DateFilter({ startDate, endDate, onChange }: Props) {
  const bg = useColorModeValue("gray.50", "gray.600");

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Button size={"sm"} gap={2}>
            <FaFilter />
            <Text>
              Date: {startDate} -- {endDate}
            </Text>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          {/* <PopoverCloseButton /> */}
          <PopoverBody bg={bg}>
            <SimpleGrid columns={2} columnGap={4}>
              {/* Start Date */}
              <GridItem>
                <VStack align="start" gap={2}>
                  <Text>Start Date</Text>
                  <Input
                    size="sm"
                    w="100%"
                    maxW="160px"
                    type="date"
                    value={startDate}
                    onChange={(e) => onChange("startDate", e.target.value)}
                  />
                </VStack>
              </GridItem>

              {/* End date */}
              <GridItem>
                <VStack align="start" gap={2}>
                  <Text>End Date</Text>
                  <Input
                    size="sm"
                    w="100%"
                    maxW="160px"
                    type="date"
                    value={endDate}
                    onChange={(e) => onChange("endDate", e.target.value)}
                  />
                </VStack>
              </GridItem>
            </SimpleGrid>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default DateFilter;
