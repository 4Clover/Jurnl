## Working with Konva.js for Entries

For creating the free-form canvas experience within ScribblyScraps entries, we will be using **Konva.js**. This document provides a brief introduction to Konva.js, its role in our project, and key concepts to keep in mind.

**What is Konva.js?**

Konva.js is a 2D HTML5 Canvas JavaScript library. It helps us create interactive and complex graphics on a web page by providing a structured, object-oriented way to draw and manage elements on an HTML `<canvas>`. Think of it as a tool that makes drawing dynamic shapes, images, and text, and handling user interactions with them (like dragging, resizing, rotating) much easier than using the raw Canvas API directly.

**Official Documentation:** For in-depth information, API details, and advanced tutorials, always refer to the [Official Konva.js Documentation](https://konvajs.org/docs/index.html).

**How Konva.js Works (The Basics):**

Konva organizes its content in a hierarchy:

1.  **`Stage`**: This is the main container, like the "world" for all your graphics. It's linked to an HTML `<canvas>` element on our entry page.
2.  **`Layer`**: Stages contain one or more Layers. Each layer is a separate canvas, which helps with performance (Konva can redraw only the layers that changed). We'll use layers to organize different types of content or for z-ordering.
3.  **`Node`**: This is the base "thing" in Konva. Everything you add to a layer is a Node.
    - **`Shape`**: Specific types of Nodes you can draw (e.g., `Konva.Rect`, `Konva.Circle`, `Konva.Text`, `Konva.Image`). These have properties like `x`, `y`, `width`, `height`, `fill` (color), `stroke`, `opacity`, `rotation`, etc.
    - **`Group`**: A special Node that can contain other Nodes (Shapes or other Groups). Useful for grouping elements together to transform or manage them as a single unit.

**Key Konva.js Concepts for ScribblyScraps:**

- **Object-Oriented:** You create and manipulate graphical elements as JavaScript objects (e.g., `new Konva.Rect({ ... })`).
- **Configuration Objects:** When creating a Konva Node, you pass a configuration object specifying its initial properties (e.g., `{ x: 10, y: 10, width: 100, fill: 'red' }`).
- **Attributes/Properties:** You can get and set attributes of nodes using methods like `node.x(50)`, `node.fill('blue')`, or `node.setAttrs({ ... })`.
- **Transformations:** Konva makes it easy to:
    - **Position:** Set `x` and `y` coordinates.
    - **Size:** Set `width` and `height`.
    - **Scale:** Set `scaleX` and `scaleY`.
    - **Rotate:** Set `rotation` (in degrees).
    - **Offset:** Change the origin point for transformations using `offsetX` and `offsetY`.
    - **`Konva.Transformer`:** A built-in tool to add interactive resize and rotate handles to selected nodes. We will use this heavily.
- **Event Handling:** Nodes can listen to events like `click`, `mousedown`, `dragmove`, `touchstart`, etc. (e.g., `shape.on('click', () => { ... });`). This is how we'll make our canvas elements interactive.
- **Draggable Nodes:** Simply set `draggable: true` in a node's config to make it draggable by the user.
- **Layering (Z-index):** Nodes are drawn in the order they are added to a Layer or Group. You can use methods like `node.moveToTop()`, `node.moveUp()`, `node.zIndex(value)` to control the stacking order.
- **Serialization (Saving/Loading Entry Content):**
    - The state of our Konva canvas (all the shapes, images, text, and their properties) will be what's stored in the `Entry.content` field in our database.
    - Konva provides `node.toJSON()` and `Konva.Node.create(json)` which can help, but for ScribblyScraps, we'll likely use a custom array of block definitions (like `KonvaBlockData[]` we've discussed) to store the configurations of each Konva node. This gives us more control over the saved data structure.
    - When an entry loads, we'll read this array and recreate the Konva nodes on the stage.
    - **NOTE:** The method for how to save/represent Konva may change once Dillon figures out the most efficient method, do not worry about this too much at this point.
- **Performance - Caching:** For complex shapes or groups, `node.cache()` can improve rendering performance by drawing the node to an off-screen canvas.

**Role of Konva.js in ScribblyScraps Entries:**

- It will power the **editor** where users design their journal pages/canvases.
- It will be responsible for **rendering** the saved entry content when a user views a page.
- Users will interact with Konva `Shape`s (text boxes, images, stickers) to place, resize, rotate, and layer them to create their unique scrapbook pages.
- Our goal is to create an "infinite canvas" feel where the "page" is a viewport onto a larger Konva Stage, allowing for zoom, pan, and content partially off-screen.

**Important Idiosyncrasies & Things to Remember:**

1.  **Coordinate System:** `(0,0)` is the top-left corner of the container (Layer or Group).
2.  **Image Loading:** `Konva.Image` requires an actual HTML `Image` object. You'll need to load image sources (e.g., from our `EntryAttachment` URLs) into an `Image` element first before creating a `Konva.Image`.
3.  **Text Editing:** `Konva.Text` displays text. For _editing_ text, you'll typically need to implement a separate HTML input overlay (e.g., a `<textarea>` that appears on double-click) or use a library that facilitates this.
4.  **Saving State:** Remember that what we save to the database is the _configuration data_ of the Konva nodes, not the Konva objects themselves. We recreate the objects from this data on load.
5.  **Z-Index is Relative:** A node's `zIndex` is relative to its siblings within the same parent (Layer or Group), not an absolute global z-index like in CSS. Order of adding nodes to a layer also matters for default stacking.
6.  **Transformer Integration:** The `Konva.Transformer` is powerful but needs to be attached to selected nodes and its events handled to update the node's properties.
7.  **Batch Drawing:** For performance, Konva often batches draw operations. If you make changes and don't see them immediately, you might need to call `layer.batchDraw()` or `stage.batchDraw()`. (Often Konva handles this well for direct attribute changes or events).
