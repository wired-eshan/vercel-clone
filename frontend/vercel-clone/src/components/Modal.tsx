import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface modalPropsType {
  children: React.ReactNode;
  title?: string;
  description?: string;
  primaryBtn?: string;
  primaryBtnVariant? : "link" | "default" | "destructive" | "outline" | "secondary" | "ghost",
  secondaryBtn?: string;
  onConfirm?: () => void;
}

const Modal: React.FC<modalPropsType> = ({
  children,
  title = "Confirm Action",
  description,
  primaryBtn = "Confirm",
  primaryBtnVariant = "default",
  secondaryBtn = "Cancel",
  onConfirm,
}) => {
  return (
    <>
      <Dialog>
        <DialogTrigger className="flex justify-between items-center w-full cursor-pointer">{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="submit"
              variant={primaryBtnVariant || "default"}
              onClick={onConfirm}
            >
              {primaryBtn}
            </Button>
            <DialogClose asChild>
              <Button
                className="cursor-pointer"
                type="button"
                variant="secondary"
              >
                {secondaryBtn}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Modal;
