/**
 * Web-specific database stub
 * The app uses SQLite which is not fully supported on web.
 * This stub provides placeholder exports for web builds.
 */

// Create a mock db object that won't crash on web
export const db = {
    select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
    insert: () => ({ values: () => Promise.resolve() }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    delete: () => ({ where: () => Promise.resolve() }),
} as any;
