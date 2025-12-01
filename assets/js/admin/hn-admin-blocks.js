// HN Admin Blocks Library
// - Manage blocks on a page

window.HNAdmin = window.HNAdmin || {};

(function (HNAdmin) {
  function ensurePageBlocks(data, pageId) {
    if (!data.pages || !data.pages[pageId]) {
      throw new Error("HNAdmin.blocks: page not found: " + pageId);
    }
    if (!Array.isArray(data.pages[pageId].blocks)) {
      data.pages[pageId].blocks = [];
    }
  }

  // Add a new block to the end of the page.blocks array
  // block: { type, id, heading, body, ... }
  HNAdmin.addBlock = function (data, pageId, block) {
    ensurePageBlocks(data, pageId);

    if (!block.id) {
      throw new Error("HNAdmin.addBlock: block.id is required");
    }

    var blocks = data.pages[pageId].blocks;
    var exists = blocks.some(function (b) { return b.id === block.id; });
    if (exists) {
      throw new Error("HNAdmin.addBlock: block id already exists on page: " + block.id);
    }

    blocks.push(block);
    return data;
  };

  // Update an existing block by id
  HNAdmin.updateBlock = function (data, pageId, blockId, changes) {
    ensurePageBlocks(data, pageId);
    var blocks = data.pages[pageId].blocks;

    var found = false;
    blocks.forEach(function (b) {
      if (b.id === blockId) {
        Object.keys(changes).forEach(function (key) {
          b[key] = changes[key];
        });
        found = true;
      }
    });

    if (!found) {
      throw new Error("HNAdmin.updateBlock: block not found: " + blockId);
    }

    return data;
  };

  // Remove a block by id
  HNAdmin.removeBlock = function (data, pageId, blockId) {
    ensurePageBlocks(data, pageId);
    var blocks = data.pages[pageId].blocks;
    data.pages[pageId].blocks = blocks.filter(function (b) {
      return b.id !== blockId;
    });
    return data;
  };

  // Reorder blocks on a page – takes array of block ids in new order
  HNAdmin.reorderBlocks = function (data, pageId, newOrderIds) {
    ensurePageBlocks(data, pageId);
    var blocks = data.pages[pageId].blocks;
    var idToBlock = {};

    blocks.forEach(function (b) {
      idToBlock[b.id] = b;
    });

    var reordered = [];
    newOrderIds.forEach(function (id) {
      if (idToBlock[id]) {
        reordered.push(idToBlock[id]);
        delete idToBlock[id];
      }
    });

    // Append leftovers
    Object.keys(idToBlock).forEach(function (id) {
      reordered.push(idToBlock[id]);
    });

    data.pages[pageId].blocks = reordered;
    return data;
  };
})(window.HNAdmin);
