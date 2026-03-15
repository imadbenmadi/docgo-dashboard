import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import AdminsAPI from "../API/Admins";

const emptyForm = {
  email: "",
  password: "",
  confirmPassword: "",
  confirmPhrase: "",
};

const DANGER_CONFIRMATION_PHRASE = "JE CONFIRME";
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,72}$/;

const getPasswordChecks = (password) => ({
  length: password.length >= 12,
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[^A-Za-z\d]/.test(password),
});

const CheckItem = ({ ok, label }) => (
  <li className={`text-sm ${ok ? "text-emerald-700" : "text-red-700"}`}>
    {ok ? "OK" : "NON"} - {label}
  </li>
);

function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [riskAccepted, setRiskAccepted] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await AdminsAPI.getAdmins();
      setAdmins(res?.admins || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors du chargement des admins",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedEmail = String(form.email || "")
      .trim()
      .toLowerCase();
    const password = String(form.password || "");
    const confirmPassword = String(form.confirmPassword || "");
    const phrase = String(form.confirmPhrase || "").trim();

    if (!normalizedEmail || !password) {
      toast.error("Email et mot de passe sont obligatoires");
      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      toast.error("Format d'email invalide");
      return;
    }

    if (!strongPasswordRegex.test(password)) {
      toast.error(
        "Mot de passe faible: minimum 12 caractères, majuscule, minuscule, chiffre et symbole.",
      );
      return;
    }

    if (confirmPassword !== password) {
      toast.error("La confirmation du mot de passe ne correspond pas");
      return;
    }

    if (!riskAccepted) {
      toast.error("Vous devez accepter les risques avant de continuer");
      return;
    }

    if (phrase !== DANGER_CONFIRMATION_PHRASE) {
      toast.error(`Tapez exactement \"${DANGER_CONFIRMATION_PHRASE}\"`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await AdminsAPI.createAdmin({
        email: normalizedEmail,
        password,
      });

      if (res?.success) {
        toast.success("Admin créé avec succès");
        setForm(emptyForm);
        setRiskAccepted(false);
        await loadAdmins();
      } else {
        toast.error(res?.message || "Échec de création de l'admin");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const passwordChecks = getPasswordChecks(form.password);
  const passwordStrong =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.lower &&
    passwordChecks.number &&
    passwordChecks.special;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <section className="relative overflow-hidden rounded-2xl border border-red-300 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 shadow-sm">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-200/40 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="relative">
          <p className="inline-flex items-center rounded-full border border-red-300 bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700">
            Zone sensible
          </p>
          <h2 className="mt-3 text-2xl font-bold text-red-900">
            Avertissement sécurité: création de comptes administrateurs
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-red-800">
            Cette opération est critique. Un mauvais usage peut ouvrir un accès
            privilégié et exposer la plateforme à des attaques malveillantes.
            Effectuez cette action uniquement si vous êtes autorisé.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-red-900 md:grid-cols-2">
            <li className="rounded-lg border border-red-200 bg-white/70 px-3 py-2">
              Créez uniquement des comptes nominatifs et traçables.
            </li>
            <li className="rounded-lg border border-red-200 bg-white/70 px-3 py-2">
              Utilisez un mot de passe robuste et unique.
            </li>
            <li className="rounded-lg border border-red-200 bg-white/70 px-3 py-2">
              Ne partagez jamais d'identifiants via messagerie.
            </li>
            <li className="rounded-lg border border-red-200 bg-white/70 px-3 py-2">
              Vérifiez l'email avant validation finale.
            </li>
          </ul>
        </div>
      </section>

      <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Créer un admin</h3>
        <p className="mt-1 text-sm text-gray-600">
          Action dangereuse: ajoute un accès complet au tableau
          d'administration.
        </p>

        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@healthpathglobal.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            autoComplete="off"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mot de passe fort"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            autoComplete="new-password"
          />

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmer le mot de passe"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            autoComplete="new-password"
          />

          <input
            type="text"
            name="confirmPhrase"
            value={form.confirmPhrase}
            onChange={handleChange}
            placeholder={`Tapez ${DANGER_CONFIRMATION_PHRASE}`}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            autoComplete="off"
          />

          <div className="md:col-span-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-sm font-medium text-gray-800">
              Exigences mot de passe
            </p>
            <ul className="grid gap-1 md:grid-cols-2">
              <CheckItem
                ok={passwordChecks.length}
                label="Minimum 12 caractères"
              />
              <CheckItem
                ok={passwordChecks.upper}
                label="Au moins une majuscule"
              />
              <CheckItem
                ok={passwordChecks.lower}
                label="Au moins une minuscule"
              />
              <CheckItem
                ok={passwordChecks.number}
                label="Au moins un chiffre"
              />
              <CheckItem
                ok={passwordChecks.special}
                label="Au moins un symbole"
              />
            </ul>
            {!passwordStrong && form.password ? (
              <p className="mt-2 text-xs font-medium text-red-700">
                Mot de passe insuffisant pour un compte à privilèges.
              </p>
            ) : null}
          </div>

          <label className="md:col-span-2 inline-flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={riskAccepted}
              onChange={(e) => setRiskAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>
              Je confirme comprendre que cette action est sensible et peut avoir
              un impact sécurité majeur en cas de mauvaise manipulation.
            </span>
          </label>

          <button
            type="submit"
            disabled={
              submitting ||
              !riskAccepted ||
              !passwordStrong ||
              form.password !== form.confirmPassword
            }
            className="md:col-span-2 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Création sécurisée..."
              : "Créer admin (action critique)"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">
          Admins existants
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Contrôlez régulièrement cette liste pour détecter tout compte
          inattendu.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500 mt-4">Chargement...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-gray-500 mt-4">Aucun admin trouvé.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 text-gray-800">{admin.email}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminsPage;
