import { Button, HStack } from "@chakra-ui/react";
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

interface Props {
  totalPages: number;
  isLoading: boolean;
  //   onPageChange: (newPage: number) => void;
}

function Pagination({ totalPages, isLoading = false }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = useCallback(
    (newPage: number) => {
      const safePage = Math.max(1, Math.min(newPage, totalPages));
      if (safePage !== currentPage) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", safePage.toString());

        // setSearchParams({ page: safePage.toString() });
        setSearchParams(newParams);
      }
    },
    [currentPage, totalPages, searchParams, setSearchParams]
  );

  const getVisiblePages = useCallback(() => {
    if (totalPages <= 1) return [1];

    const delta = 2; // Pages before/after current
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);

    if (end - start + 1 < 5) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <>
      <HStack spacing={2} w="full" my={3} py={2} justify="center">
        {/* First */}
        {currentPage > 1 && (
          <Button onClick={() => handlePageChange(1)}>{"<<"}</Button>
        )}

        {/* Previous */}
        {currentPage > 1 && (
          <Button onClick={() => handlePageChange(currentPage - 1)}>
            {"<"}
          </Button>
        )}

        {/* Visible pages */}
        {getVisiblePages().map((p) => (
          <Button
            key={p}
            onClick={() => handlePageChange(p)}
            variant={p === currentPage ? "solid" : "outline"}
            isDisabled={isLoading}
          >
            {p}
          </Button>
        ))}

        {/* Next */}
        {currentPage < totalPages && (
          <Button onClick={() => handlePageChange(currentPage + 1)}>
            {">"}
          </Button>
        )}

        {/* Last */}
        {currentPage < totalPages && (
          <Button onClick={() => handlePageChange(totalPages)}>{">>"}</Button>
        )}
      </HStack>
    </>
  );
}

export default Pagination;
