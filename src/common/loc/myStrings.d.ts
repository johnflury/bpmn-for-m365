declare interface IBpmnCommonStrings {
  NoFileSelected: string;
  Loading: string;
  ErrorTitle: string;
  LoadFileError: string;
  InvalidBpmnError: string;
  SaveButton: string;
  Saving: string;
  Saved: string;
  UnsavedChanges: string;
  SaveError: string;
  ConflictError: string;
  ReloadButton: string;
  SaveCopyButton: string;
  SavedCopy: string;
  CloseButton: string;
  ZoomInButton: string;
  ZoomOutButton: string;
  ZoomFitButton: string;
  EditButton: string;
  DiscardTitle: string;
  DiscardMessage: string;
  DiscardButton: string;
  KeepEditingButton: string;
}

declare module 'BpmnCommonStrings' {
  const strings: IBpmnCommonStrings;
  export = strings;
}
