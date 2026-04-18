import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  files: File[];
  setFiles: (files: File[]) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  loading: boolean;
  error: string | null;
  submitScreening: () => Promise<void>;
}

export function UploadZone({ files, setFiles, jobDescription, setJobDescription, loading, error, submitScreening }: UploadZoneProps): JSX.Element {
  const onDrop = (acceptedFiles: File[]): void => {
    const newFiles = acceptedFiles.filter((f) => !files.some((e) => e.name === f.name));
    setFiles([...files, ...newFiles]);
  };
  const removeFile = (name: string): void => setFiles(files.filter((f) => f.name !== name));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const disabled = files.length === 0 || !jobDescription.trim() || loading;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Drop Zone */}
      <div>
        <p className="section-label">Resume Upload</p>
        <div {...getRootProps()} id="resume-dropzone" className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          <div className="dropzone-icon">
            <UploadCloud size={24} strokeWidth={1.5} />
          </div>
          <p className="dropzone-text">
            {isDragActive ? "Release to upload resumes..." : "Drag & drop PDF resumes, or click to browse"}
          </p>
          <p className="dropzone-sub">PDF files only · Multiple supported</p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <p className="section-label">{files.length} File{files.length !== 1 ? "s" : ""} Queued</p>
            <div className="file-list">
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${file.size}`}
                  className="file-item"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="file-icon"><FileText size={16} strokeWidth={1.5} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="file-name">{file.name}</p>
                    <div className="shimmer" />
                  </div>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <CheckCircle2 size={16} strokeWidth={2} style={{ color: "var(--emerald)", flexShrink: 0 }} />
                  <button type="button" className="file-remove" onClick={(e) => { e.stopPropagation(); removeFile(file.name); }} aria-label={`Remove ${file.name}`}>
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Description */}
      <div>
        <p className="section-label">Job Description</p>
        <textarea
          id="job-description"
          className="job-textarea"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          placeholder="Describe the ideal candidate — required skills, experience level, responsibilities..."
        />
      </div>

      {/* CTA */}
      <button id="start-screening-btn" type="button" className="btn-cta" disabled={disabled} onClick={() => void submitScreening()}>
        {loading ? (
          <><Loader2 size={16} className="spin" /> Analyzing Resumes...</>
        ) : (
          <><span>⚡</span> Start AI Screening</>
        )}
      </button>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div className="error-box" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span>⚠</span><span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
