import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeContentSchema, type ResumeContent } from "@shared/schema";
import { useAiSuggestion } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wand2, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeFormProps {
  initialData: ResumeContent;
  onUpdate: (data: ResumeContent) => void;
  isSaving: boolean;
}

export function ResumeForm({ initialData, onUpdate, isSaving }: ResumeFormProps) {
  const { register, control, handleSubmit, watch, setValue } = useForm<ResumeContent>({
    resolver: zodResolver(resumeContentSchema),
    defaultValues: initialData,
  });

  // Watch for changes to trigger updates
  useEffect(() => {
    const subscription = watch((value) => {
      // Debounce could be added here, but parent likely handles throttle/debounce
      if (value) {
         // @ts-ignore - rhf types are tricky with partial updates
         onUpdate(value as ResumeContent);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education",
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "skills" as any, // Simple array of strings
  });

  return (
    <form className="space-y-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold text-foreground">Edit Resume</h2>
        {isSaving && (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </span>
        )}
      </div>

      <Accordion type="single" collapsible defaultValue="personal" className="w-full">
        {/* Personal Info */}
        <AccordionItem value="personal">
          <AccordionTrigger className="font-display font-semibold text-lg">Personal Information</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...register("personalInfo.fullName")} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input {...register("personalInfo.email")} placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register("personalInfo.phone")} placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...register("personalInfo.location")} placeholder="New York, NY" />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input {...register("personalInfo.linkedin")} placeholder="linkedin.com/in/jane" />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input {...register("personalInfo.website")} placeholder="janedoe.com" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Summary */}
        <AccordionItem value="summary">
          <AccordionTrigger className="font-display font-semibold text-lg">Professional Summary</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Bio</Label>
                <AiSuggestButton 
                  currentText={watch("summary") || ""} 
                  onApply={(text) => setValue("summary", text)} 
                  field="professional summary"
                />
              </div>
              <Textarea 
                {...register("summary")} 
                className="h-32 leading-relaxed" 
                placeholder="Experienced software engineer with a passion for..." 
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Experience */}
        <AccordionItem value="experience">
          <AccordionTrigger className="font-display font-semibold text-lg">Experience</AccordionTrigger>
          <AccordionContent className="pt-2 space-y-4">
            <AnimatePresence>
              {expFields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border rounded-xl bg-card space-y-4 relative group"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeExp(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input {...register(`experience.${index}.company`)} placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input {...register(`experience.${index}.position`)} placeholder="Senior Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input {...register(`experience.${index}.startDate`)} placeholder="Jan 2020" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input {...register(`experience.${index}.endDate`)} placeholder="Present" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Description</Label>
                      <AiSuggestButton 
                        currentText={watch(`experience.${index}.description`) || ""} 
                        onApply={(text) => setValue(`experience.${index}.description`, text)} 
                        field="job description"
                      />
                    </div>
                    <Textarea 
                      {...register(`experience.${index}.description`)} 
                      className="h-32" 
                      placeholder="• Led a team of 5 developers..." 
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => appendExp({ 
                id: crypto.randomUUID(), 
                company: "", 
                position: "", 
                startDate: "", 
                endDate: "", 
                description: "" 
              })}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Education */}
        <AccordionItem value="education">
          <AccordionTrigger className="font-display font-semibold text-lg">Education</AccordionTrigger>
          <AccordionContent className="pt-2 space-y-4">
            <AnimatePresence>
              {eduFields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border rounded-xl bg-card space-y-4 relative group"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeEdu(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>School</Label>
                      <Input {...register(`education.${index}.school`)} placeholder="University of Tech" />
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input {...register(`education.${index}.degree`)} placeholder="BS Computer Science" />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input {...register(`education.${index}.year`)} placeholder="2019" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => appendEdu({ 
                id: crypto.randomUUID(), 
                school: "", 
                degree: "", 
                year: "" 
              })}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem value="skills">
          <AccordionTrigger className="font-display font-semibold text-lg">Skills</AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {skillFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input 
                      {...register(`skills.${index}` as const)} 
                      placeholder="Skill name" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSkill(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => appendSkill("New Skill")}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </form>
  );
}

function AiSuggestButton({ currentText, onApply, field }: { currentText: string, onApply: (t: string) => void, field: string }) {
  const { mutate, isPending } = useAiSuggestion();
  const { toast } = useToast();

  const handleSuggest = () => {
    mutate(
      { field, currentText, context: "Make it more professional and impactful." },
      {
        onSuccess: (data) => {
          onApply(data.suggestion);
          toast({ title: "Enhanced!", description: "AI suggestion applied." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to get AI suggestion", variant: "destructive" });
        }
      }
    );
  };

  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="sm" 
      onClick={handleSuggest} 
      disabled={isPending}
      className="text-accent hover:text-accent/80 hover:bg-accent/10"
    >
      {isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
      {isPending ? "Enhancing..." : "Enhance with AI"}
    </Button>
  );
}
