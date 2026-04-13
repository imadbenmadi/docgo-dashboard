import PropTypes from "prop-types";
import ImageWithFallback from "./ImageWithFallback";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://backend.healthpathglobal.com";

const resolveAvatarSrc = (src) => {
  if (!src) return null;
  const value = String(src);
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("blob:")) return value;

  if (value.startsWith("/")) return `${API_URL}${value}`;
  return `${API_URL}/${value}`;
};

const UserAvatar = ({
  src,
  name,
  size = 36,
  className = "",
  imgClassName = "",
  title,
}) => {
  const resolved = resolveAvatarSrc(src);
  const alt = name ? `${name} profile picture` : "User profile picture";

  return (
    <ImageWithFallback
      type="user"
      src={resolved}
      alt={alt}
      title={title || name || undefined}
      className={`rounded-full object-cover bg-gray-100 border border-gray-200 ${className} ${imgClassName}`}
      style={{ width: size, height: size }}
    />
  );
};

UserAvatar.propTypes = {
  src: PropTypes.oneOfType([PropTypes.string, PropTypes.null]),
  name: PropTypes.string,
  size: PropTypes.number,
  className: PropTypes.string,
  imgClassName: PropTypes.string,
  title: PropTypes.string,
};

export default UserAvatar;
export { resolveAvatarSrc };
