import { Button, IconButton } from "@chakra-ui/react";
import { IoMdDownload } from "react-icons/io";
import apiClient from "../../services/api-client";

interface Props {
  endpoint: string;
  filename: string;
}

function ExcelDownloadButton({ endpoint, filename = "export.xlsx" }: Props) {
  const handleDownload = (endpoint: string) => {
    apiClient
      .get(endpoint, { responseType: "blob" })
      .then((res) => {
        const blob = res.data;

        const url = window.URL.createObjectURL(blob);
        const aTag = document.createElement("a");
        aTag.href = url;
        aTag.setAttribute("download", filename);

        document.body.appendChild(aTag);
        aTag.click();

        // Cleanup
        document.body.removeChild(aTag);
        window.URL.revokeObjectURL(url);

        console.log("Excel file download triggered!");
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  return (
    <>
      <IconButton
        icon={<IoMdDownload />}
        variant={"ghost"}
        borderRadius={"full"}
        onClick={() => {
          handleDownload(endpoint);
        }}
        aria-label={"Download"}
      />
    </>
  );
}

export default ExcelDownloadButton;
