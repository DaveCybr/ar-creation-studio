// src/components/DeleteProjectDialog.tsx
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  projectName: string;
}

export function DeleteProjectDialog({
  isOpen,
  onClose,
  onConfirm,
  projectName,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmText("");
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === "delete";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="glass border-destructive/50">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-left">
              Hapus Proyek?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            Anda akan menghapus proyek{" "}
            <strong className="text-foreground">"{projectName}"</strong>.
            Tindakan ini tidak dapat dibatalkan dan akan menghapus:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Semua file yang terupload</li>
              <li>QR Code dan short link</li>
              <li>Data analytics</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 my-4">
          <Label htmlFor="confirm" className="text-sm">
            Ketik{" "}
            <span className="font-mono font-bold text-foreground">DELETE</span>{" "}
            untuk konfirmasi
          </Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="bg-muted/50 border-border/50"
            disabled={isDeleting}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus Proyek"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
