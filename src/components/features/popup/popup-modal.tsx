'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { dismissPopup } from '@/app/actions/popup-actions';
import { markdownToHtml } from '@/lib/markdown';
import type { PopupContent } from '@/lib/popup';

interface PopupModalProps {
  content: PopupContent;
  initialOpen: boolean;
}

export function PopupModal({ content, initialOpen }: PopupModalProps) {
  const [open, setOpen] = useState(initialOpen);
  const [contentHtml, setContentHtml] = useState('');

  useEffect(() => {
    // Convert markdown content to HTML when component mounts
    const convertContent = async () => {
      try {
        const html = await markdownToHtml(content.content, { removeH1: true });
        setContentHtml(html);
      } catch (error) {
        console.error('Error converting markdown:', error);
      }
    };

    convertContent();
  }, [content.content]);

  const handleDismiss = async (permanent: boolean = false) => {
    setOpen(false);

    if (permanent) {
      try {
        await dismissPopup(content.version);
      } catch (error) {
        console.error('Error dismissing popup:', error);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
        </DialogHeader>

        <DialogDescription asChild>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </DialogDescription>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => handleDismiss(false)}>
            Close
          </Button>
          <Button onClick={() => handleDismiss(true)}>Don't show again</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
