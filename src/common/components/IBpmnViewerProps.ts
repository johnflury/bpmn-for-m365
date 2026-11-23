import type * as React from 'react';
import type { BpmnService } from '../services/BpmnService';

export interface IZoomHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
}

export interface IBpmnViewerProps {
  service: BpmnService;
  fileUrl: string;
  // True when the file comes from the ?file= URL parameter (full-page viewer).
  fullPage: boolean;
  // Fill the parent's height (used inside the dialog).
  fill?: boolean;
  isDarkTheme: boolean;
  backgroundColor: string;
  textColor: string;
  // Lets the host (dialog header) drive zooming.
  zoomHandleRef?: React.MutableRefObject<IZoomHandle | undefined>;
}
