import { useResumes, useDeleteResume } from "@/hooks/use-resumes";
import { CreateResumeDialog } from "@/components/CreateResumeDialog";
import { Link } from "wouter";
import { FileText, MoreVertical, Trash2, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: resumes, isLoading, error } = useResumes();
  const deleteResume = useDeleteResume();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        Error loading resumes. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-display text-lg">
              R
            </div>
            <span className="font-display font-bold text-xl tracking-tight">ResuMate</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">My Resumes</h1>
            <p className="text-slate-500 text-lg">Manage and organize your professional profiles.</p>
          </div>
          <CreateResumeDialog />
        </div>

        {resumes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No resumes yet</h3>
            <p className="text-slate-500 mb-6">Create your first professional resume today.</p>
            <CreateResumeDialog />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes?.map((resume) => (
              <div 
                key={resume.id}
                className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteResume.mutate(resume.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Link href={`/resume/${resume.id}`} className="block flex-1 group-hover:cursor-pointer">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {resume.title}
                  </h3>
                  <div className="flex items-center text-sm text-slate-500 mt-auto">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last edited {resume.createdAt ? format(new Date(resume.createdAt), 'MMM d, yyyy') : 'Recently'}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
