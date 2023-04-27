import URLSearchParams from 'url-search-params';

export const getUrlParams = (): URLSearchParams => {
  return new URLSearchParams(window.location.search);
};
