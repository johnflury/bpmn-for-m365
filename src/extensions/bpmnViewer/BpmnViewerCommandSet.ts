import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';

import * as strings from 'BpmnViewerCommandSetStrings';

export interface IBpmnViewerCommandSetProperties {}

const VIEW_COMMAND_ID: string = 'OPEN_BPMN_VIEWER';

export default class BpmnViewerCommandSet extends BaseListViewCommandSet<IBpmnViewerCommandSetProperties> {

  public onInit(): Promise<void> {
    const viewCommand: Command = this.tryGetCommand(VIEW_COMMAND_ID);
    if (viewCommand) {
      viewCommand.title = strings.OpenInViewer;
      viewCommand.visible = false;
    }
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    if (event.itemId !== VIEW_COMMAND_ID) {
      return;
    }

    const row = this.context.listView.selectedRows?.[0];
    const fileRef: string | undefined = row?.getValueByName('FileRef');
    if (!fileRef) {
      return;
    }
    const fileName: string = String(row?.getValueByName('FileLeafRef') || fileRef.split('/').pop() || '');

    // The dialog code (React, Fluent, bpmn-js) is loaded on first use only.
    import(/* webpackChunkName: 'bpmn-dialog' */ './openBpmnDialog')
      .then(({ openBpmnDialog }) => openBpmnDialog(this, this.context, { fileUrl: fileRef, fileName, mode: 'view' }))
      .catch((e: unknown) => {
        console.error('BPMN dialog could not be opened', e);
      });
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    const rows = this.context.listView.selectedRows;
    const visible: boolean = !!rows && rows.length === 1 &&
      /\.bpmn$/i.test(String(rows[0].getValueByName('FileLeafRef') || ''));

    const command: Command = this.tryGetCommand(VIEW_COMMAND_ID);
    if (command) {
      command.visible = visible;
    }

    this.raiseOnChange();
  };
}
