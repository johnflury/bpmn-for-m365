import type * as React from 'react';
import type { IZoomHandle } from './IBpmnViewerProps';
import type { BpmnService } from '../services/BpmnService';

export interface IBpmnModelerProps {
  service: BpmnService;
  fileUrl: string;
  isDarkTheme: boolean;
  backgroundColor: string;
  textColor: string;
  // Fill the parent's height (used inside the dialog).
  fill?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  // When set, the built-in toolbar is hidden and the host triggers saving via this handle.
  zoomHandleRef?: React.MutableRefObject<IZoomHandle | undefined>;
  saveHandleRef?: React.MutableRefObject<(() => Promise<boolean>) | undefined>;
}
