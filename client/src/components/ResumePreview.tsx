import { forwardRef } from "react";
import { type ResumeContent } from "@shared/schema";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  content: ResumeContent;
  className?: string;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ content, className }, ref) => {
    // A4 ratio: 210mm x 297mm approx 1:1.41
    return (
      <div 
        ref={ref}
        id="resume-preview"
        className={cn(
          "bg-white text-slate-800 shadow-2xl mx-auto p-[10mm]",
          "w-full max-w-[210mm] min-h-[297mm] h-fit",
          "resume-paper leading-relaxed",
          className
        )}
      >
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6 mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-widest text-slate-900 mb-2 font-display">
            {content.personalInfo?.fullName || "Your Name"}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-3 font-sans">
            {content.personalInfo?.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{content.personalInfo.email}</span>
              </div>
            )}
            {content.personalInfo?.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                <span>{content.personalInfo.phone}</span>
              </div>
            )}
            {content.personalInfo?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{content.personalInfo.location}</span>
              </div>
            )}
            {content.personalInfo?.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>{content.personalInfo.website}</span>
              </div>
            )}
            {content.personalInfo?.linkedin && (
              <div className="flex items-center gap-1.5">
                <Linkedin className="w-4 h-4" />
                <span>{content.personalInfo.linkedin}</span>
              </div>
            )}
          </div>
        </header>

        <div className="space-y-8">
          {/* Summary */}
          {content.summary && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 font-display">
                Professional Summary
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap">{content.summary}</p>
            </section>
          )}

          {/* Experience */}
          {content.experience && content.experience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-4 font-display">
                Experience
              </h2>
              <div className="space-y-6">
                {content.experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-lg font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-sm font-sans text-slate-500 whitespace-nowrap">
                        {exp.startDate} – {exp.endDate}
                      </span>
                    </div>
                    <div className="text-md font-semibold text-slate-700 mb-2">
                      {exp.company}
                    </div>
                    <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {exp.description}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {content.education && content.education.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-4 font-display">
                Education
              </h2>
              <div className="space-y-4">
                {content.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start break-inside-avoid">
                    <div>
                      <h3 className="font-bold text-slate-900">{edu.school}</h3>
                      <div className="text-slate-700">{edu.degree}</div>
                    </div>
                    <span className="text-sm font-sans text-slate-500">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {content.skills && content.skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3 font-display">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {content.skills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="bg-slate-100 text-slate-800 px-3 py-1 rounded text-sm font-sans print:bg-transparent print:p-0 print:border print:border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
