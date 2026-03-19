"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, X, Loader2 } from "lucide-react";

interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Ex: 10 Rue de la République, 75001 Paris" 
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/address-search?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) throw new Error("Erreur de recherche");

      const data = await response.json();
      const formattedResults: AddressResult[] = (data.results || [])
        .filter((f: any) => f.display_name && f.lat && f.lon)
        .map((f: any) => ({
          display_name: f.display_name || "",
          lat: f.lat || "",
          lon: f.lon || "",
          type: f.type || "",
        }));
      
      setResults(formattedResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Erreur recherche adresse:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 300);
  };

  const handleSelect = (result: AddressResult) => {
    const name = result.display_name || "";
    setQuery(name);
    onChange(name);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const formatAddress = (address: string) => {
    const parts = address.split(", ");
    if (parts.length > 3) {
      return {
        main: parts.slice(0, 2).join(", "),
        details: parts.slice(2).join(", "),
      };
    }
    return {
      main: address,
      details: "",
    };
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
        )}
        {!loading && query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {results.length} suggestion{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
            </p>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {results.map((result, index) => {
              const displayName = result.display_name || "";
              const formatted = formatAddress(displayName);
              return (
                <li key={index}>
                  <button
                    onClick={() => handleSelect(result)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                      index === selectedIndex 
                        ? "bg-indigo-50" 
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      index === selectedIndex ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${
                        index === selectedIndex ? "text-indigo-700" : "text-slate-700"
                      }`}>
                        {formatted.main}
                      </p>
                      {formatted.details && (
                        <p className="text-sm text-slate-500 truncate">{formatted.details}</p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Données fournies par{" "}
              <span className="font-semibold">OpenStreetMap</span>
            </p>
          </div>
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-4 text-center">
          <p className="text-slate-500 text-sm">Aucune adresse trouvée</p>
        </div>
      )}
    </div>
  );
}
