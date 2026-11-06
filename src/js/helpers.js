/** @file Shared asynchronous request helpers. */

import { TIMEOUT_SEC } from "./config.js";

/**
 * Creates a promise that rejects after a specified number of seconds.
 * @param {number} s Timeout duration in seconds.
 * @returns {Promise<never>} A promise that rejects when the timeout expires.
 */
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

/**
 * Sends a JSON GET or POST request and rejects on timeout or HTTP errors.
 * @param {string} url Request URL.
 * @param {Object} [uploadData] Optional JSON payload; when provided, sends a POST.
 * @returns {Promise<Object>} Parsed response data.
 * @throws {Error} If the request times out, fails, or returns a non-success status.
 */
export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/JSON",
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]); //Throw error after a certain amount of time
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${data.message} (${res.status})`);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

// export const getJSON = async function (url) {
//   try {
//     const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]); //Throw error after a certain amount of time
//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(`${data.message} (${res.status})`);
//     }
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };
// export const sendJSON = async function (url, uploadData) {
//   try {
//     // Send request by using fetch function
//     const res = await Promise.race([
//       fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/JSON",
//         },
//         body: JSON.stringify(uploadData),
//       }),
//       timeout(TIMEOUT_SEC),
//     ]); //Throw error after a certain amount of time
//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(`${data.message} (${res.status})`);
//     }
//     return data;
//   } catch (error) {
//     throw error;
//   }
// };
