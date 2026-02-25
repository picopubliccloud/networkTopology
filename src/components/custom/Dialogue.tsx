import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cancelRef: React.MutableRefObject<HTMLButtonElement | null>;
  title: string;
  body: string;
  btnText: string;
  btnColor: string;
  onConfirm: () => void;
}

function Dialogue({
  isOpen,
  onClose,
  cancelRef,
  title,
  body,
  btnText,
  btnColor,
  onConfirm,
}: Props) {
  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {title}
            </AlertDialogHeader>

            <AlertDialogBody>{body}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme={btnColor}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                ml={3}
              >
                {btnText}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default Dialogue;
