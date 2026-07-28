/**
 * ============================================
 * Cache Service
 * --------------------------------------------
 * Handles storing and retrieving timetable data
 * from the browser's localStorage.
 *
 * Firestore remains the source of truth.
 * This cache is only used for:
 *  - Faster app startup
 *  - Offline support
 * ============================================
 */



/**
 * ============================================
    imports
 * ============================================
 */


import { CACHE } from "./constants.js";





export class CacheService {

  /**
   * Storage key used inside localStorage.
   * Change this only if you intentionally want
   * to invalidate all previously saved caches.
   */
  static TIMETABLE_STORAGE_KEY = CACHE.TIMETABLE_STORAGE_KEY;
  static CACHE_VERSION = CACHE.VERSION;


  /**
   * Save timetable into localStorage.
   *
   * @param {Object} timetable - Complete timetable object
   */
  static save(timetable) {

    try {

      const cache = {
        version: this.CACHE_VERSION,
        updatedAt: new Date().toISOString(),
        data: timetable
      };

      localStorage.setItem(
        this.TIMETABLE_STORAGE_KEY,
        JSON.stringify(cache)
      );

      console.log("✅ Timetable cache saved.");

    } catch (error) {

      console.error("❌ Failed to save timetable cache:", error);

    }

  }


  /**
   * Load timetable from localStorage.
   *
   * @returns {Object|null}
   * Returns:
   *  - timetable object
   *  - null if cache doesn't exist or is invalid
   */
  static load() {

    try {

      const cache = localStorage.getItem(this.TIMETABLE_STORAGE_KEY);

      if (!cache) {
        return null;
      }

      const parsedCache = JSON.parse(cache);

      // Ignore cache if it was created using an older format
      if (parsedCache.version !== this.CACHE_VERSION) {

        console.warn("⚠️ Cache version mismatch. Ignoring old cache.");

        this.clear();

        return null;
      }

      console.log("📦 Timetable cache loaded.");

      return parsedCache.data;

    } catch (error) {

      console.error("❌ Failed to load timetable cache:", error);

      this.clear();

      return null;

    }

  }


  /**
   * Returns the entire cache object.
   * Useful if later you want to display:
   *
   * "Last updated 10:35 AM"
   */
  static getCacheInfo() {

    try {

      const parsedCache = JSON.parse(cache);

      if (parsedCache.version !== this.CACHE_VERSION) {
        return null;
      }

      return parsedCache;

    } catch {

      return null;

    }

  }


  /**
   * Remove cached timetable.
   * Mostly useful during development
   * or when implementing a Reset option.
   */
  static clear() {

    localStorage.removeItem(this.TIMETABLE_STORAGE_KEY);

    console.log("🗑️ Timetable cache cleared.");

  }


  /**
   * Check whether a cached timetable exists.
   *
   * @returns {boolean}
   */
  static hasCache() {

    return localStorage.getItem(this.TIMETABLE_STORAGE_KEY) !== null;

  }

}


// TODO:
// In the future this cache can also store:
// - announcements
// - holidays
// - faculty list
// - app settings