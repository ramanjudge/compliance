'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function LegalDisclaimer() {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasAccepted = localStorage.getItem('legal_disclaimer_accepted');
    if (!hasAccepted) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('legal_disclaimer_accepted', 'true');
    setOpen(false);
  };

  if (!isMounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Important Legal Notice</DialogTitle>
          <DialogDescription className="pt-4 text-base leading-relaxed text-foreground/80">
            The information provided on this portal is for general guidance and educational purposes only and does not constitute legal or professional advice. 
            While we strive to keep information up to date, minimum wage rules frequently change. Always verify with official government gazettes or consult a legal professional.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end mt-4">
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            I Understand and Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
