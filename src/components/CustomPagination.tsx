import { HStack, IconButton, Button } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface Props {
  page: number;
  totalItems: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export default function CustomPagination({
  page,
  totalItems,
  pageSize,
  onChange,
}: Props) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <HStack mt={4} spacing={2}>
      <IconButton
        aria-label="previous page"
        icon={<LuChevronLeft />}
        size="sm"
        onClick={() => onChange(Math.max(1, page - 1))}
        isDisabled={page === 1}
      />

      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "solid" : "ghost"}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}

      <IconButton
        aria-label="next page"
        icon={<LuChevronRight />}
        size="sm"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        isDisabled={page === totalPages}
      />
    </HStack>
  );
}