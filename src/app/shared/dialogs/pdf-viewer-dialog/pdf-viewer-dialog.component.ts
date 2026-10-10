import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudyModule, ModulePdfGuide } from '../../../core/models/study.models';
import { MODULE_PDF_GUIDES } from '../../../core/data/module-guides';

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-viewer-dialog.component.html',
})
export class PdfViewerDialogComponent {
  readonly module = input<StudyModule | null>(null);
  readonly close = output<void>();

  readonly currentPage = signal<number>(1);
  readonly zoomLevel = signal<number>(100);
  readonly copiedSnippet = signal<string | null>(null);

  get guide(): ModulePdfGuide {
    const mod = this.module();
    if (!mod) {
      return {
        title: 'Guía Técnica',
        totalPages: 1,
        author: 'Facultad Técnica',
        summary: 'Guía de estudio estructurada.',
        pages: [],
      };
    }
    return (
      mod.pdfGuide ||
      MODULE_PDF_GUIDES[mod.id] || {
        title: `Guía Técnica: ${mod.title}`,
        totalPages: 1,
        author: 'Facultad de IA y Automatización',
        summary: mod.description,
        pages: [
          {
            pageNumber: 1,
            title: 'Conceptos Esenciales y Objetivos de Aprendizaje',
            sections: [
              {
                heading: 'Fundamentos de la Unidad',
                content: mod.description,
                bulletPoints: mod.topics,
              },
            ],
          },
        ],
      }
    );
  }

  get activePage() {
    return this.guide.pages.find((p) => p.pageNumber === this.currentPage()) || this.guide.pages[0];
  }

  nextPage(): void {
    if (this.currentPage() < this.guide.pages.length) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  zoomIn(): void {
    this.zoomLevel.update((z) => Math.min(150, z + 15));
  }

  zoomOut(): void {
    this.zoomLevel.update((z) => Math.max(80, z - 15));
  }

  copySnippet(code: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      this.copiedSnippet.set(code);
      setTimeout(() => this.copiedSnippet.set(null), 2000);
    }
  }
}
