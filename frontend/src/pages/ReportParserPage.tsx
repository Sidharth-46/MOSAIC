import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, File as FileIcon, X, CheckCircle, AlertTriangle, ChevronRight, Loader2, Save } from 'lucide-react'
import { PageHeader, Badge } from '@/components/common/PageElements'
import { useMisc } from '@/data/misc'
import { cn } from '@/lib/utils'

export default function ReportParserPage() {
  const { dummyReportEntities } = useMisc()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [entities, setEntities] = useState<any[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (selectedFile: File) => {
    setFile(selectedFile)
    setEntities(null)
    setIsParsing(true)
    
    // Simulate parsing delay
    setTimeout(() => {
      setEntities(dummyReportEntities)
      setIsParsing(false)
    }, 2500)
  }

  const clearFile = () => {
    setFile(null)
    setEntities(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="FIR Intelligence Parser"
        description="Extract structured intelligence entities from raw text, PDFs, or scanned documents"
        icon={FileText}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upload Area */}
        <div className="space-y-4">
          <div 
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative overflow-hidden glass-card",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border/60 hover:border-primary/50",
              file && "border-primary/30"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Scan line effect when parsing */}
            {isParsing && <div className="absolute inset-0 scan-line pointer-events-none opacity-50" />}

            {file ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 relative">
                  {isParsing ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <FileIcon className="w-8 h-8 text-primary" />
                  )}
                  {entities && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="text-base font-semibold text-foreground mb-1 max-w-[250px] truncate">{file.name}</h4>
                <p className="text-xs text-muted-foreground mb-6">
                  {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={clearFile}
                    disabled={isParsing}
                    className="px-4 py-2 rounded-lg border border-border/50 text-sm font-medium hover:bg-secondary/60 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {!entities && !isParsing && (
                    <button 
                      onClick={() => processFile(file)}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Extract Entities
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full bg-secondary/60 border border-border flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-base font-semibold text-foreground mb-2">Drag & drop report file here</h4>
                <p className="text-sm text-muted-foreground mb-6">Supports PDF, DOCX, TXT, or Image files (Max 10MB)</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,image/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-lg bg-secondary/80 text-foreground text-sm font-medium hover:bg-secondary border border-border transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-secondary/20 border border-border/30 rounded-xl p-4">
            <h5 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Processing Guidelines
            </h5>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Handwritten FIRs may require manual review post-extraction due to OCR limitations.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Ensure uploaded documents do not contain highly classified informant identities.
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Entities with confidence scores below 80% are flagged for manual verification.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Extracted Entities */}
        <div className="glass-card rounded-xl border border-border/50 flex flex-col h-[600px]">
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-base font-semibold">Extracted Entities</h3>
            {entities && <Badge variant="success">{entities.length} Found</Badge>}
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {isParsing ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm animate-pulse">Running NLP entity extraction model...</p>
              </div>
            ) : entities ? (
              <div className="space-y-4">
                {entities.map((entity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{entity.type}</span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className={cn(
                          entity.confidence >= 0.9 ? "text-green-400" : entity.confidence >= 0.8 ? "text-yellow-400" : "text-red-400"
                        )}>
                          {(entity.confidence * 100).toFixed(1)}% Match
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg border bg-secondary/20 transition-colors",
                      entity.confidence < 0.8 ? "border-yellow-500/30" : "border-border/50 group-hover:border-primary/30"
                    )}>
                      <input 
                        type="text" 
                        defaultValue={entity.value} 
                        className="w-full bg-transparent border-none outline-none text-sm text-foreground"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center space-y-3">
                <FileText className="w-12 h-12 opacity-20" />
                <div>
                  <p className="text-sm font-medium">No Data Extracted</p>
                  <p className="text-xs opacity-70">Upload a report to see structured entities here.</p>
                </div>
              </div>
            )}
          </div>

          {entities && (
            <div className="p-4 border-t border-border/50 bg-secondary/10">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Save className="w-4 h-4" />
                Save to Database
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
