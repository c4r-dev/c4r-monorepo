## Designer Activity: UI copy change + connection fix

### What you asked for
- Replace the top “Phase” copy with placeholders.
  - Phase 1 → “instructions 1 here”
  - Phase 2 → “instructions 2 here”
- Fix connecting nodes, which stopped working recently.

### Files updated
- `src/app/pages/designer-activity/page.js`

### Edits made
- **UI text**
  - Replaced headers with placeholders (removed “Phase” labels).
  - Removed the descriptive paragraph under the former Phase 2 header.
- **React Flow connectivity**
  - Added `deleteEdgeById` to remove edges by id and announce updates.
  - Ensured new edges include delete handler and arrow marker via `onConnect` and `defaultEdgeOptions`.
  - Enabled easier connecting and permissive validation:
    - `connectionMode="loose"`
    - `connectOnClick`
    - `isValidConnection={() => true}`
    - `defaultEdgeOptions={{ type: 'deletableEdge', markerEnd: { type: 'arrowclosed' }, data: { onDeleteEdge: deleteEdgeById } }}`
  - Fixed React hook dependencies; no linter warnings remain.

### How to verify
1. Open the Designer Activity page.
2. Confirm headers read exactly:
   - “instructions 1 here” (initial screen)
   - “instructions 2 here” (designer screen)
3. Add two nodes, connect by drag or click-to-connect.
4. Delete an edge by:
   - Selecting the edge and pressing Delete/Backspace, or
   - Clicking the edge’s “×” button.

### Notes
- No changes were needed in `designer-activity.css`.
- Lint status: no linter errors in `page.js` after edits.
- Library versions: `@xyflow/react` ^12.5.4, `react` ^19.
