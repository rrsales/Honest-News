/* assets/js/admin/hn-admin-pages.js
 *
 * Simple page manager for site-data.json
 * Works with an object-style pages map:
 * {
 *   pages: {
 *     home: { title, slug, hero, blocks, ... },
 *     podcast: { ... },
 *     ...
 *   }
 * }
 */

;(function (global) {
  const HNAdmin = global.HNAdmin || (global.HNAdmin = {});

  // -----------------------
  // Helpers
  // -----------------------
  function ensurePages(data) {
    if (!data.pages || typeof data.pages !== "object" || Array.isArray(data.pages)) {
      data.pages = {};
    }
    return data;
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function saveIfPossible(data) {
    if (typeof HNAdmin.saveLocalSnapshot === "function") {
      try {
        HNAdmin.saveLocalSnapshot(data);
      } catch (e) {
        console.warn("HNAdmin.saveLocalSnapshot failed:", e);
      }
    }
  }

  // -----------------------
  // API
  // -----------------------

  /**
   * Returns an array of pages for easier rendering in the UI.
   * Each item: { id, title, slug, hero, blocks }
   */
  HNAdmin.listPages = function listPages(data) {
    ensurePages(data);
    return Object.keys(data.pages)
      .map((id) => {
        const page = data.pages[id] || {};
        return {
          id,
          title: page.title || id,
          slug: page.slug || id,
          hero: page.hero || {},
          blocks: page.blocks || [],
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  };

  /**
   * Add a new page.
   * opts: { title?, id?, slug?, theme?, hero?, blocks? }
   * Returns { data, page }
   */
  HNAdmin.addPage = function addPage(data, opts) {
    ensurePages(data);
    opts = opts || {};

    const baseTitle = opts.title || "New page";
    let baseId = opts.id || slugify(baseTitle) || "page";
    let id = baseId;
    let i = 2;

    // Make sure ID is unique
    while (data.pages[id]) {
      id = `${baseId}-${i++}`;
    }

    const page = {
      id,
      title: baseTitle,
      slug: opts.slug || id,
      theme: opts.theme || "dark",
      hero: opts.hero || {
        eyebrow: "",
        title: baseTitle,
        subtitle: "",
        style: "simple", // or "apple"
        transparentHeader: false,
        backgroundImage: "",
      },
      blocks: Array.isArray(opts.blocks) ? opts.blocks : [],
    };

    data.pages[id] = page;
    saveIfPossible(data);

    return { data, page };
  };

  /**
   * Delete a page by id.
   * Returns updated data.
   */
  HNAdmin.deletePage = function deletePage(data, id) {
    ensurePages(data);
    if (!id || !data.pages[id]) {
      return data;
    }

    delete data.pages[id];
    saveIfPossible(data);
    return data;
  };

  /**
   * Rename a page (title; optionally update slug if it was default).
   * Returns updated data.
   */
  HNAdmin.renamePage = function renamePage(data, id, newTitle) {
    ensurePages(data);
    const page = data.pages[id];
    if (!page) return data;

    const oldSlug = page.slug || id;
    page.title = newTitle;

    // If slug was never customized (same as id / oldSlug), keep it in sync
    if (!oldSlug || oldSlug === id) {
      page.slug = slugify(newTitle);
    }

    saveIfPossible(data);
    return data;
  };

  /**
   * Convenience: get a single page by id (or null).
   */
  HNAdmin.getPage = function getPage(data, id) {
    ensurePages(data);
    return data.pages[id] || null;
  };
})(window);

