import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, type IReadonlyTheme, type ThemeChangedEventArgs } from '@microsoft/sp-component-base';
import type { ListViewCommandSetContext } from '@microsoft/sp-listview-extensibility';

import BpmnDialog from '../../common/components/BpmnDialog';
import { BpmnService } from '../../common/services/BpmnService';

export interface IOpenBpmnDialogOptions {
  fileUrl: string;
  fileName: string;
  mode: 'view' | 'edit';
}

let dialogOpen: boolean = false;
type EventObserver = Parameters<ThemeProvider['themeChangedEvent']['add']>[0];

// Imported lazily by the command set so React, Fluent and bpmn-js load only on first use.
export function openBpmnDialog(
  observer: EventObserver,
  context: ListViewCommandSetContext,
  options: IOpenBpmnDialogOptions): void {
  if (dialogOpen) {
    return;
  }
  dialogOpen = true;

  const trigger: Element | null = document.activeElement;
  const host: HTMLDivElement = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  const service: BpmnService = new BpmnService(context);
  const themeProvider: ThemeProvider = context.serviceScope.consume(ThemeProvider.serviceKey);

  const render: (theme: IReadonlyTheme | undefined) => void = theme => {
    root.render(
      React.createElement(BpmnDialog, {
        service,
        fileUrl: options.fileUrl,
        fileName: options.fileName,
        mode: options.mode,
        isDarkTheme: !!theme?.isInverted,
        backgroundColor: theme?.semanticColors?.bodyBackground ?? '#ffffff',
        textColor: theme?.semanticColors?.bodyText ?? '#323130',
        onClose
      })
    );
  };

  const onThemeChanged: (args: ThemeChangedEventArgs) => void = args => render(args.theme);

  function onClose(): void {
    themeProvider.themeChangedEvent.remove(observer, onThemeChanged);
    dialogOpen = false;
    // Defer so the unmount doesn't happen while React is still handling the click.
    window.setTimeout(() => {
      root.unmount();
      host.remove();
      if (trigger instanceof HTMLElement) {
        trigger.focus();
      }
    }, 0);
  }

  themeProvider.themeChangedEvent.add(observer, onThemeChanged);
  render(themeProvider.tryGetTheme());
}
