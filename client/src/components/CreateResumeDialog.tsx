import { useState } from "react";
import { useCreateResume } from "@/hooks/use-resumes";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

export function CreateResumeDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateResume();
  const [, setLocation] = useLocation();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    mutate(
      {
        title,
        content: {
          personalInfo: {},
          experience: [],
          education: [],
          skills: [],
          summary: "",
        },
      },
      {
        onSuccess: (data) => {
          setOpen(false);
          setLocation(`/resume/${data.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Create New Resume
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Give your resume a name to get started. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              placeholder="e.g. Software Engineer 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create & Start Editing
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
