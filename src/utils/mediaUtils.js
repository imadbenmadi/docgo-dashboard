// Media URL utilities
import { getApiBaseUrl } from "./apiBaseUrl";

const getBaseURL = () => {
  return getApiBaseUrl();
};

export const getMediaURL = (path) => {
  if (!path) return null;

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // If it starts with a slash, prepend the base URL
  if (path.startsWith("/")) {
    return `${getBaseURL()}${path}`;
  }

  // Otherwise, add slash and base URL
  return `${getBaseURL()}/${path}`;
};

export const getVideoURL = (video) => {
  return getMediaURL(video.VideoUrl || video.video);
};

export const getImage = (ImagePath) => {
  return getMediaURL(ImagePath);
};

export const getCourseImage = (course) => {
  return getMediaURL(course.Image || course.Image);
};

export const getCourseCoverURL = (course) => {
  return getMediaURL(course.coverImage);
};
