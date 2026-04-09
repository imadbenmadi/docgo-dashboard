import PropTypes from "prop-types";

/**
 * CountryFlagCard - Renders country with actual flag SVG images
 * Uses flagcdn.com CDN for high-quality flag images
 */
export default function CountryFlagCard({
  countryCode,
  countryName,
  isSelected,
  onClick,
}) {
  const code = countryCode?.toLowerCase() || "un";

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-center ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-blue-300"
      }`}
    >
      {/* Flag image from CDN */}
      <div className="w-16 h-16 rounded-md mx-auto mb-3 overflow-hidden shadow-md flex items-center justify-center bg-gray-100">
        <img
          src={`https://flagcdn.com/256x192/${code}.png`}
          alt={countryName || countryCode}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 192'%3E%3Crect fill='%23999' width='256' height='192'/%3E%3Ctext x='128' y='96' text-anchor='middle' dy='.3em' font-size='48' fill='white' font-weight='bold'%3E${code.toUpperCase()}%3C/text%3E%3C/svg%3E`;
          }}
        />
      </div>
      <div className="text-xs font-medium text-gray-900">
        {countryName || countryCode || "Unknown"}
      </div>
      {isSelected && (
        <div className="mt-2 text-xs font-bold text-blue-600">✓ Selected</div>
      )}
    </div>
  );
}

CountryFlagCard.propTypes = {
  countryCode: PropTypes.string.isRequired,
  countryName: PropTypes.string,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

CountryFlagCard.defaultProps = {
  isSelected: false,
  onClick: () => {},
};
