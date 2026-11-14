# Election geometry editing

This workflow replaces the proposal to generate election geometry automatically
in the polling-place loader:

1. On creation, initialise the election geometry from a single authoritative
   set of state/territory or Australia-wide defaults, according to its geographic
   area. Smaller events also start with their containing area's default.
2. Load polling places without changing the election geometry.
3. In the election editor, show the loaded polling places and their calculated
   bounding box on a mobile-sized map using the public map's fitting logic.
   Let the admin pan and zoom, then explicitly save the visible map extent as
   the election geometry.
4. On subsequent visits, restore the saved geometry while continuing to show
   the polling-place bounding box as a reference for further adjustment.

Apply a separate configurable buffer to the saved geometry for address-search
bounds, without changing the public map's framing. Agree on the buffer
calculation and preview dimensions before implementation. Also define which
polling places contribute to the reference box, including overseas handling.

Fix the existing election form so opening or saving an election preserves its
custom geometry rather than resetting it to the area's default. Account for
geometry's existing use in polling-place loader validation when introducing the
separate display and buffered-search behaviour.

This change is scoped but not implemented.
