# bpmn-for-m365

## Summary

A SharePoint Framework (SPFx) **ListView Command Set** that shows and edits BPMN 2.0 diagrams stored in SharePoint document libraries, using [bpmn-js](https://github.com/bpmn-io/bpmn-js).

Select a `.bpmn` file in a library and click **Show BPMN diagram**. The diagram opens in a large modal dialog:

- **View mode** (default): read-only viewer with pan and zoom.
- **Edit mode**: click **Edit** to switch to the bpmn-js modeler; **Save** writes the file back and returns to the viewer.
- **Zoom**: `−`, *fit* and `+` buttons in the dialog header (Ctrl/Cmd + mouse wheel and drag-to-pan also work).
- **Safety**: ETag conflict detection on save (offers *Save as copy* or *Reload*) and a confirmation before discarding unsaved changes.
- **Theme aware**: follows the SharePoint site theme.

Technologies: SPFx 1.24.1 (Heft), React 18.3.1, Fluent UI v9, PnPjs, bpmn-js. The dialog code is lazy-loaded, so it does not affect library page load.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.24.1-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- Node.js 26 LTS
- A SharePoint Online tenant with a document library containing `.bpmn` files
- Edit permission on a file to save changes

## Solution

| Area | Path |
| ---- | ---- |
| Command set | `src/extensions/bpmnViewer/` |
| Dialog, viewer, modeler | `src/common/components/` |
| PnPjs file access | `src/common/services/BpmnService.ts` |

## Minimal Path to Awesome

- Clone this repository
- `npm install`
- `npm run build` (produces `sharepoint/solution/bpmn-for-m-365.sppkg`)
- Upload the `.sppkg` to the tenant or site App Catalog and add the app to your site

### Test locally

1. Set `pageUrl` in `config/serve.json` to a document library view on your tenant
   (e.g. `https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE/YOUR-LIBRARY/Forms/AllItems.aspx`).
2. Run `npm start` and open the library with:

   ```text
   ?loadSPFX=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js&customActions={"658fdb91-24e1-4003-b1fa-6b8e52159c94":{"location":"ClientSideExtension.ListViewCommandSet","properties":{}}}
   ```

3. Select a `.bpmn` file and use **Show BPMN diagram** in the command bar.

## Notes

- Uses Fluent's `IdPrefixProvider` to avoid ID collisions with SharePoint's own Fluent provider.
- bpmn-js CSS is bundled; the icon font is inlined in `bpmn-font.css`.

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

## References

- [bpmn-js](https://github.com/bpmn-io/bpmn-js)
- [PnPjs](https://pnp.github.io/pnpjs/)
- [Getting started with SharePoint Framework](https://learn.microsoft.com/sharepoint/dev/spfx/set-up-your-development-environment)
