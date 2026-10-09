import React, { useState } from 'react';
import { StudyModule, StudyPhase, ModulePdfGuide } from '../../types/study';
import { getGuideForModule } from '../../data/moduleGuides';
import {
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  BookOpen,
  Sparkles,
  Info,
} from 'lucide-react';

interface ModulePdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  module: StudyModule | null;
  phase: StudyPhase | null;
}

export const ModulePdfViewerModal: React.FC<ModulePdfViewerModalProps> = ({
  isOpen,
  onClose,
  module,
  phase,
}) => {
  if (!isOpen || !module) return null;

  const [guide, setGuide] = useState<ModulePdfGuide>(() => {
    return module.pdfGuide || getGuideForModule(module.id, module.title, module.topics);
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [customPdfBlobUrl, setCustomPdfBlobUrl] = useState<string | null>(null);

  const totalPages = guide.pages.length || 1;
  const activePageData = guide.pages.find((p) => p.pageNumber === currentPage) || guide.pages[0];

  const handleCopy = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(snippet);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleUploadCustomPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setCustomPdfBlobUrl(url);
    } else {
      // If it's a text/markdown file, read and insert as a custom page
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setGuide((prev) => ({
            ...prev,
            pages: [
              ...prev.pages,
              {
                pageNumber: prev.pages.length + 1,
                title: `Documento Adjunto: ${file.name}`,
                sections: [
                  {
                    heading: file.name,
                    content: text.slice(0, 3000),
                  },
                ],
              },
            ],
            totalPages: prev.pages.length + 1,
          }));
          setCurrentPage(guide.pages.length + 1);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadGuide = () => {
    let docText = `${guide.title}\n${'='.repeat(guide.title.length)}\n`;
    docText += `Autor: ${guide.author}\nMódulo: ${module.title}\nFase: ${phase?.title || 'General'}\n\n`;
    docText += `Resumen:\n${guide.summary}\n\n`;

    guide.pages.forEach((page) => {
      docText += `\n--- PÁGINA ${page.pageNumber}: ${page.title} ---\n\n`;
      page.sections.forEach((sec) => {
        docText += `### ${sec.heading}\n${sec.content}\n\n`;
        if (sec.bulletPoints) {
          sec.bulletPoints.forEach((bp) => {
            docText += `* ${bp}\n`;
          });
          docText += '\n';
        }
        if (sec.codeSnippet) {
          docText += `\`\`\`\n${sec.codeSnippet}\n\`\`\`\n\n`;
        }
      });
    });

    const blob = new Blob([docText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guia-${module.id}-${module.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#181a22] border border-[#282d3b] rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[92vh] max-h-[880px]'
        }`}
      >
        {/* Modal Top Bar */}
        <div className="bg-[#14161f] border-b border-[#252834] px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-semibold text-indigo-300 uppercase tracking-wide">
                  {phase ? `Fase ${phase.phaseNumber}` : 'Módulo Técnico'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{module.title}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100 truncate">
                {guide.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Upload PDF */}
            <label
              title="Cargar mi propio archivo PDF para este módulo"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1f222d] hover:bg-[#272b38] border border-[#2d3242] rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Cargar mi PDF</span>
              <input
                type="file"
                accept=".pdf,.md,.txt"
                onChange={handleUploadCustomPdf}
                className="hidden"
              />
            </label>

            {/* Download MD / Text */}
            <button
              type="button"
              onClick={handleDownloadGuide}
              title="Descargar guía en formato Markdown"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#1f222d] hover:bg-[#272b38] border border-[#2d3242] rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Descargar Guía</span>
            </button>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232735] rounded-lg transition-colors"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232735] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls (Pages & Zoom) */}
        <div className="bg-[#191c26] border-b border-[#252834] px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
          {/* Page navigation */}
          {!customPdfBlobUrl && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-md bg-[#222634] hover:bg-[#2a2f40] disabled:opacity-40 disabled:hover:bg-[#222634] text-slate-200 transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="tabular-nums font-medium text-slate-300">
                Página <strong className="text-white">{currentPage}</strong> de {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-md bg-[#222634] hover:bg-[#2a2f40] disabled:opacity-40 disabled:hover:bg-[#222634] text-slate-200 transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {customPdfBlobUrl && (
            <div className="flex items-center gap-2 text-indigo-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Visor PDF Personalizado Cargado</span>
              <button
                type="button"
                onClick={() => setCustomPdfBlobUrl(null)}
                className="text-xs text-slate-400 hover:text-white underline ml-2"
              >
                Volver a la Guía Oficial
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              disabled={zoomLevel <= 75}
              className="p-1 rounded-md bg-[#222634] hover:bg-[#2a2f40] disabled:opacity-40 text-slate-200 transition-colors"
              title="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="tabular-nums font-medium w-12 text-center text-slate-300">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              disabled={zoomLevel >= 150}
              className="p-1 rounded-md bg-[#222634] hover:bg-[#2a2f40] disabled:opacity-40 text-slate-200 transition-colors"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#222634]"
            >
              100%
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="flex-1 overflow-y-auto bg-[#11131a] p-4 sm:p-8 flex justify-center">
          {customPdfBlobUrl ? (
            <div className="w-full h-full max-w-4xl bg-[#181a22] rounded-xl overflow-hidden border border-[#272b38] shadow-lg">
              <iframe
                src={customPdfBlobUrl}
                title="Documento PDF Cargado"
                className="w-full h-full min-h-[500px] border-none"
              />
            </div>
          ) : (
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-3xl transition-transform duration-150"
            >
              {/* PDF Sheet Simulation (Matte Dark Paper with Slate Tones) */}
              <div className="bg-[#181b24] border border-[#292e3c] rounded-xl p-8 sm:p-12 shadow-xl space-y-8 min-h-[680px] text-slate-200">
                {/* PDF Page Header */}
                <div className="border-b border-[#292e3c] pb-5 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-400 tracking-wider uppercase block mb-1">
                      {guide.author} · Carrera de IA y Automatización
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                      {activePageData?.title || guide.title}
                    </h1>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 font-medium block">Pág. {currentPage} / {totalPages}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">DOC-ID: {module.id}</span>
                  </div>
                </div>

                {/* Page 1 Summary Callout */}
                {currentPage === 1 && guide.summary && (
                  <div className="p-4 bg-[#1e2230] border-l-4 border-indigo-500 rounded-r-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Objetivo Formativo del Módulo</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>
                )}

                {/* Page Sections */}
                <div className="space-y-7">
                  {activePageData?.sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block" />
                        {section.heading}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {section.content}
                      </p>

                      {/* Bullet points */}
                      {section.bulletPoints && section.bulletPoints.length > 0 && (
                        <ul className="space-y-2 pl-2">
                          {section.bulletPoints.map((bp, bpIdx) => (
                            <li key={bpIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Callout box */}
                      {section.callout && (
                        <div className="p-3.5 bg-[#202534] border border-[#2e3447] rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{section.callout}</span>
                        </div>
                      )}

                      {/* Code Snippet with syntax style and copy */}
                      {section.codeSnippet && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-[#2b3040] bg-[#12141c]">
                          <div className="bg-[#161822] px-3.5 py-1.5 border-b border-[#242836] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>Código Fuente / Configuración</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(section.codeSnippet!)}
                              className="inline-flex items-center gap-1 hover:text-white transition-colors"
                            >
                              {copiedSnippet === section.codeSnippet ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                            <code>{section.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer of PDF page */}
                <div className="border-t border-[#292e3c] pt-5 mt-10 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Material oficial para el módulo: {module.title}</span>
                  </div>
                  <span>Página {currentPage} de {totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
