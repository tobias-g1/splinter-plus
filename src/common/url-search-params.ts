import URLSearchParams from 'url-search-params';

/**
 * Retrieves the URL parameters from the current window's location.
 * @returns {URLSearchParams} The URL parameters as a URLSearchParams object.
 */
export const getUrlParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.search);
};
