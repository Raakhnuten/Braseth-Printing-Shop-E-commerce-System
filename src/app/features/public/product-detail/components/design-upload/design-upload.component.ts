import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal } from '@angular/core';

export interface DesignFileUpload {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl: string;
}

@Component({
  selector: 'app-design-upload',
  templateUrl: './design-upload.component.html',
  styleUrl: './design-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignUploadComponent {
  readonly ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf', '.ai', '.psd', '.svg'];
  readonly ACCEPTED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'application/pdf',
    'application/postscript',
    'application/illustrator',
    'application/photoshop',
    'image/vnd.adobe.photoshop',
  ];

  @Input() maxSizeMb: number = 50;
  @Input() acceptedExtensions: string[] = ['.png', '.jpg', '.jpeg', '.pdf', '.ai', '.psd', '.svg'];

  @Output() fileUploaded = new EventEmitter<DesignFileUpload>();
  @Output() fileRemoved = new EventEmitter<void>();

  artworkFileName = signal<string>('');
  artworkFileSize = signal<number>(0);
  artworkFileType = signal<string>('');
  artworkPreviewUrl = signal<string>('');
  artworkUploading = signal(false);
  artworkError = signal<string>('');
  isDragOver = signal(false);

  private uploadTimeout: ReturnType<typeof setTimeout> | null = null;

  get acceptedExtensionsString(): string {
    return this.ACCEPTED_EXTENSIONS.join(', ');
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  onArtworkUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.processArtworkFile(file);
    }
    (event.target as HTMLInputElement).value = '';
  }

  onArtworkDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onArtworkDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onArtworkDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processArtworkFile(file);
    }
  }

  removeArtwork(): void {
    this.artworkFileName.set('');
    this.artworkFileSize.set(0);
    this.artworkFileType.set('');
    this.artworkPreviewUrl.set('');
    this.artworkError.set('');
    this.fileRemoved.emit();
  }

  downloadTemplate(): void {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#f8f9fa"/>
  <rect x="50" y="50" width="500" height="500" rx="20" fill="#fff" stroke="#d1d5db" stroke-width="2" stroke-dasharray="8,4"/>
  <text x="300" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#9ca3af">Design Area</text>
  <text x="300" y="310" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#9ca3af">600 x 600 px</text>
  <line x1="50" y1="200" x2="550" y2="200" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="50" y1="400" x2="550" y2="400" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="200" y1="50" x2="200" y2="550" stroke="#e5e7eb" stroke-width="1"/>
  <line x1="400" y1="50" x2="400" y2="550" stroke="#e5e7eb" stroke-width="1"/>
  <circle cx="300" cy="300" r="120" fill="none" stroke="#e5e7eb" stroke-width="1"/>
  <text x="300" y="580" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#d1d5db">Center alignment guide</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-template.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  private processArtworkFile(file: File): void {
    this.artworkError.set('');
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = this.ACCEPTED_EXTENSIONS.includes(ext);
    const isMimeValid = this.ACCEPTED_MIME_TYPES.includes(file.type);

    if (!isExtensionValid && !isMimeValid) {
      this.artworkError.set(`Unsupported file type. Accepted: ${this.acceptedExtensionsString}`);
      return;
    }

    const maxBytes = this.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      this.artworkError.set(`File exceeds ${this.maxSizeMb}MB limit.`);
      return;
    }

    // Clear any pending upload timeout to prevent race conditions on rapid re-uploads
    if (this.uploadTimeout) {
      clearTimeout(this.uploadTimeout);
      this.uploadTimeout = null;
    }

    this.artworkUploading.set(true);

    this.uploadTimeout = setTimeout(() => {
      this.artworkFileName.set(file.name);
      this.artworkFileSize.set(file.size);
      this.artworkFileType.set(file.type);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.artworkPreviewUrl.set(reader.result as string);
          this.artworkUploading.set(false);
          this.fileUploaded.emit({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            previewUrl: reader.result as string,
          });
        };
        reader.onerror = () => {
          this.artworkPreviewUrl.set('');
          this.artworkUploading.set(false);
          this.fileUploaded.emit({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            previewUrl: '',
          });
        };
        reader.readAsDataURL(file);
      } else {
        this.artworkPreviewUrl.set('');
        this.artworkUploading.set(false);
        this.fileUploaded.emit({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          previewUrl: '',
        });
      }
    }, 800);
  }
}
