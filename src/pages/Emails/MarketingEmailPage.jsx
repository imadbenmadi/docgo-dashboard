import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Megaphone, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import emailsAPI from "../../API/Emails";
import RichTextEditor from "../../components/Common/RichTextEditor/RichTextEditor";

const emptyDraft = {
  id: null,
  title: "",
  subject: "",
  htmlContent: "",
  textContent: "",
  recipientMode: "all",
  recipients: [],
  status: "draft",
};

const MarketingEmailPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);

  const [users, setUsers] = useState([]);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  const selectedUsersCount = draft.recipients?.length || 0;

  const loadCampaigns = async () => {
    try {
      const res = await emailsAPI.getMarketingCampaigns();
      if (res?.success) {
        setCampaigns(res.campaigns || []);
      }
    } catch (error) {
      toast.error("Impossible de charger les campagnes marketing");
    }
  };

  const loadUsers = async (search = "") => {
    setUsersLoading(true);
    try {
      const res = await emailsAPI.getUsersForCampaign({
        search,
        page: 1,
        limit: 100,
      });
      if (res?.success) {
        setUsers(res.users || []);
      }
    } catch {
      toast.error("Impossible de charger la liste des utilisateurs");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadCampaigns(), loadUsers("")]);
      setLoading(false);
    };

    init();
  }, []);

  const applyUsersSearch = () => {
    loadUsers(usersSearch);
  };

  const handleSelectCampaign = async (id) => {
    try {
      const res = await emailsAPI.getMarketingCampaign(id);
      if (!res?.success || !res.campaign) return;
      setDraft({
        ...emptyDraft,
        ...res.campaign,
        recipients: Array.isArray(res.campaign.recipients)
          ? res.campaign.recipients
          : [],
      });
    } catch {
      toast.error("Impossible de charger la campagne");
    }
  };

  const toggleRecipient = (userId) => {
    setDraft((prev) => {
      const next = new Set(prev.recipients || []);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);

      return {
        ...prev,
        recipients: [...next],
      };
    });
  };

  const handleSaveDraft = async () => {
    if (
      !draft.title.trim() ||
      !draft.subject.trim() ||
      !draft.htmlContent.trim()
    ) {
      toast.error("Titre, sujet et contenu HTML sont obligatoires");
      return;
    }

    if (draft.recipientMode === "selected" && selectedUsersCount === 0) {
      toast.error("Sélectionnez au moins un utilisateur");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: draft.title,
        subject: draft.subject,
        htmlContent: draft.htmlContent,
        textContent: draft.textContent,
        recipientMode: draft.recipientMode,
        recipients: draft.recipientMode === "selected" ? draft.recipients : [],
      };

      const res = draft.id
        ? await emailsAPI.updateMarketingCampaign(draft.id, payload)
        : await emailsAPI.createMarketingCampaign(payload);

      if (res?.success && res.campaign) {
        setDraft({
          ...emptyDraft,
          ...res.campaign,
          recipients: Array.isArray(res.campaign.recipients)
            ? res.campaign.recipients
            : [],
        });
        toast.success("Brouillon marketing enregistré");
        await loadCampaigns();
      } else {
        toast.error(res?.message || "Erreur lors de l'enregistrement");
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement du brouillon");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!draft.id) {
      toast.error("Enregistrez d'abord le brouillon avant l'envoi");
      return;
    }

    if (draft.recipientMode === "selected" && selectedUsersCount === 0) {
      toast.error("Sélectionnez au moins un utilisateur");
      return;
    }

    setSending(true);
    try {
      const res = await emailsAPI.sendMarketingCampaign(draft.id, {
        recipientMode: draft.recipientMode,
        userIds: draft.recipientMode === "selected" ? draft.recipients : [],
      });

      if (res?.success) {
        const sent = res?.stats?.sentCount ?? 0;
        const failed = res?.stats?.failedCount ?? 0;
        toast.success(`Campagne envoyée: ${sent} succès, ${failed} échecs`);
        await loadCampaigns();
        await handleSelectCampaign(draft.id);
      } else {
        toast.error(res?.message || "Échec de l'envoi");
      }
    } catch {
      toast.error("Erreur lors de l'envoi de la campagne");
    } finally {
      setSending(false);
    }
  };

  const recipientsPreview = useMemo(() => {
    if (draft.recipientMode === "all") return "Tous les utilisateurs actifs";
    return `${selectedUsersCount} utilisateur(s) sélectionné(s)`;
  }, [draft.recipientMode, selectedUsersCount]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-gray-600">Chargement des campagnes...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm p-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Campagnes</h3>
          <button
            onClick={() => setDraft(emptyDraft)}
            className="text-sm px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            Nouvelle
          </button>
        </div>

        <div className="space-y-2 max-h-[560px] overflow-y-auto">
          {campaigns.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectCampaign(item.id)}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                draft.id === item.id
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <p className="font-medium text-sm text-gray-900 line-clamp-2">
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.status === "sent" ? "Envoyé" : "Brouillon"}
              </p>
            </button>
          ))}

          {campaigns.length === 0 && (
            <p className="text-sm text-gray-500">
              Aucune campagne pour le moment.
            </p>
          )}
        </div>
      </div>

      <div className="xl:col-span-3 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-blue-600" />
              Emails marketing
            </h2>
            <p className="text-gray-600 mt-2">
              Créez, sauvegardez et envoyez des campagnes email à tous les
              utilisateurs ou à une sélection manuelle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre interne
              </label>
              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Lancement Nouveau Programme Mars"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet email
              </label>
              <input
                value={draft.subject}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, subject: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sujet visible dans la boîte mail"
              />
            </div>
          </div>

          <RichTextEditor
            label="Contenu HTML (éditeur riche)"
            value={draft.htmlContent}
            onChange={(value) =>
              setDraft((p) => ({ ...p, htmlContent: value }))
            }
            height="320px"
            required
            placeholder="Rédigez votre email marketing ici..."
          />

          <div className="mat-12">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version texte (optionnelle)
            </label>
            <textarea
              value={draft.textContent || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, textContent: e.target.value }))
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Ciblage des destinataires
          </h3>

          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={draft.recipientMode === "all"}
                onChange={() =>
                  setDraft((p) => ({ ...p, recipientMode: "all" }))
                }
              />
              Tous les utilisateurs actifs
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                checked={draft.recipientMode === "selected"}
                onChange={() =>
                  setDraft((p) => ({ ...p, recipientMode: "selected" }))
                }
              />
              Sélection manuelle
            </label>
          </div>

          <p className="text-sm text-gray-500">{recipientsPreview}</p>

          {draft.recipientMode === "selected" && (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex gap-2 mb-3">
                <input
                  value={usersSearch}
                  onChange={(e) => {
                    setUsersSearch(e.target.value);
                    setUsers([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyUsersSearch();
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Rechercher par nom ou email..."
                />
                <button
                  type="button"
                  onClick={applyUsersSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Rechercher
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {usersLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                  </div>
                ) : (
                  users.map((user) => {
                    const checked = (draft.recipients || []).includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRecipient(user.id)}
                        />
                        <span className="text-sm text-gray-800">
                          {user.firstName} {user.lastName} - {user.email}
                        </span>
                      </label>
                    );
                  })
                )}

                {!usersLoading && users.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Aucun utilisateur trouvé.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Sauvegarder
            </button>

            <button
              onClick={handleSend}
              disabled={sending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Envoyer maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingEmailPage;
