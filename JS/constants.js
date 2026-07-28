/**
 * ======================================================
 * Project Constants
 * ------------------------------------------------------
 * This file contains values shared across multiple files.
 *
 * Why use this file?
 * - Avoid duplicated values.
 * - Keep configuration centralized.
 * - Make future maintenance easier.
 * ======================================================
 */


/* ======================================================
 * Application Information
 * ====================================================== */

export const APP = {

  NAME: "VGEC Timetable",

  VERSION: "1.4.0"

};


/* ======================================================
 * Days
 * ====================================================== */

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];


/* ======================================================
 * Cache Configuration
 * ====================================================== */

export const CACHE = {

  /**
   * localStorage key used to store timetable.
   */
  TIMETABLE_STORAGE_KEY: "vgec_timetable_cache",

  /**
   * Increment whenever the cache structure changes.
   *
   * Example:
   * Version 1
   * {
   *   version: 1,
   *   updatedAt: "...",
   *   data: { ... }
   * }
   *
   * If the structure changes in the future,
   * simply increase this version.
   * Older cache will automatically be discarded.
   */
  VERSION: 1

};


/* ======================================================
 * Offline Banner Messages
 * ====================================================== */

export const OFFLINE = {

  TITLE: "Offline Mode",

  MESSAGE:
    "Showing the last downloaded timetable. Connect to the internet to check for updates."

};


/* ======================================================
 * Notification Settings
 * ====================================================== */

export const NOTIFICATION = {

  DURATION: 3000

};

/* ======================================================
 * Admin emails
 * ====================================================== */


export const ADMIN_EMAIL = "sdev.19072003@gmail.com";