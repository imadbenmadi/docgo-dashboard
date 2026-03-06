import { ArrowLeft, GraduationCap, Save, Upload, X } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import programsAPI from "../../API/Programs";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";
import {
  ValidationErrorPanel,
  ValidationSuccessBanner,
} from "../../components/Common/FormValidation";
import { useFormValidation } from "../../components/Common/FormValidation/useFormValidation";

const AddProgram = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ImageFile, setImageFile] = useState(null);
  const [ImagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  // Shared validation panel
  const {
    errors: validationErrors,
    warnings: validationWarnings,
    showPanel: showValidationPanel,
    showSuccess: showValidationSuccess,
    validate: runValidation,
    hidePanel: hideValidationPanel,
  } = useFormValidation();

  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    short_description: "",
    short_description_ar: "",
    description: "",
    description_ar: "",
    programType: "scholarship",
    category: "",
    category_ar: "",
    organization: "",
    organization_ar: "",
    Price: "",
    discountPrice: "",
    scholarshipAmount: "",
    paymentFrequency: "one-time",
    currency: "DZD",
    status: "open",
    isActive: true,
    isFeatured: false,
    applicationStartDate: "",
    applicationDeadline: "",
    programStartDate: "",
    programEndDate: "",
    totalSlots: 9000000,
    availableSlots: 9000000,
    contactPhone: "",
    location: "",
    country: "",
    language: "French",
    tags: "",
    isRemote: false,
    // Additional fields expected by backend
    eligibilityCriteria: "",
    eligibilityCriteria_ar: "",
    benefits: "",
    benefits_ar: "",
    applicationProcess: "",
    applicationProcess_ar: "",
    requiredDocuments: "",
    requiredDocuments_ar: "",
    contactEmail: "",
    website: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Tag management state
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  // Suggested tags
  const suggestedTags = [
    "sciences",
    "recherche",
    "doctorat",
    "master",
    "licence",
    "technologie",
    "médecine",
    "ingénierie",
    "arts",
    "littérature",
    "économie",
    "business",
    "international",
    "bourse complète",
    "stage",
    "fellowship",
  ];

  // Countries list
  const countries = [
    { value: "", label: "Sélectionnez un pays" },
    { value: "AF", label: "🇦🇫 Afghanistan" },
    { value: "ZA", label: "🇿🇦 Afrique du Sud" },
    { value: "AL", label: "🇦🇱 Albanie" },
    { value: "DZ", label: "🇩🇿 Algérie" },
    { value: "DE", label: "🇩🇪 Allemagne" },
    { value: "AD", label: "🇦🇩 Andorre" },
    { value: "AO", label: "🇦🇴 Angola" },
    { value: "AI", label: "🇦🇮 Anguilla" },
    { value: "AQ", label: "🇦🇶 Antarctique" },
    { value: "AG", label: "🇦🇬 Antigua-et-Barbuda" },
    { value: "SA", label: "🇸🇦 Arabie saoudite" },
    { value: "AR", label: "🇦🇷 Argentine" },
    { value: "AM", label: "🇦🇲 Arménie" },
    { value: "AW", label: "🇦🇼 Aruba" },
    { value: "AU", label: "🇦🇺 Australie" },
    { value: "AT", label: "🇦🇹 Autriche" },
    { value: "AZ", label: "🇦🇿 Azerbaïdjan" },
    { value: "BS", label: "🇧🇸 Bahamas" },
    { value: "BH", label: "🇧🇭 Bahreïn" },
    { value: "BD", label: "🇧🇩 Bangladesh" },
    { value: "BB", label: "🇧🇧 Barbade" },
    { value: "BY", label: "🇧🇾 Bélarus" },
    { value: "BE", label: "🇧🇪 Belgique" },
    { value: "BZ", label: "🇧🇿 Belize" },
    { value: "BJ", label: "🇧🇯 Bénin" },
    { value: "BM", label: "🇧🇲 Bermudes" },
    { value: "BT", label: "🇧🇹 Bhoutan" },
    { value: "BO", label: "🇧🇴 Bolivie" },
    { value: "BA", label: "🇧🇦 Bosnie-Herzégovine" },
    { value: "BW", label: "🇧🇼 Botswana" },
    { value: "BR", label: "🇧🇷 Brésil" },
    { value: "BN", label: "🇧🇳 Brunei" },
    { value: "BG", label: "🇧🇬 Bulgarie" },
    { value: "BF", label: "🇧🇫 Burkina Faso" },
    { value: "BI", label: "🇧🇮 Burundi" },
    { value: "KH", label: "🇰🇭 Cambodge" },
    { value: "CM", label: "🇨🇲 Cameroun" },
    { value: "CA", label: "🇨🇦 Canada" },
    { value: "CV", label: "🇨🇻 Cap-Vert" },
    { value: "CL", label: "🇨🇱 Chili" },
    { value: "CN", label: "🇨🇳 Chine" },
    { value: "CY", label: "🇨🇾 Chypre" },
    { value: "CO", label: "🇨🇴 Colombie" },
    { value: "KM", label: "🇰🇲 Comores" },
    { value: "CG", label: "🇨🇬 Congo" },
    { value: "CD", label: "🇨🇩 Congo (RDC)" },
    { value: "KR", label: "🇰🇷 Corée du Sud" },
    { value: "KP", label: "🇰🇵 Corée du Nord" },
    { value: "CR", label: "🇨🇷 Costa Rica" },
    { value: "CI", label: "🇨🇮 Côte d'Ivoire" },
    { value: "HR", label: "🇭🇷 Croatie" },
    { value: "CU", label: "🇨🇺 Cuba" },
    { value: "DK", label: "🇩🇰 Danemark" },
    { value: "DJ", label: "🇩🇯 Djibouti" },
    { value: "DM", label: "🇩🇲 Dominique" },
    { value: "EG", label: "🇪🇬 Égypte" },
    { value: "AE", label: "🇦🇪 Émirats arabes unis" },
    { value: "EC", label: "🇪🇨 Équateur" },
    { value: "ER", label: "🇪🇷 Érythrée" },
    { value: "ES", label: "🇪🇸 Espagne" },
    { value: "EE", label: "🇪🇪 Estonie" },
    { value: "US", label: "🇺🇸 États-Unis" },
    { value: "ET", label: "🇪🇹 Éthiopie" },
    { value: "FJ", label: "🇫🇯 Fidji" },
    { value: "FI", label: "🇫🇮 Finlande" },
    { value: "FR", label: "🇫🇷 France" },
    { value: "GA", label: "🇬🇦 Gabon" },
    { value: "GM", label: "🇬🇲 Gambie" },
    { value: "GE", label: "🇬🇪 Géorgie" },
    { value: "GH", label: "🇬🇭 Ghana" },
    { value: "GI", label: "🇬🇮 Gibraltar" },
    { value: "GR", label: "🇬🇷 Grèce" },
    { value: "GD", label: "🇬🇩 Grenade" },
    { value: "GL", label: "🇬🇱 Groenland" },
    { value: "GP", label: "🇬🇵 Guadeloupe" },
    { value: "GU", label: "🇬🇺 Guam" },
    { value: "GT", label: "🇬🇹 Guatemala" },
    { value: "GN", label: "🇬🇳 Guinée" },
    { value: "GW", label: "🇬🇼 Guinée-Bissau" },
    { value: "GQ", label: "🇬🇶 Guinée équatoriale" },
    { value: "GY", label: "🇬🇾 Guyana" },
    { value: "GF", label: "🇬🇫 Guyane française" },
    { value: "HT", label: "🇭🇹 Haïti" },
    { value: "HN", label: "🇭🇳 Honduras" },
    { value: "HK", label: "🇭🇰 Hong Kong" },
    { value: "HU", label: "🇭🇺 Hongrie" },
    { value: "BV", label: "🇧🇻 Île Bouvet" },
    { value: "CX", label: "🇨🇽 Île Christmas" },
    { value: "NF", label: "🇳🇫 Île Norfolk" },
    { value: "IM", label: "🇮🇲 Île de Man" },
    { value: "KY", label: "🇰🇾 Îles Caïmans" },
    { value: "CC", label: "🇨🇨 Îles Cocos" },
    { value: "CK", label: "🇨🇰 Îles Cook" },
    { value: "FO", label: "🇫🇴 Îles Féroé" },
    { value: "FK", label: "🇫🇰 Îles Malouines" },
    { value: "MP", label: "🇲🇵 Îles Mariannes du Nord" },
    { value: "MH", label: "🇲🇭 Îles Marshall" },
    { value: "SB", label: "🇸🇧 Îles Salomon" },
    { value: "TC", label: "🇹🇨 Îles Turks-et-Caïcos" },
    { value: "VG", label: "🇻🇬 Îles Vierges britanniques" },
    { value: "VI", label: "🇻🇮 Îles Vierges américaines" },
    { value: "IN", label: "🇮🇳 Inde" },
    { value: "ID", label: "🇮🇩 Indonésie" },
    { value: "IQ", label: "🇮🇶 Irak" },
    { value: "IR", label: "🇮🇷 Iran" },
    { value: "IE", label: "🇮🇪 Irlande" },
    { value: "IS", label: "🇮🇸 Islande" },
    { value: "IL", label: "🇮🇱 Israël" },
    { value: "IT", label: "🇮🇹 Italie" },
    { value: "JM", label: "🇯🇲 Jamaïque" },
    { value: "JP", label: "🇯🇵 Japon" },
    { value: "JE", label: "🇯🇪 Jersey" },
    { value: "JO", label: "🇯🇴 Jordanie" },
    { value: "KZ", label: "🇰🇿 Kazakhstan" },
    { value: "KE", label: "🇰🇪 Kenya" },
    { value: "KG", label: "🇰🇬 Kirghizistan" },
    { value: "KI", label: "🇰🇮 Kiribati" },
    { value: "KW", label: "🇰🇼 Koweït" },
    { value: "LA", label: "🇱🇦 Laos" },
    { value: "LS", label: "🇱🇸 Lesotho" },
    { value: "LV", label: "🇱🇻 Lettonie" },
    { value: "LB", label: "🇱🇧 Liban" },
    { value: "LR", label: "🇱🇷 Liberia" },
    { value: "LY", label: "🇱🇾 Libye" },
    { value: "LI", label: "🇱🇮 Liechtenstein" },
    { value: "LT", label: "🇱🇹 Lituanie" },
    { value: "LU", label: "🇱🇺 Luxembourg" },
    { value: "MO", label: "🇲🇴 Macao" },
    { value: "MK", label: "🇲🇰 Macédoine du Nord" },
    { value: "MG", label: "🇲🇬 Madagascar" },
    { value: "MY", label: "🇲🇾 Malaisie" },
    { value: "MW", label: "🇲🇼 Malawi" },
    { value: "MV", label: "🇲🇻 Maldives" },
    { value: "ML", label: "🇲🇱 Mali" },
    { value: "MT", label: "🇲🇹 Malte" },
    { value: "MA", label: "🇲🇦 Maroc" },
    { value: "MQ", label: "🇲🇶 Martinique" },
    { value: "MU", label: "🇲🇺 Maurice" },
    { value: "MR", label: "🇲🇷 Mauritanie" },
    { value: "YT", label: "🇾🇹 Mayotte" },
    { value: "MX", label: "🇲🇽 Mexique" },
    { value: "FM", label: "🇫🇲 Micronésie" },
    { value: "MD", label: "🇲🇩 Moldavie" },
    { value: "MC", label: "🇲🇨 Monaco" },
    { value: "MN", label: "🇲🇳 Mongolie" },
    { value: "ME", label: "🇲🇪 Monténégro" },
    { value: "MS", label: "🇲🇸 Montserrat" },
    { value: "MZ", label: "🇲🇿 Mozambique" },
    { value: "MM", label: "🇲🇲 Myanmar" },
    { value: "NA", label: "🇳🇦 Namibie" },
    { value: "NR", label: "🇳🇷 Nauru" },
    { value: "NP", label: "🇳🇵 Népal" },
    { value: "NI", label: "🇳🇮 Nicaragua" },
    { value: "NE", label: "🇳🇪 Niger" },
    { value: "NG", label: "🇳🇬 Nigeria" },
    { value: "NU", label: "🇳🇺 Niue" },
    { value: "NO", label: "🇳🇴 Norvège" },
    { value: "NC", label: "🇳🇨 Nouvelle-Calédonie" },
    { value: "NZ", label: "🇳🇿 Nouvelle-Zélande" },
    { value: "OM", label: "🇴🇲 Oman" },
    { value: "UG", label: "🇺🇬 Ouganda" },
    { value: "UZ", label: "🇺🇿 Ouzbékistan" },
    { value: "PK", label: "🇵🇰 Pakistan" },
    { value: "PW", label: "🇵🇼 Palaos" },
    { value: "PS", label: "🇵🇸 Palestine" },
    { value: "PA", label: "🇵🇦 Panama" },
    { value: "PG", label: "🇵🇬 Papouasie-Nouvelle-Guinée" },
    { value: "PY", label: "🇵🇾 Paraguay" },
    { value: "NL", label: "🇳🇱 Pays-Bas" },
    { value: "PE", label: "🇵🇪 Pérou" },
    { value: "PH", label: "🇵🇭 Philippines" },
    { value: "PN", label: "🇵🇳 Pitcairn" },
    { value: "PL", label: "🇵🇱 Pologne" },
    { value: "PF", label: "🇵🇫 Polynésie française" },
    { value: "PR", label: "🇵🇷 Porto Rico" },
    { value: "PT", label: "🇵🇹 Portugal" },
    { value: "QA", label: "🇶🇦 Qatar" },
    { value: "RE", label: "🇷🇪 Réunion" },
    { value: "RO", label: "🇷🇴 Roumanie" },
    { value: "GB", label: "🇬🇧 Royaume-Uni" },
    { value: "RU", label: "🇷🇺 Russie" },
    { value: "RW", label: "🇷🇼 Rwanda" },
    { value: "EH", label: "🇪🇭 Sahara occidental" },
    { value: "BL", label: "🇧🇱 Saint-Barthélemy" },
    { value: "KN", label: "🇰🇳 Saint-Kitts-et-Nevis" },
    { value: "SM", label: "🇸🇲 Saint-Marin" },
    { value: "MF", label: "🇲🇫 Saint-Martin" },
    { value: "PM", label: "🇵🇲 Saint-Pierre-et-Miquelon" },
    { value: "VA", label: "🇻🇦 Saint-Siège" },
    { value: "VC", label: "🇻🇨 Saint-Vincent-et-les-Grenadines" },
    { value: "LC", label: "🇱🇨 Sainte-Lucie" },
    { value: "SH", label: "🇸🇭 Sainte-Hélène" },
    { value: "SV", label: "🇸🇻 Salvador" },
    { value: "WS", label: "🇼🇸 Samoa" },
    { value: "AS", label: "🇦🇸 Samoa américaines" },
    { value: "ST", label: "🇸🇹 Sao Tomé-et-Principe" },
    { value: "SN", label: "🇸🇳 Sénégal" },
    { value: "RS", label: "🇷🇸 Serbie" },
    { value: "SC", label: "🇸🇨 Seychelles" },
    { value: "SL", label: "🇸🇱 Sierra Leone" },
    { value: "SG", label: "🇸🇬 Singapour" },
    { value: "SK", label: "🇸🇰 Slovaquie" },
    { value: "SI", label: "🇸🇮 Slovénie" },
    { value: "SO", label: "🇸🇴 Somalie" },
    { value: "SD", label: "🇸🇩 Soudan" },
    { value: "SS", label: "🇸🇸 Soudan du Sud" },
    { value: "LK", label: "🇱🇰 Sri Lanka" },
    { value: "SE", label: "🇸🇪 Suède" },
    { value: "CH", label: "🇨🇭 Suisse" },
    { value: "SR", label: "🇸🇷 Suriname" },
    { value: "SJ", label: "🇸🇯 Svalbard et Jan Mayen" },
    { value: "SZ", label: "🇸🇿 Eswatini" },
    { value: "SY", label: "🇸🇾 Syrie" },
    { value: "TJ", label: "🇹🇯 Tadjikistan" },
    { value: "TW", label: "🇹🇼 Taïwan" },
    { value: "TZ", label: "🇹🇿 Tanzanie" },
    { value: "TD", label: "🇹🇩 Tchad" },
    { value: "CZ", label: "🇨🇿 Tchéquie" },
    { value: "TF", label: "🇹🇫 Terres australes françaises" },
    { value: "IO", label: "🇮🇴 Territoire britannique de l'océan Indien" },
    { value: "TH", label: "🇹🇭 Thaïlande" },
    { value: "TL", label: "🇹🇱 Timor oriental" },
    { value: "TG", label: "🇹🇬 Togo" },
    { value: "TK", label: "🇹🇰 Tokelau" },
    { value: "TO", label: "🇹🇴 Tonga" },
    { value: "TT", label: "🇹🇹 Trinité-et-Tobago" },
    { value: "TN", label: "🇹🇳 Tunisie" },
    { value: "TM", label: "🇹🇲 Turkménistan" },
    { value: "TR", label: "🇹🇷 Turquie" },
    { value: "TV", label: "🇹🇻 Tuvalu" },
    { value: "UA", label: "🇺🇦 Ukraine" },
    { value: "UY", label: "🇺🇾 Uruguay" },
    { value: "VU", label: "🇻🇺 Vanuatu" },
    { value: "VE", label: "🇻🇪 Venezuela" },
    { value: "VN", label: "🇻🇳 Vietnam" },
    { value: "WF", label: "🇼🇫 Wallis-et-Futuna" },
    { value: "YE", label: "🇾🇪 Yémen" },
    { value: "ZM", label: "🇿🇲 Zambie" },
    { value: "ZW", label: "🇿🇼 Zimbabwe" },
  ];

  // Tag management functions
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setFormData((prev) => ({
        ...prev,
        tags: newTags.join(", "),
      }));
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    setFormData((prev) => ({
      ...prev,
      tags: newTags.join(", "),
    }));
  };

  const addSuggestedTag = (suggestedTag) => {
    if (!tags.includes(suggestedTag)) {
      const newTags = [...tags, suggestedTag];
      setTags(newTags);
      setFormData((prev) => ({
        ...prev,
        tags: newTags.join(", "),
      }));
    }
  };

  const validateFormWithToast = () => {
    const rules = [
      {
        field: "Titre fran\u00e7ais",
        message: "Le titre fran\u00e7ais est requis",
        section: "Informations de base",
        scrollToId: "program-title",
        type: "error",
        condition: () => !formData.title.trim(),
      },
      {
        field: "Description",
        message: "La description fran\u00e7aise est requise",
        section: "Informations de base",
        scrollToId: "program-description",
        type: "error",
        condition: () => !formData.description.trim(),
      },
      {
        field: "Organisation",
        message: "L'organisation est requise",
        section: "Informations de base",
        scrollToId: "program-organization",
        type: "error",
        condition: () => !formData.organization.trim(),
      },
      {
        field: "Date limite de candidature",
        message:
          "La date limite doit \u00eatre apr\u00e8s la date de d\u00e9but des candidatures",
        section: "Dates",
        scrollToId: "program-deadline",
        type: "error",
        condition: () =>
          !!(
            formData.applicationDeadline &&
            formData.applicationStartDate &&
            new Date(formData.applicationDeadline) <=
              new Date(formData.applicationStartDate)
          ),
      },
      {
        field: "Date de fin du programme",
        message:
          "La date de fin doit \u00eatre apr\u00e8s la date de d\u00e9but du programme",
        section: "Dates",
        scrollToId: "program-end-date",
        type: "error",
        condition: () =>
          !!(
            formData.programEndDate &&
            formData.programStartDate &&
            new Date(formData.programEndDate) <=
              new Date(formData.programStartDate)
          ),
      },
      {
        field: "Montant de la bourse",
        message: "Le montant de la bourse ne peut pas \u00eatre n\u00e9gatif",
        section: "Tarification",
        scrollToId: "program-scholarship",
        type: "error",
        condition: () =>
          !!(
            formData.scholarshipAmount &&
            parseFloat(formData.scholarshipAmount) < 0
          ),
      },
      {
        field: "Prix du programme",
        message: "Le prix du programme ne peut pas \u00eatre n\u00e9gatif",
        section: "Tarification",
        scrollToId: "program-price",
        type: "error",
        condition: () => !!(formData.Price && parseFloat(formData.Price) < 0),
      },
      {
        field: "Prix r\u00e9duit",
        message:
          "Le prix r\u00e9duit doit \u00eatre inf\u00e9rieur au prix normal",
        section: "Tarification",
        scrollToId: "program-discount",
        type: "error",
        condition: () =>
          !!(
            formData.Price &&
            formData.discountPrice &&
            parseFloat(formData.discountPrice) >= parseFloat(formData.Price)
          ),
      },
    ];

    return runValidation(rules);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      // Only accept browser-native containers
      if (
        !ALLOWED_VIDEO_TYPES.includes(file.type) ||
        !ALLOWED_VIDEO_EXTENSIONS.includes(ext)
      ) {
        toast.error(
          `Format vidéo non supporté "${ext}". Utilisez MP4, WebM ou MOV. MKV, AVI et WMV ne sont pas compatibles avec les navigateurs.`,
        );
        e.target.value = "";
        return;
      }

      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("La taille du fichier vidéo ne doit pas dépasser 100MB");
        e.target.value = "";
        return;
      }

      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("L'Image ne doit pas dépasser 5MB", {
          duration: 4000,
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
          },
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFormWithToast()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare form data
      const programData = {
        title: formData.title,
        title_ar: formData.title_ar || "",
        description: formData.description,
        description_ar: formData.description_ar || "",
        short_description: formData.short_description || "",
        short_description_ar: formData.short_description_ar || "",
        organization: formData.organization || "",
        organization_ar: formData.organization_ar || "",
        category: formData.category || "",
        category_ar: formData.category_ar || "",
        programType: formData.programType,
        Price: formData.Price ? parseFloat(formData.Price) : 0,
        discountPrice: formData.discountPrice
          ? parseFloat(formData.discountPrice)
          : null,
        scholarshipAmount: formData.scholarshipAmount
          ? parseFloat(formData.scholarshipAmount)
          : null,
        currency: formData.currency,
        paymentFrequency: formData.paymentFrequency,
        status: formData.status,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        applicationStartDate: formData.applicationStartDate || null,
        applicationDeadline: formData.applicationDeadline || null,
        programStartDate: formData.programStartDate || null,
        programEndDate: formData.programEndDate || null,
        totalSlots: 9000000,
        availableSlots: 9000000,
        eligibilityCriteria: formData.eligibilityCriteria || "",
        eligibilityCriteria_ar: formData.eligibilityCriteria_ar || "",
        benefits: formData.benefits || "",
        benefits_ar: formData.benefits_ar || "",
        applicationProcess: formData.applicationProcess || "",
        applicationProcess_ar: formData.applicationProcess_ar || "",
        requiredDocuments: formData.requiredDocuments || "",
        requiredDocuments_ar: formData.requiredDocuments_ar || "",
        contactEmail: formData.contactEmail || "",
        contactPhone: formData.contactPhone || "",
        website: formData.website || "",
        location: formData.location || "",
        country: formData.country || "",
        language: formData.language,
        isRemote: formData.isRemote,
        tags: formData.tags || "",
        metaTitle: formData.metaTitle || "",
        metaDescription: formData.metaDescription || "",
        metaKeywords: formData.metaKeywords || "",
      };

      // DEBUG: Log complete program data before sending
      console.log("=== CREATING PROGRAM - DATA BEING SENT ===");
      console.log(
        "Full programData object:",
        JSON.stringify(programData, null, 2),
      );
      console.log("programType value:", programData.programType);
      console.log("programType type:", typeof programData.programType);
      console.log("==========================================");

      // Create program
      const response = await programsAPI.createProgram(programData);

      if (response.success) {
        let hasImageError = false;
        let hasVideoError = false;

        // Upload Image if provided
        if (ImageFile && response.program?.id) {
          try {
            const ImageFormData = new FormData();
            ImageFormData.append("Image", ImageFile);
            await programsAPI.uploadProgramImage(
              response.program.id,
              ImageFormData,
            );
          } catch (ImageError) {
            console.error("Error uploading Image:", ImageError);
            hasImageError = true;
          }
        }

        // Upload video if provided
        if (videoFile && response.program?.id) {
          try {
            const videoFormData = new FormData();
            videoFormData.append("video", videoFile);
            await programsAPI.uploadProgramVideo(
              response.program.id,
              videoFormData,
            );
          } catch (videoError) {
            console.error("Error uploading video:", videoError);
            hasVideoError = true;
          }
        }

        // Show appropriate success message
        if (hasImageError || hasVideoError) {
          const errorDetails = [];
          if (hasImageError) errorDetails.push("Image");
          if (hasVideoError) errorDetails.push("vidéo");

          toast.success(
            `Programme créé (erreur upload ${errorDetails.join(" et ")})`,
            {
              duration: 3000,
              style: {
                background: "#FEF3C7",
                color: "#D97706",
                border: "1px solid #FDE68A",
                borderRadius: "12px",
              },
            },
          );
        } else {
          const uploadedItems = [];
          if (ImageFile) uploadedItems.push("Image");
          if (videoFile) uploadedItems.push("vidéo");

          const message =
            uploadedItems.length > 0
              ? `Programme créé avec ${uploadedItems.join(" et ")}`
              : "Programme créé avec succès";

          toast.success(message, {
            duration: 3000,
            style: {
              background: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "500",
            },
            iconTheme: {
              primary: "#166534",
              secondary: "#F0FDF4",
            },
          });
        }

        // Navigate back to programs list
        setTimeout(() => {
          navigate("/Programs");
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating program:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création du programme",
        {
          duration: 4000,
          style: {
            background: "#FEF2F2",
            color: "#DC2626",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
          },
        },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Annuler la création ?
              </h3>
              <p className="text-sm text-gray-600">
                Toutes les données saisies seront perdues.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate("/Programs");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              Continuer
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "white",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6">
      <Toaster position="top-right" />
      {/* Validation Panel */}
      <ValidationErrorPanel
        errors={validationErrors}
        warnings={validationWarnings}
        isVisible={showValidationPanel}
        onClose={hideValidationPanel}
        title="Champs requis manquants"
      />
      <ValidationSuccessBanner isVisible={showValidationSuccess} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Nouveau Programme
            </h1>
            <p className="text-gray-600">
              Créez un nouveau programme de bourse
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Informations de base
              </h2>
            </div>

            <div className="space-y-6">
              {/* Title Field */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <label className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Titre du programme
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="program-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
                  placeholder="Nom du programme de bourse"
                  required
                />
              </div>

              {/* Short Description Field */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <label className="flex items-center gap-2 text-sm font-medium text-purple-800 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  Description courte
                </label>
                <input
                  type="text"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-300"
                  placeholder="Résumé en une ligne"
                  maxLength={150}
                />
              </div>

              {/* Organization Field */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                <label className="flex items-center gap-2 text-sm font-medium text-emerald-800 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Organisation
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="program-organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 hover:border-emerald-300"
                  placeholder="Nom de l'organisation"
                  required
                />
              </div>

              {/* Category Field */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Catégorie
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 bg-white/80 backdrop-blur-sm border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 hover:border-amber-300"
                  placeholder="Sciences, Arts, Technologie..."
                />
              </div>
            </div>

            {/* Program Type Selection */}
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Type de programme
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sélectionnez le type qui correspond le mieux à votre
                    programme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    value: "scholarship",
                    label: "Bourse d'études",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
                    ),
                    bgColor: "from-emerald-400 to-green-500",
                    bgLight: "bg-emerald-50",
                    borderColor: "border-emerald-200",
                    borderActiveColor: "border-emerald-500",
                    textColor: "text-emerald-600",
                  },
                  {
                    value: "grant",
                    label: "Subvention",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    ),
                    bgColor: "from-blue-400 to-indigo-500",
                    bgLight: "bg-blue-50",
                    borderColor: "border-blue-200",
                    borderActiveColor: "border-blue-500",
                    textColor: "text-blue-600",
                  },
                  {
                    value: "fellowship",
                    label: "Fellowship",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ),
                    bgColor: "from-purple-400 to-pink-500",
                    bgLight: "bg-purple-50",
                    borderColor: "border-purple-200",
                    borderActiveColor: "border-purple-500",
                    textColor: "text-purple-600",
                  },
                  {
                    value: "internship",
                    label: "Stage",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2V6"
                        />
                      </svg>
                    ),
                    bgColor: "from-orange-400 to-red-500",
                    bgLight: "bg-orange-50",
                    borderColor: "border-orange-200",
                    borderActiveColor: "border-orange-500",
                    textColor: "text-orange-600",
                  },
                ].map((type) => (
                  <div
                    key={type.value}
                    onClick={() =>
                      handleInputChange({
                        target: {
                          name: "programType",
                          value: type.value,
                        },
                      })
                    }
                    className={`relative cursor-pointer group transition-all duration-300 ${
                      formData.programType === type.value
                        ? `${type.bgLight} ${type.borderActiveColor} border-2 shadow-lg transform scale-105`
                        : `bg-white ${type.borderColor} border hover:shadow-md hover:scale-102`
                    } rounded-xl p-6 flex flex-col items-center text-center space-y-3`}
                  >
                    {/* Selection Indicator */}
                    {formData.programType === type.value && (
                      <div
                        className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${type.bgColor} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                        type.bgColor
                      } flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                        formData.programType === type.value
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <div className="text-white">{type.icon}</div>
                    </div>

                    {/* Label */}
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-200 ${
                          formData.programType === type.value
                            ? type.textColor
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {type.label}
                      </h4>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div
                      className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                        formData.programType === type.value
                          ? "opacity-0"
                          : "opacity-0 group-hover:opacity-5 bg-gray-900"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Statut du programme
                  </h3>
                  <p className="text-sm text-gray-600">
                    Définissez l&apos;état actuel de votre programme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    value: "draft",
                    label: "Brouillon",
                    description: "En préparation",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    ),
                    bgColor: "from-gray-400 to-slate-500",
                    bgLight: "bg-gray-50",
                    borderColor: "border-gray-200",
                    borderActiveColor: "border-gray-500",
                    textColor: "text-gray-600",
                  },
                  {
                    value: "open",
                    label: "Ouvert",
                    description: "Candidatures actives",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        />
                      </svg>
                    ),
                    bgColor: "from-green-400 to-emerald-500",
                    bgLight: "bg-green-50",
                    borderColor: "border-green-200",
                    borderActiveColor: "border-green-500",
                    textColor: "text-green-600",
                  },
                  {
                    value: "closed",
                    label: "Fermé",
                    description: "Candidatures closes",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    ),
                    bgColor: "from-red-400 to-rose-500",
                    bgLight: "bg-red-50",
                    borderColor: "border-red-200",
                    borderActiveColor: "border-red-500",
                    textColor: "text-red-600",
                  },
                  {
                    value: "coming_soon",
                    label: "Bientôt",
                    description: "Prochainement disponible",
                    icon: (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    bgColor: "from-yellow-400 to-orange-500",
                    bgLight: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                    borderActiveColor: "border-yellow-500",
                    textColor: "text-yellow-600",
                  },
                ].map((status) => (
                  <div
                    key={status.value}
                    onClick={() =>
                      handleInputChange({
                        target: {
                          name: "status",
                          value: status.value,
                        },
                      })
                    }
                    className={`relative cursor-pointer group transition-all duration-300 ${
                      formData.status === status.value
                        ? `${status.bgLight} ${status.borderActiveColor} border-2 shadow-lg transform scale-105`
                        : `bg-white ${status.borderColor} border hover:shadow-md hover:scale-102`
                    } rounded-xl p-6 flex flex-col items-center text-center space-y-3`}
                  >
                    {/* Selection Indicator */}
                    {formData.status === status.value && (
                      <div
                        className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${status.bgColor} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                        status.bgColor
                      } flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                        formData.status === status.value
                          ? "scale-110"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <div className="text-white">{status.icon}</div>
                    </div>

                    {/* Label and Description */}
                    <div>
                      <h4
                        className={`font-semibold transition-colors duration-200 ${
                          formData.status === status.value
                            ? status.textColor
                            : "text-gray-700 group-hover:text-gray-900"
                        }`}
                      >
                        {status.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {status.description}
                      </p>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div
                      className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                        formData.status === status.value
                          ? "opacity-0"
                          : "opacity-0 group-hover:opacity-5 bg-gray-900"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description complète *
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(content) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: content,
                  }))
                }
                placeholder="Description détaillée du programme avec formatage..."
                height="300px"
                required
              />
            </div>
          </div>
          {/* Arabic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">AR</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                المعلومات باللغة العربية
              </h2>
              <span className="text-sm text-gray-500">(اختياري)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  name="title_ar"
                  value={formData.title_ar}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="عنوان البرنامج"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف المختصر
                </label>
                <input
                  type="text"
                  name="short_description_ar"
                  value={formData.short_description_ar}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ملخص في سطر واحد"
                  maxLength={150}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنظمة
                </label>
                <input
                  type="text"
                  name="organization_ar"
                  value={formData.organization_ar}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="اسم المنظمة"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  name="category_ar"
                  value={formData.category_ar}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="مثال: العلوم والتكنولوجيا، الفنون..."
                  dir="rtl"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف الكامل
              </label>
              <RichTextEditor
                value={formData.description_ar}
                onChange={(content) =>
                  setFormData((prev) => ({
                    ...prev,
                    description_ar: content,
                  }))
                }
                placeholder="وصف مفصل للبرنامج مع التنسيق..."
                height="300px"
                direction="rtl"
              />
            </div>
          </div>
          {/* Financial Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Informations financières
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  Prix du programme
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">DZD</span>
                  </div>
                  <input
                    type="number"
                    name="Price"
                    value={formData.Price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 group-hover:border-emerald-300"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Laissez vide pour un programme gratuit
                </p>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                      />
                    </svg>
                  </div>
                  Prix réduit
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">DZD</span>
                  </div>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 group-hover:border-emerald-300"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Prix avec réduction (optionnel)
                </p>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                  </div>
                  Devise
                </label>
                <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  🇩🇿 DZD (د.ج)
                </div>
                <input type="hidden" name="currency" value="DZD" />
              </div>
            </div>

            {/* Only show scholarship amount and payment frequency for scholarship type programs */}
            {formData.programType === "scholarship" && (
              <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    Montant de la bourse
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                      Bourse
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-emerald-600 text-sm font-medium">
                        DZD
                      </span>
                    </div>
                    <input
                      type="number"
                      name="scholarshipAmount"
                      value={formData.scholarshipAmount}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white group-hover:border-emerald-400"
                      placeholder="10000.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Montant de la bourse ou aide financière (optionnel)
                  </p>
                </div>

                {/* Payment Frequency Field */}
                <div className="mt-6 group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Fréquence de paiement
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                      Optionnel
                    </span>
                  </label>
                  <select
                    name="paymentFrequency"
                    value={formData.paymentFrequency}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white group-hover:border-emerald-400"
                  >
                    <option value="one-time">🎯 Paiement unique</option>
                    <option value="monthly">📅 Mensuel</option>
                    <option value="quarterly">📊 Trimestriel</option>
                    <option value="annually">🗓️ Annuel</option>
                  </select>
                  <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Fréquence de versement de la bourse
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Dates */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Dates importantes
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Début des candidatures
                </label>
                <input
                  type="date"
                  name="applicationStartDate"
                  value={formData.applicationStartDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date limite de candidature
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Début du programme
                </label>
                <input
                  type="date"
                  name="programStartDate"
                  value={formData.programStartDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fin du programme
                </label>
                <input
                  type="date"
                  name="programEndDate"
                  value={formData.programEndDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Capacité et paramètres
                </h2>
                <p className="text-gray-600">
                  Définissez les places disponibles et les options du programme
                </p>
              </div>
            </div>

            {/* Capacity Section */}
            <div className="mb-8">
              {/* <div className="flex items-center gap-2 mb-6"> */}
              {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 
                                            20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0
                                             019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div> */}
              {/* <h3 className="text-lg font-semibold text-gray-800">
                                    Places disponibles
                                </h3> */}
              {/* </div> */}

              {/* Slots section removed - automatically set to 9000000 */}
            </div>

            {/* Settings Section */}
            <div className="border-t pt-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Options du programme
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Status */}
                {/* <div
                                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                        formData.isActive
                                            ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg transform scale-105"
                                            : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                                    }`}
                                    onClick={() =>
                                        handleInputChange({
                                            target: {
                                                name: "isActive",
                                                type: "checkbox",
                                                checked: !formData.isActive,
                                            },
                                        })
                                    }
                                >
                                    {formData.isActive && (
                                        <div
                                            className="absolute top-2 right-5 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500
                                         rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                                                    formData.isActive
                                                        ? "from-green-400 to-emerald-500 shadow-lg scale-110"
                                                        : "from-gray-300 to-gray-400 group-hover:from-green-400 group-hover:to-emerald-500"
                                                } flex items-center justify-center transition-all duration-300`}
                                            >
                                                <svg
                                                    className="w-7 h-7 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>

                                            <div className="flex-1">
                                                <h4
                                                    className={`font-bold text-lg transition-colors duration-200 ${
                                                        formData.isActive
                                                            ? "text-green-800"
                                                            : "text-gray-700 group-hover:text-green-800"
                                                    }`}
                                                >
                                                    Programme actif
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Le programme est visible et
                                                    accessible aux candidatures
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <div
                                                        className={`w-3 h-3 rounded-full ${
                                                            formData.isActive
                                                                ? "bg-green-500"
                                                                : "bg-gray-400"
                                                        }`}
                                                    ></div>
                                                    <span
                                                        className={`text-xs font-medium ${
                                                            formData.isActive
                                                                ? "text-green-700"
                                                                : "text-gray-500"
                                                        }`}
                                                    >
                                                        {formData.isActive
                                                            ? "Activé"
                                                            : "Désactivé"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                                            formData.isActive
                                                ? "opacity-0"
                                                : "opacity-0 group-hover:opacity-5 bg-green-600"
                                        }`}
                                    ></div>
                                </div> */}

                {/* Featured Status */}
                <div
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    formData.isFeatured
                      ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg transform scale-105"
                      : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                  onClick={() =>
                    handleInputChange({
                      target: {
                        name: "isFeatured",
                        type: "checkbox",
                        checked: !formData.isFeatured,
                      },
                    })
                  }
                >
                  {/* Selection Indicator */}
                  {formData.isFeatured && (
                    <div className="absolute top-2 right-5 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                          formData.isFeatured
                            ? "from-yellow-400 to-orange-500 shadow-lg scale-110"
                            : "from-gray-300 to-gray-400 group-hover:from-yellow-400 group-hover:to-orange-500"
                        } flex items-center justify-center transition-all duration-300`}
                      >
                        <svg
                          className="w-7 h-7 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.519 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Programme mis en avant
                        </h4>
                        <p className="text-sm text-gray-600">
                          Affiché dans la section featured
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Image Upload Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Image du programme
            </h2>

            <div className="space-y-4">
              {ImagePreview ? (
                <div className="relative">
                  <img
                    src={ImagePreview}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Glissez une Image ici ou cliquez pour sélectionner
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="Image-upload"
                  />
                  <label
                    htmlFor="Image-upload"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    Sélectionner une Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG jusqu&apos;à 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Video Upload */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Vidéo du programme
            </h2>

            <div className="space-y-4">
              {videoPreview ? (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-64 object-cover rounded-lg"
                    style={{ maxHeight: "400px" }}
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Glissez une vidéo ici ou cliquez pour sélectionner
                  </p>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Sélectionner une vidéo
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    MP4, WebM, MOV jusqu&apos;à 100MB
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                Informations complémentaires
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    Localisation
                    {formData.isRemote && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Désactivé en mode distant
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className={`w-4 h-4 ${
                          formData.isRemote ? "text-gray-300" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={formData.isRemote}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all duration-200 ${
                        formData.isRemote
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 focus:ring-red-500 focus:border-transparent group-hover:border-red-300"
                      }`}
                      placeholder={
                        formData.isRemote
                          ? "Non applicable pour un programme distant"
                          : "Paris, France"
                      }
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    Pays
                    {formData.isRemote && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Désactivé en mode distant
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className={`w-4 h-4 ${
                          formData.isRemote ? "text-gray-300" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </div>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={formData.isRemote}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all duration-200 appearance-none ${
                        formData.isRemote
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 focus:ring-green-500 focus:border-transparent group-hover:border-green-300"
                      }`}
                    >
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                        formData.isRemote ? "text-gray-300" : "text-gray-400"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* isRemote Toggle */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                        />
                      </svg>
                    </div>
                    Programme à distance
                  </label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Mode à distance
                        </h4>
                        <p className="text-sm text-gray-500">
                          Le programme peut être suivi en ligne
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isRemote"
                        checked={formData.isRemote}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isRemote: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                    </div>
                    Langue
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                    </div>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 group-hover:border-purple-300 appearance-none bg-white"
                    >
                      <option value="French">🇫🇷 Français</option>
                      <option value="English">🇬🇧 English</option>
                      <option value="Arabic">🇸🇦 العربية</option>
                      <option value="Spanish">🇪🇸 Español</option>
                      <option value="German">🇩🇪 Deutsch</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tags du programme
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ajoutez des mots-clés pour améliorer la recherche
                    </p>
                  </div>
                </div>

                {/* Enhanced Tag Input */}

                {/* Tag Input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="w-full p-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tapez un tag et appuyez sur Entrée..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-1.5 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>

                {/* Tags Display */}
                <div className="min-h-[80px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  {tags.length === 0 ? (
                    <div className="flex items-center justify-center h-12 text-gray-400">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Aucun tag ajouté
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-2 rounded-full border border-purple-200 hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-sm font-medium">{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="w-4 h-4 bg-purple-200 text-purple-600 rounded-full flex items-center justify-center hover:bg-red-200 hover:text-red-600 transition-colors opacity-70 group-hover:opacity-100"
                          >
                            <svg
                              className="w-2.5 h-2.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Tags */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Tags suggérés :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((suggestedTag) => (
                      <button
                        key={suggestedTag}
                        type="button"
                        onClick={() => addSuggestedTag(suggestedTag)}
                        className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-600 rounded-full hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={tags.includes(suggestedTag)}
                      >
                        + {suggestedTag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Submit Buttons */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex gap-4 justify-end items-center">
              {validationErrors.length > 0 && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 font-medium">
                  {validationErrors.length} erreur
                  {validationErrors.length > 1 ? "s" : ""} — voir le panneau
                </span>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <div className="relative inline-flex">
                <button
                  type="submit"
                  disabled={loading}
                  className={`text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    validationErrors.length > 0
                      ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Créer le programme
                    </>
                  )}
                </button>
                {validationErrors.length > 0 && !loading && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 border-2 border-white text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {validationErrors.length > 9
                      ? "9+"
                      : validationErrors.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgram;
