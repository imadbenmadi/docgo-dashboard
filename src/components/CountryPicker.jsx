import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Check, Search, X } from "lucide-react";
import { COUNTRY_CODE_MAP } from "../utils/countryCodeMap";

/**
 * Choosing among ~200 countries.
 *
 * A grid of cards only worked while the list was short. It drew one card per
 * entry of COUNTRY_CODE_MAP — 32 of them — so the other 166 countries were
 * selected, counted, and impossible to see or remove.
 *
 * A list that is searched is the honest shape for this: everything is
 * reachable, the chosen ones sit at the top where they can be taken off, and
 * the box stays the same size whether the list holds thirty names or three
 * hundred.
 */

/** 🇩🇿 from "DZ" — the regional indicator letters, no image needed. */
const flagOf = (code) =>
  code && code.length === 2
    ? String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
      )
    : "🏳️";

const strip = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const CountryPicker = ({ value, onChange, options, saving, onSave }) => {
  const [query, setQuery] = useState("");

  const selected = useMemo(() => new Set(value || []), [value]);

  // Everything we know how to offer: the names already stored, plus the ones
  // we have a flag for. A country the database mentions is always listed, even
  // when it is not in our flag table.
  const all = useMemo(() => {
    const names = new Set([
      ...(options || []),
      ...(value || []),
      ...Object.keys(COUNTRY_CODE_MAP),
    ]);
    return [...names].sort((a, b) => a.localeCompare(b, "fr"));
  }, [options, value]);

  const shown = useMemo(() => {
    const q = strip(query);
    const match = q ? all.filter((c) => strip(c).includes(q)) : all;
    // Chosen first: those are the ones somebody came here to change.
    return [...match].sort((a, b) => {
      const sa = selected.has(a) ? 0 : 1;
      const sb = selected.has(b) ? 0 : 1;
      return sa - sb || a.localeCompare(b, "fr");
    });
  }, [all, query, selected]);

  const toggle = (country) => {
    const next = selected.has(country)
      ? (value || []).filter((c) => c !== country)
      : [...(value || []), country];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Chercher parmi ${all.length} pays…`}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onChange(all)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Tout cocher
        </button>
        <button
          type="button"
          onClick={() => onChange([])}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Tout décocher
        </button>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={Boolean(saving)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        )}
      </div>

      <p className="mb-2 text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{selected.size}</span> pays
        sélectionné{selected.size === 1 ? "" : "s"}
        {query ? ` · ${shown.length} résultat(s)` : ""}
      </p>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200">
        {!shown.length && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            Aucun pays ne correspond.
          </p>
        )}
        {shown.map((country) => {
          const isOn = selected.has(country);
          return (
            <button
              key={country}
              type="button"
              onClick={() => toggle(country)}
              className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-left text-sm last:border-b-0 ${
                isOn ? "bg-blue-50/60" : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  isOn
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isOn && <Check className="h-3.5 w-3.5" />}
              </span>
              <span className="text-lg leading-none">
                {flagOf(COUNTRY_CODE_MAP[country])}
              </span>
              <span className={isOn ? "font-medium text-gray-900" : "text-gray-700"}>
                {country}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

CountryPicker.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  saving: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onSave: PropTypes.func,
};

export default CountryPicker;
