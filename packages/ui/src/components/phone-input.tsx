import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "./input";
import { cn } from "../../lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  mask: string;
  placeholder: string;
}

const countries: Country[] = [
  { code: "KZ", name: "Казахстан", dialCode: "+7", flag: "🇰🇿", mask: "(###) ###-##-##", placeholder: "(700) 123-45-67" },
  { code: "RU", name: "Россия", dialCode: "+7", flag: "🇷🇺", mask: "(###) ###-##-##", placeholder: "(900) 123-45-67" },
  { code: "UZ", name: "Узбекистан", dialCode: "+998", flag: "🇺🇿", mask: "## ###-##-##", placeholder: "90 123-45-67" },
  { code: "KG", name: "Кыргызстан", dialCode: "+996", flag: "🇰🇬", mask: "### ###-###", placeholder: "555 123-456" },
  { code: "TJ", name: "Таджикистан", dialCode: "+992", flag: "🇹🇯", mask: "## ###-####", placeholder: "90 123-4567" },
  { code: "TM", name: "Туркменистан", dialCode: "+993", flag: "🇹🇲", mask: "## ##-##-##", placeholder: "65 12-34-56" },
  { code: "AZ", name: "Азербайджан", dialCode: "+994", flag: "🇦🇿", mask: "## ###-##-##", placeholder: "50 123-45-67" },
  { code: "AM", name: "Армения", dialCode: "+374", flag: "🇦🇲", mask: "## ##-##-##", placeholder: "91 12-34-56" },
  { code: "GE", name: "Грузия", dialCode: "+995", flag: "🇬🇪", mask: "### ##-##-##", placeholder: "555 12-34-56" },
  { code: "BY", name: "Беларусь", dialCode: "+375", flag: "🇧🇾", mask: "## ###-##-##", placeholder: "29 123-45-67" },
  { code: "UA", name: "Украина", dialCode: "+380", flag: "🇺🇦", mask: "## ###-##-##", placeholder: "67 123-45-67" },
  { code: "TR", name: "Турция", dialCode: "+90", flag: "🇹🇷", mask: "### ###-##-##", placeholder: "532 123-45-67" },
  { code: "ID", name: "Индонезия", dialCode: "+62", flag: "🇮🇩", mask: "### ####-####", placeholder: "812 3456-7890" },
  { code: "US", name: "США", dialCode: "+1", flag: "🇺🇸", mask: "(###) ###-####", placeholder: "(555) 123-4567" },
  { code: "GB", name: "Великобритания", dialCode: "+44", flag: "🇬🇧", mask: "#### ######", placeholder: "7911 123456" },
  { code: "DE", name: "Германия", dialCode: "+49", flag: "🇩🇪", mask: "### #######", placeholder: "151 1234567" },
  { code: "AE", name: "ОАЭ", dialCode: "+971", flag: "🇦🇪", mask: "## ###-####", placeholder: "50 123-4567" },
  { code: "CN", name: "Китай", dialCode: "+86", flag: "🇨🇳", mask: "### ####-####", placeholder: "138 1234-5678" },
  { code: "IN", name: "Индия", dialCode: "+91", flag: "🇮🇳", mask: "#####-#####", placeholder: "98765-43210" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string, fullNumber: string) => void;
  error?: string;
  className?: string;
  defaultCountry?: string;
}

