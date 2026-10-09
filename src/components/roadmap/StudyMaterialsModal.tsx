import React, { useState } from 'react';
import { StudyMaterial, StudyPhase } from '../../types/study';
import { StorageService } from '../../services/storageService';
import {
  X,
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Tag,
  ExternalLink,
  Upload,
  Calendar,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface StudyMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmapId: string;
  phases: StudyPhase[];
  onOpenPdfViewerForMaterial?: (material: StudyMaterial) => void;
}

export const StudyMaterialsModal: React.FC<StudyMaterialsModalProps> = ({
  isOpen,
  onClose,
  roadmapId,
  phases,
  onOpenPdfViewerForMaterial,
}) => {
  if (!isOpen) return null;

  const [materials, setMaterials] = useState<StudyMaterial[]>(() =>
    StorageService.getStudyMaterials(roadmapId)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Material Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<StudyMaterial['type']>('PDF');
  const [newPhaseId, setNewPhaseId] = useState<string>('');
  const [newModuleId, setNewModuleId] = useState<string>('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedFileData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const created: StudyMaterial = {
      id: `mat-${Date.now()}`,
      roadmapId,
      phaseId: newPhaseId || undefined,
      moduleId: newModuleId || undefined,
      title: newTitle.trim(),
      type: newType,
      description: newDescription.trim(),
      url: newUrl.trim() || undefined,
      fileData: uploadedFileData || undefined,
      fileName: uploadedFileName || undefined,
      tags: parsedTags.length > 0 ? parsedTags : ['Autodidacta', newType],
      createdAt: new Date().toISOString(),
      author: 'Estudiante / Personalizado',
    };

    StorageService.addStudyMaterial(created);
    setMaterials(StorageService.getStudyMaterials(roadmapId));

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewUrl('');
    setNewTags('');
    setUploadedFileName(null);
    setUploadedFileData(null);
    setIsAddingNew(false);
  };

  const handleDeleteMaterial = (id: string) => {
    StorageService.deleteStudyMaterial(id);
    setMaterials(StorageService.getStudyMaterials(roadmapId));
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPhase =
      selectedPhaseFilter === 'all' ||
      m.phaseId === selectedPhaseFilter;

    const matchesType =
      selectedTypeFilter === 'all' || m.type === selectedTypeFilter;

    return matchesSearch && matchesPhase && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#181a22] border border-[#282d3b] rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl h-[90vh] max-h-[820px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#14161f] border-b border-[#252834] p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Gestor & Repositorio de Materiales de Estudio</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">
              Biblioteca Extensible de Recursos y Documentación
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Accede a guías oficiales o agrega tus propios PDFs, apuntes, notebooks y lecturas para cualquier fase o módulo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'Ver Listado' : 'Agregar Material'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[#232735] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#13151c]">
          {isAddingNew ? (
            /* Add Material Form */
            <form onSubmit={handleCreateMaterial} className="p-6 bg-[#181a24] border border-[#272b38] rounded-xl space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#262a36] pb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Nuevo Material de Estudio</span>
                </h3>
                <span className="text-xs text-slate-400">Persistente en tu navegador</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Título del Material *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Guía Práctica de LangGraph & ReAct"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#303546] bg-[#12141c] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tipo de Recurso
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as StudyMaterial['type'])}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#303546] bg-[#12141c] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PDF">Documento PDF</option>
                    <option value="Guía">Guía Técnica / Markdown</option>
                    <option value="Cheatsheet">Hoja de Trucos / Cheatsheet</option>
                    <option value="Código">Código / Repositorio / Notebook</option>
                    <option value="Video">Video / Masterclass</option>
                    <option value="Enlace">Enlace Web / Documentación</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Vincular a Fase (Opcional)
                  </label>
                  <select
                    value={newPhaseId}
                    onChange={(e) => setNewPhaseId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#303546] bg-[#12141c] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">General (Todo el plan)</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        Fase {p.phaseNumber}: {p.title.replace(/^Fase \d+:\s*/, '')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descripción o Notas Clave
                </label>
                <textarea
                  rows={3}
                  placeholder="Breve resumen del contenido y cuándo revisarlo..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#303546] bg-[#12141c] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Enlace URL o Web
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.langchain.com/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#303546] bg-[#12141c] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="LangGraph, RAG, pgvector"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#303546] bg-[#12141c] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Upload local file */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cargar Archivo Local (PDF / Texto)
                </label>
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[#343b4f] hover:border-indigo-500/50 rounded-xl cursor-pointer bg-[#14161f] hover:bg-[#1a1c27] transition-colors">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-slate-300">
                    {uploadedFileName ? `Archivo cargado: ${uploadedFileName}` : 'Seleccionar PDF o documento de lectura'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.md,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#262a36]">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
                >
                  Guardar Material
                </button>
              </div>
            </form>
          ) : (
            /* Materials List View */
            <>
              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar por tema o etiqueta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#2e3342] bg-[#181a24] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <select
                    value={selectedPhaseFilter}
                    onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#2e3342] bg-[#181a24] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Todas las Fases (0 a 5)</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        Fase {p.phaseNumber}: {p.title.replace(/^Fase \d+:\s*/, '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#2e3342] bg-[#181a24] text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Todos los Tipos</option>
                    <option value="PDF">PDF</option>
                    <option value="Guía">Guía Técnica</option>
                    <option value="Cheatsheet">Cheatsheet</option>
                    <option value="Código">Código</option>
                    <option value="Video">Video</option>
                    <option value="Enlace">Enlace</option>
                  </select>
                </div>
              </div>

              {/* Grid of Materials */}
              {filteredMaterials.length === 0 ? (
                <div className="text-center py-12 bg-[#181a24] border border-[#272b38] rounded-xl p-8">
                  <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    No se encontraron materiales para este filtro.
                  </p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Puedes agregar nuevos recursos de estudio usando el botón superior.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Primer Material</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMaterials.map((mat) => {
                    const phaseObj = phases.find((p) => p.id === mat.phaseId);

                    return (
                      <div
                        key={mat.id}
                        className="p-4 bg-[#181a24] border border-[#272b38] rounded-xl flex flex-col justify-between space-y-3 hover:border-[#353b4d] transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {mat.type}
                            </span>
                            {phaseObj ? (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Fase {phaseObj.phaseNumber}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                General
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-100 leading-snug">
                            {mat.title}
                          </h4>

                          {mat.description && (
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                              {mat.description}
                            </p>
                          )}

                          {mat.tags && mat.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {mat.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#222634] text-slate-300 border border-[#2d3242]"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#252834] flex items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] text-slate-500">
                            {mat.author || 'Biblioteca'}
                          </span>

                          <div className="flex items-center gap-2">
                            {mat.url && (
                              <a
                                href={mat.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-300 hover:underline"
                              >
                                <span>Abrir enlace</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}

                            {onOpenPdfViewerForMaterial && (mat.type === 'PDF' || mat.type === 'Guía') && (
                              <button
                                type="button"
                                onClick={() => onOpenPdfViewerForMaterial(mat)}
                                className="px-2.5 py-1 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                              >
                                Ver en Visor
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(mat.id)}
                              className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                              title="Eliminar este material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
