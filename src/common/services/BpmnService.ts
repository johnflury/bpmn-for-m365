import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/files';
import '@pnp/sp/folders';
import type { BaseComponentContext } from '@microsoft/sp-component-base';

export interface ILibraryInfo {
  id: string;
  title: string;
}

export interface IBpmnFileContent {
  text: string;
  // Identifies the file version that was read; used to detect concurrent changes on save.
  etag: string;
}

export class BpmnConflictError extends Error {
  public constructor() {
    super('The file was changed by someone else.');
    this.name = 'BpmnConflictError';
  }
}

export interface IBpmnFileInfo {
  serverRelativeUrl: string;
  name: string;
}

const DOCUMENT_LIBRARY_TEMPLATE: number = 101;
const MAX_FILES: number = 500;

export class BpmnService {
  private readonly _sp: SPFI;

  public constructor(context: BaseComponentContext) {
    this._sp = spfi().using(SPFx(context));
  }

  public async getLibraries(): Promise<ILibraryInfo[]> {
    const lists: { Id: string; Title: string }[] = await this._sp.web.lists
      .filter(`BaseTemplate eq ${DOCUMENT_LIBRARY_TEMPLATE} and Hidden eq false`)
      .select('Id', 'Title')
      .orderBy('Title')();
    return lists.map(l => ({ id: l.Id, title: l.Title }));
  }

  public async getBpmnFiles(libraryId: string): Promise<IBpmnFileInfo[]> {
    const viewXml: string =
      '<View Scope="RecursiveAll"><Query><Where><Eq>' +
      '<FieldRef Name="File_x0020_Type"/><Value Type="Text">bpmn</Value>' +
      '</Eq></Where><OrderBy><FieldRef Name="FileLeafRef"/></OrderBy></Query>' +
      '<ViewFields><FieldRef Name="FileRef"/><FieldRef Name="FileLeafRef"/></ViewFields>' +
      `<RowLimit>${MAX_FILES}</RowLimit></View>`;

    const result: { Row: { FileRef: string; FileLeafRef: string }[] } =
      await this._sp.web.lists.getById(libraryId).renderListDataAsStream({ ViewXml: viewXml });

    return result.Row.map(r => ({ serverRelativeUrl: r.FileRef, name: r.FileLeafRef }));
  }

  public getFileText(serverRelativeUrl: string): Promise<string> {
    return this._sp.web.getFileByServerRelativePath(serverRelativeUrl).getText();
  }

  public async getFile(serverRelativeUrl: string): Promise<IBpmnFileContent> {
    const file = this._sp.web.getFileByServerRelativePath(serverRelativeUrl);
    const [text, etag] = await Promise.all([file.getText(), this._getEtag(serverRelativeUrl)]);
    return { text, etag };
  }

  // Overwrites the file; throws BpmnConflictError if it changed since `expectedEtag` was read.
  // Returns the new ETag.
  public async saveFileText(serverRelativeUrl: string, content: string, expectedEtag?: string): Promise<string> {
    if (expectedEtag !== undefined) {
      const current: string = await this._getEtag(serverRelativeUrl);
      if (current !== expectedEtag) {
        throw new BpmnConflictError();
      }
    }
    await this._sp.web.getFileByServerRelativePath(serverRelativeUrl).setContent(content);
    return this._getEtag(serverRelativeUrl);
  }

  // Creates "<name> (copy <timestamp>).bpmn" next to the original; returns the new file name.
  public async saveCopy(serverRelativeUrl: string, content: string): Promise<string> {
    const slash: number = serverRelativeUrl.lastIndexOf('/');
    const folder: string = serverRelativeUrl.substring(0, slash);
    const name: string = serverRelativeUrl.substring(slash + 1).replace(/\.bpmn$/i, '');
    const now: Date = new Date();
    const pad: (n: number) => string = n => String(n).padStart(2, '0');
    const stamp: string = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
      `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const copyName: string = `${name} (copy ${stamp}).bpmn`;
    await this._sp.web.getFolderByServerRelativePath(folder).files.addUsingPath(copyName, content, { Overwrite: false });
    return copyName;
  }

  private async _getEtag(serverRelativeUrl: string): Promise<string> {
    const info: { ETag: string; TimeLastModified: string } = await this._sp.web
      .getFileByServerRelativePath(serverRelativeUrl)
      .select('ETag', 'TimeLastModified')();
    return `${info.ETag}|${info.TimeLastModified}`;
  }
}