export function PhoneInput({ value, onChange, error, className, defaultCountry = "KZ" }: PhoneInputProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [localValue, setLocalValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      // Sort by dial code length to match longest first (e.g., +998 before +99)
      const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
      
      // Try to match with + prefix first
      let country = sortedCountries.find(c => value.startsWith(c.dialCode));
      let phoneWithoutCode = "";
      
      if (country) {
        phoneWithoutCode = value.slice(country.dialCode.length).replace(/\D/g, '');
      } else {
        // Try to match digits with country code (without +)
        const digitsOnly = value.replace(/\D/g, '');
        for (const c of sortedCountries) {
          const dialDigits = c.dialCode.replace('+', '');
          if (digitsOnly.startsWith(dialDigits)) {
            country = c;
            phoneWithoutCode = digitsOnly.slice(dialDigits.length);
            break;
          }
        }
      }
      
      if (country) {
        setSelectedCountry(country);
        setLocalValue(applyMask(phoneWithoutCode, country.mask));
      } else {
        const digitsOnly = value.replace(/\D/g, '');
        setLocalValue(applyMask(digitsOnly, selectedCountry.mask));
      }
    } else {
      setLocalValue("");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyMask = (digits: string, mask: string): string => {
    let result = "";
    let digitIndex = 0;
    
    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
      if (mask[i] === "#") {
        result += digits[digitIndex];
        digitIndex++;
      } else {
        result += mask[i];
        if (digits[digitIndex] === mask[i]) {
          digitIndex++;
        }
      }
    }
    
    return result;
  };

  const getMaxDigits = (mask: string): number => {
    return (mask.match(/#/g) || []).length;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digits = inputValue.replace(/\D/g, '');
    const maxDigits = getMaxDigits(selectedCountry.mask);
    const limitedDigits = digits.slice(0, maxDigits);
    const formatted = applyMask(limitedDigits, selectedCountry.mask);
    
    setLocalValue(formatted);
    
    const fullNumber = selectedCountry.dialCode + limitedDigits;
    onChange(formatted, fullNumber);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    
    const digits = localValue.replace(/\D/g, '');
    const maxDigits = getMaxDigits(country.mask);
    const limitedDigits = digits.slice(0, maxDigits);
    const formatted = applyMask(limitedDigits, country.mask);
    
    setLocalValue(formatted);
    
    const fullNumber = country.dialCode + limitedDigits;
    onChange(formatted, fullNumber);
    
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex rounded-md border transition-colors",
        error ? "border-red-500 focus-within:ring-red-500" : "border-input focus-within:ring-ring",
        "focus-within:ring-2 focus-within:ring-offset-0"
      )}>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-10 bg-muted/50 rounded-l-md border-r border-input",
              "hover:bg-muted transition-colors min-w-[100px]"
            )}
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-500 transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 max-h-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <Input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left",
                      selectedCountry.code === country.code && "bg-blue-50"
                    )}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.dialCode}</div>
                    </div>
                    {selectedCountry.code === country.code && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    {t('noResults')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <Input
          ref={inputRef}
          type="tel"
          value={localValue}
          onChange={handleInputChange}
          placeholder={selectedCountry.placeholder}
          className={cn(
            "flex-1 border-0 rounded-l-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "text-base tracking-wide"
          )}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

export function parsePhoneNumber(phone: string): { countryCode: string; number: string } | null {
  if (!phone) return null;
  
  for (const country of countries.sort((a, b) => b.dialCode.length - a.dialCode.length)) {
    if (phone.startsWith(country.dialCode)) {
      return {
        countryCode: country.dialCode,
        number: phone.slice(country.dialCode.length)
      };
    }
  }
  
  return { countryCode: "", number: phone };
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone) return "";
  
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Sort countries by dialCode length (longest first) for accurate matching
  const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
  
  // First try matching with + prefix
  for (const country of sortedCountries) {
    if (phone.startsWith(country.dialCode)) {
      const digits = phone.slice(country.dialCode.length).replace(/\D/g, '');
      return formatWithMask(digits, country);
    }
  }
  
  // Try matching digits with country code (without +)
  for (const country of sortedCountries) {
    const dialDigits = country.dialCode.replace('+', '');
    if (digitsOnly.startsWith(dialDigits)) {
      const digits = digitsOnly.slice(dialDigits.length);
      return formatWithMask(digits, country);
    }
  }
  
  // Fallback: return as-is with + if it looks like a full number
  if (digitsOnly.length >= 10) {
    return `+${digitsOnly}`;
  }
  
  return phone;
}

function formatWithMask(digits: string, country: Country): string {
  let result = "";
  let digitIndex = 0;
  
  for (let i = 0; i < country.mask.length && digitIndex < digits.length; i++) {
    if (country.mask[i] === "#") {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += country.mask[i];
    }
  }
  
  return `${country.dialCode} ${result}`;
}

export { countries };
