import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  FluentProvider,
  IdPrefixProvider,
  webDarkTheme,
  webLightTheme
} from '@fluentui/react-components';
import { DismissRegular, EditRegular, SaveRegular, SubtractRegular, AddRegular, ZoomFitRegular } from '@fluentui/react-icons';

import * as strings from 'BpmnCommonStrings';
import type { BpmnService } from '../services/BpmnService';
import type { IZoomHandle } from './IBpmnViewerProps';
import BpmnViewer from './BpmnViewer';
import BpmnModeler from './BpmnModeler';

export interface IBpmnDialogProps {
  service: BpmnService;
  fileUrl: string;
  fileName: string;
  mode: 'view' | 'edit';
  isDarkTheme: boolean;
  backgroundColor: string;
  textColor: string;
  onClose: () => void;
}

const HISTORY_MARKER: string = 'bpmnDialog';

export default function BpmnDialog(props: IBpmnDialogProps): React.ReactElement<IBpmnDialogProps> {
  const { service, fileUrl, fileName, mode: initialMode, isDarkTheme, backgroundColor, textColor, onClose } = props;
  const theme = isDarkTheme ? webDarkTheme : webLightTheme;

  const [mode, setMode] = React.useState<'view' | 'edit'>(initialMode);
  const saveHandleRef: React.MutableRefObject<(() => Promise<boolean>) | undefined> = React.useRef();
  const zoomHandleRef: React.MutableRefObject<IZoomHandle | undefined> = React.useRef();
  const [saving, setSaving] = React.useState<boolean>(false);
  const [dirty, setDirty] = React.useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const dirtyRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
  dirtyRef.current = dirty;
  const closedRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);

  const close: (poppedAlready: boolean) => void = React.useCallback((poppedAlready: boolean) => {
    if (closedRef.current) {
      return;
    }
    closedRef.current = true;
    // Remove the history entry added on open, unless the user already navigated back past it.
    if (!poppedAlready && (window.history.state as Record<string, unknown> | null)?.[HISTORY_MARKER]) {
      window.history.back();
    }
    onClose();
  }, [onClose]);

  const requestClose: () => void = React.useCallback(() => {
    if (dirtyRef.current) {
      setConfirmOpen(true);
    } else {
      close(false);
    }
  }, [close]);

  // Browser Back must not leave a dialog with unsaved edits lingering over another view.
  React.useEffect(() => {
    window.history.pushState({ [HISTORY_MARKER]: true }, '');
    const onPopState: () => void = () => {
      if (closedRef.current) {
        return;
      }
      if (dirtyRef.current) {
        window.history.pushState({ [HISTORY_MARKER]: true }, '');
        setConfirmOpen(true);
      } else {
        close(true);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [close]);

  const title: string = fileName;

  return (
    // SharePoint runs its own Fluent provider; a unique prefix avoids colliding style-tag ids.
    <IdPrefixProvider value="bpmn-dialog-">
    <FluentProvider theme={theme} style={{ background: 'transparent' }}>
      <Dialog
        open
        modalType="modal"
        onOpenChange={(_, data) => {
          if (!data.open) {
            requestClose();
          }
        }}
      >
        <DialogSurface style={{ width: '96vw', maxWidth: '96vw', height: '94vh', maxHeight: '94vh', background: backgroundColor, color: textColor,
          borderRadius: 8, overflow: 'hidden', boxSizing: 'border-box', padding: 24,
          boxShadow: '0 32px 64px rgba(0,0,0,0.28), 0 0 8px rgba(0,0,0,0.2)' }}>
          <DialogBody style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <DialogTitle as="h2" style={{ margin: 0 }}>{title}</DialogTitle>
                {mode === 'edit' && (
                  <Button
                    size="small"
                    appearance="primary"
                    icon={<SaveRegular />}
                    disabled={saving}
                    onClick={() => {
                      setSaving(true);
                      (dirtyRef.current ? (saveHandleRef.current?.() ?? Promise.resolve(false)) : Promise.resolve(true))
                        .then(ok => {
                          if (ok) {
                            setDirty(false);
                            dirtyRef.current = false;
                            setMode('view');
                          }
                        })
                        .catch(() => { /* errors are shown by the modeler */ })
                        .finally(() => setSaving(false));
                    }}
                  >
                    {strings.SaveButton}
                  </Button>
                )}
                {mode === 'view' && (
                  <Button size="small" icon={<EditRegular />} onClick={() => setMode('edit')}>{strings.EditButton}</Button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }} role="toolbar">
                <Button appearance="subtle" aria-label={strings.ZoomOutButton} title={strings.ZoomOutButton}
                  icon={<SubtractRegular />} onClick={() => zoomHandleRef.current?.zoomOut()} />
                <Button appearance="subtle" aria-label={strings.ZoomFitButton} title={strings.ZoomFitButton}
                  icon={<ZoomFitRegular />} onClick={() => zoomHandleRef.current?.fit()} />
                <Button appearance="subtle" aria-label={strings.ZoomInButton} title={strings.ZoomInButton}
                  icon={<AddRegular />} onClick={() => zoomHandleRef.current?.zoomIn()} />
              </div>
              <Button
                style={{ justifySelf: 'end' }}
                appearance="subtle"
                aria-label={strings.CloseButton}
                icon={<DismissRegular />}
                onClick={requestClose}
              />
            </div>
            <DialogContent style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {mode === 'edit' ? (
                <BpmnModeler
                  service={service}
                  fileUrl={fileUrl}
                  isDarkTheme={isDarkTheme}
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                  fill
                  onDirtyChange={setDirty}
                  saveHandleRef={saveHandleRef}
                  zoomHandleRef={zoomHandleRef}
                />
              ) : (
                <BpmnViewer
                  service={service}
                  fileUrl={fileUrl}
                  fullPage={false}
                  fill
                  isDarkTheme={isDarkTheme}
                  backgroundColor={backgroundColor}
                  textColor={textColor}
                  zoomHandleRef={zoomHandleRef}
                />
              )}
            </DialogContent>
            <Dialog
              open={confirmOpen}
              modalType="alert"
              onOpenChange={(_, data) => setConfirmOpen(data.open)}
            >
              <DialogSurface>
                <DialogBody>
                  <DialogTitle>{strings.DiscardTitle}</DialogTitle>
                  <DialogContent>{strings.DiscardMessage}</DialogContent>
                  <DialogActions>
                    <Button appearance="primary" onClick={() => setConfirmOpen(false)}>
                      {strings.KeepEditingButton}
                    </Button>
                    <Button
                      onClick={() => {
                        setConfirmOpen(false);
                        close(false);
                      }}
                    >
                      {strings.DiscardButton}
                    </Button>
                  </DialogActions>
                </DialogBody>
              </DialogSurface>
            </Dialog>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </FluentProvider>
    </IdPrefixProvider>
  );
}
