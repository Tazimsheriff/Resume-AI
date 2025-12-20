import { useEffect, useState, useCallback, useRef } from "react";
import { useRoute, Link } from "wouter";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { ResumeForm } from "@/components/ResumeForm";
import { ResumePreview } from "@/components/ResumePreview";
import { type ResumeContent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Printer,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Editor() {
  const [, params] = useRoute("/resume/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: resume, isLoading, error } = useResume(id);
  const updateResume = useUpdateResume();
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize local state when data loads
  useEffect(() => {
    if (resume?.content) {
      // @ts-ignore - jsonb typing
      setContent(resume.content);
    }
  }, [resume]);

  const handleUpdate = useCallback((newContent: ResumeContent) => {
    setContent(newContent);
    // Debounce save would happen here, but we'll rely on explicit save or blur for MVP simplicity in form
    updateResume.mutate({ id, content: newContent });
  }, [id, updateResume]);

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;

    try {
      toast({ title: "Generating PDF...", description: "This may take a moment." });
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume?.title || "resume"}.pdf`);
      
      toast({ title: "Downloaded", description: "Your PDF is ready." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Resume not found</h2>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="font-semibold text-lg text-slate-900 truncate max-w-[200px] md:max-w-md">
            {resume.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Toggle */}
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden"
            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          >
            {showPreviewMobile ? (
              <>
                <PanelLeftOpen className="w-4 h-4 mr-2" /> Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" /> Preview
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()}
            className="hidden sm:flex"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          
          <Button 
            onClick={handleDownloadPdf}
            className="bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Panel */}
        <div className={cn(
          "flex-1 overflow-y-auto p-6 bg-slate-50 md:max-w-[500px] lg:max-w-[600px] border-r border-slate-200",
          showPreviewMobile ? "hidden md:block" : "block"
        )}>
          {content && (
            <ResumeForm 
              initialData={content} 
              onUpdate={handleUpdate} 
              isSaving={updateResume.isPending} 
            />
          )}
        </div>

        {/* Preview Panel */}
        <div className={cn(
          "flex-1 bg-slate-100 overflow-y-auto p-8 md:p-12 flex justify-center items-start",
          showPreviewMobile ? "block" : "hidden md:flex"
        )}>
          {content && (
            <ResumePreview 
              ref={previewRef} 
              content={content} 
              className="shadow-2xl origin-top transition-transform duration-300 print:shadow-none" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
