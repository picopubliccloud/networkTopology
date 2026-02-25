import { Box } from "@chakra-ui/react";
import { IoIosArrowForward } from "react-icons/io";

interface Props {
  onExpand: () => void;
}

function ExpandButton({ onExpand }: Props) {
  return (
    <>
      <Box
        p={1}
        bg={"black"}
        color={"white"}
        position={"absolute"}
        borderRadius={"0 20px 20px 0"}
        bottom={3}
        left={"50px"}
        cursor="pointer"
        onClick={onExpand}
      >
        <IoIosArrowForward />
      </Box>
    </>
  );
}

export default ExpandButton;
