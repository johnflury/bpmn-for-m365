declare interface IBpmnViewerCommandSetStrings {
  OpenInViewer: string;
}

declare module 'BpmnViewerCommandSetStrings' {
  const strings: IBpmnViewerCommandSetStrings;
  export = strings;
}
