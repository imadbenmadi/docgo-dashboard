import { useState, useEffect } from "react";
import {
    Database,
    AlertTriangle,
    RefreshCw,
    Trash2,
    UserPlus,
    Shield,
    Info,
    CheckCircle,
    XCircle,
    Loader,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "../utils/axios";

const DatabaseManagement = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [dbStatus, setDbStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Fetch database status on component mount
    useEffect(() => {
        fetchDatabaseStatus();
    }, []);

    const fetchDatabaseStatus = async () => {
        try {
            setIsLoadingStatus(true);
            const response = await axios.get("/Admin/rebuild_database/status");
            setDbStatus(response.data);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Erreur",
                text: "Impossible de récupérer le statut de la base de données",
            });
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const showWarningModal = (
        title,
        text,
        confirmButtonText,
        dangerLevel = "warning"
    ) => {
        return Swal.fire({
            icon: dangerLevel === "danger" ? "error" : "warning",
            title,
            html: text,
            showCancelButton: true,
            confirmButtonText,
            cancelButtonText: "Annuler",
            confirmButtonColor:
                dangerLevel === "danger" ? "#dc2626" : "#f59e0b",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
            focusCancel: true,
        });
    };

    const handleSyncDatabase = async () => {
        const result = await showWarningModal(
            "⚠️ Synchronisation de la Base de Données",
            `
            <div class="text-left space-y-3">
                <p><strong>Cette action va :</strong></p>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>Synchroniser le schéma de la base de données</li>
                    <li>Créer les tables manquantes</li>
                    <li>Mettre à jour les colonnes existantes</li>
                </ul>
                <div class="bg-yellow-100 p-3 rounded-lg border-l-4 border-yellow-500">
                    <p class="text-yellow-800 font-semibold">⚠️ Attention :</p>
                    <p class="text-yellow-700 text-sm">Cette opération est généralement sûre mais peut prendre du temps.</p>
                </div>
            </div>
            `,
            "Oui, synchroniser"
        );

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    "/Admin/rebuild_database/sync"
                );

                await Swal.fire({
                    icon: "success",
                    title: "✅ Synchronisation Réussie",
                    html: `
                    <div class="text-left">
                        <p><strong>Résultat :</strong></p>
                        <p class="text-sm text-gray-600">${response.data.message}</p>
                    </div>
                    `,
                });

                fetchDatabaseStatus();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "❌ Erreur de Synchronisation",
                    text:
                        error.response?.data?.message ||
                        "Une erreur est survenue lors de la synchronisation",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRebuildDatabase = async () => {
        const result = await showWarningModal(
            "🚨 ATTENTION - Reconstruction Complète",
            `
            <div class="text-left space-y-3">
                <div class="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
                    <p class="text-red-800 font-bold">🚨 DANGER - ACTION IRRÉVERSIBLE</p>
                    <p class="text-red-700 text-sm mt-2">Cette action va SUPPRIMER TOUTES vos données !</p>
                </div>
                
                <p><strong>Cette action va :</strong></p>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li class="text-red-600">🗑️ Supprimer complètement la base de données</li>
                    <li class="text-red-600">🗑️ Effacer TOUTES les données existantes</li>
                    <li class="text-blue-600">🔄 Recréer la base de données vide</li>
                    <li class="text-blue-600">📋 Recréer toutes les tables</li>
                    <li class="text-green-600">👤 Créer un compte administrateur par défaut</li>
                </ul>
                
                <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p class="text-red-800 font-semibold text-sm">
                        ⚠️ Assurez-vous d'avoir une sauvegarde avant de continuer !
                    </p>
                </div>
            </div>
            `,
            "OUI, TOUT SUPPRIMER",
            "danger"
        );

        if (result.isConfirmed) {
            // Double confirmation for such a dangerous action
            const doubleConfirm = await Swal.fire({
                icon: "warning",
                title: "🚨 DERNIÈRE CONFIRMATION",
                html: `
                <div class="text-center space-y-3">
                    <p class="text-red-600 font-bold text-lg">
                        ÊTES-VOUS VRAIMENT SÛR ?
                    </p>
                    <p class="text-sm text-gray-600">
                        Toutes les données seront perdues définitivement.
                    </p>
                    <p class="text-xs text-red-500">
                        Cette action ne peut pas être annulée !
                    </p>
                </div>
                `,
                showCancelButton: true,
                confirmButtonText: "OUI, JE CONFIRME",
                cancelButtonText: "NON, ANNULER",
                confirmButtonColor: "#dc2626",
                cancelButtonColor: "#059669",
                focusCancel: true,
            });

            if (doubleConfirm.isConfirmed) {
                try {
                    setIsLoading(true);
                    const response = await axios.post(
                        "/Admin/rebuild_database/rebuild"
                    );

                    await Swal.fire({
                        icon: "success",
                        title: "✅ Base de Données Reconstruite",
                        html: `
                        <div class="text-left space-y-2">
                            <p><strong>Opération terminée avec succès !</strong></p>
                            <div class="bg-green-100 p-3 rounded-lg">
                                <p class="text-green-800 text-sm">${
                                    response.data.message
                                }</p>
                                ${
                                    response.data.adminCreated
                                        ? '<p class="text-blue-700 text-sm mt-2">👤 Compte administrateur créé : ee@ee.ee / ee@ee.ee</p>'
                                        : ""
                                }
                            </div>
                        </div>
                        `,
                    });

                    fetchDatabaseStatus();
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "❌ Erreur de Reconstruction",
                        text:
                            error.response?.data?.message ||
                            "Une erreur est survenue lors de la reconstruction",
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    const handleCreateAdmin = async () => {
        const result = await showWarningModal(
            "👤 Création d'un Administrateur",
            `
            <div class="text-left space-y-3">
                <p><strong>Cette action va :</strong></p>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>Créer un compte administrateur par défaut</li>
                    <li>Email : <code class="bg-gray-100 px-1 rounded">ee@ee.ee</code></li>
                    <li>Mot de passe : <code class="bg-gray-100 px-1 rounded">ee@ee.ee</code></li>
                </ul>
                
                <div class="bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                    <p class="text-blue-800 font-semibold">ℹ️ Note :</p>
                    <p class="text-blue-700 text-sm">Si un admin existe déjà, cette action sera ignorée.</p>
                </div>
            </div>
            `,
            "Créer l'Administrateur"
        );

        if (result.isConfirmed) {
            try {
                setIsLoading(true);
                const response = await axios.post(
                    "/Admin/rebuild_database/create-admin"
                );

                await Swal.fire({
                    icon: response.data.created ? "success" : "info",
                    title: response.data.created
                        ? "✅ Administrateur Créé"
                        : "ℹ️ Information",
                    html: `
                    <div class="text-left">
                        <p class="text-sm">${response.data.message}</p>
                        ${
                            response.data.created
                                ? '<div class="mt-3 bg-green-100 p-3 rounded-lg"><p class="text-green-800 text-sm">Vous pouvez maintenant vous connecter avec :<br><strong>Email :</strong> ee@ee.ee<br><strong>Mot de passe :</strong> ee@ee.ee</p></div>'
                                : ""
                        }
                    </div>
                    `,
                });

                fetchDatabaseStatus();
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "❌ Erreur de Création",
                    text:
                        error.response?.data?.message ||
                        "Une erreur est survenue lors de la création",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleEmergencyReset = async () => {
        const result = await showWarningModal(
            "🚨 RÉINITIALISATION D'URGENCE",
            `
            <div class="text-left space-y-3">
                <div class="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
                    <p class="text-red-800 font-bold">🚨 OPTION NUCLÉAIRE</p>
                    <p class="text-red-700 text-sm mt-2">Cette action est réservée aux situations d'urgence critiques !</p>
                </div>
                
                <p><strong>Cette action va :</strong></p>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li class="text-red-600">💥 Détruire complètement la base de données</li>
                    <li class="text-red-600">🗑️ Supprimer TOUTES les données sans exception</li>
                    <li class="text-blue-600">🔄 Recréer complètement la structure</li>
                    <li class="text-green-600">👤 Créer l'administrateur par défaut</li>
                    <li class="text-green-600">🔄 Redémarrer le serveur automatiquement</li>
                </ul>
                
                <div class="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p class="text-red-800 font-semibold text-sm">
                        ⚠️ À utiliser UNIQUEMENT en cas de corruption grave de la base de données !
                    </p>
                </div>
            </div>
            `,
            "RÉINITIALISATION D'URGENCE",
            "danger"
        );

        if (result.isConfirmed) {
            // Triple confirmation for nuclear option
            const nuclearConfirm = await Swal.fire({
                icon: "error",
                title: "💥 OPTION NUCLÉAIRE",
                html: `
                <div class="text-center space-y-3">
                    <p class="text-red-600 font-bold text-xl">
                        VOUS ALLEZ TOUT DÉTRUIRE !
                    </p>
                    <p class="text-red-500 text-sm">
                        Cette action est irréversible et extrême.
                    </p>
                    <p class="text-xs text-gray-500">
                        Tapez "DÉTRUIRE" pour confirmer
                    </p>
                </div>
                `,
                input: "text",
                inputPlaceholder: "Tapez DÉTRUIRE pour confirmer",
                showCancelButton: true,
                confirmButtonText: "LANCER LA DESTRUCTION",
                cancelButtonText: "ANNULER",
                confirmButtonColor: "#7f1d1d",
                cancelButtonColor: "#059669",
                inputValidator: (value) => {
                    if (value !== "DÉTRUIRE") {
                        return "Vous devez taper exactement 'DÉTRUIRE' pour confirmer";
                    }
                },
            });

            if (nuclearConfirm.isConfirmed) {
                try {
                    setIsLoading(true);
                    const response = await axios.post(
                        "/Admin/rebuild_database/emergency-reset"
                    );

                    await Swal.fire({
                        icon: "success",
                        title: "💥 Réinitialisation Terminée",
                        html: `
                        <div class="text-left space-y-2">
                            <p><strong>Destruction et reconstruction terminées !</strong></p>
                            <div class="bg-green-100 p-3 rounded-lg">
                                <p class="text-green-800 text-sm">${response.data.message}</p>
                                <p class="text-blue-700 text-sm mt-2">👤 Administrateur recréé : ee@ee.ee / ee@ee.ee</p>
                                <p class="text-orange-700 text-sm mt-1">🔄 Le serveur va redémarrer...</p>
                            </div>
                        </div>
                        `,
                        timer: 5000,
                        timerProgressBar: true,
                    });

                    // Refresh page after server restart
                    setTimeout(() => {
                        window.location.reload();
                    }, 6000);
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "❌ Erreur de Réinitialisation",
                        text:
                            error.response?.data?.message ||
                            "Une erreur est survenue lors de la réinitialisation",
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    if (isLoadingStatus) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">
                        Chargement du statut de la base de données...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <Database className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestion de la Base de Données
                    </h1>
                </div>
                <p className="text-gray-600">
                    Interface d'administration pour la gestion et maintenance de
                    la base de données.
                </p>
            </div>

            {/* Warning Banner */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
                <div className="flex items-start">
                    <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-800">
                            ⚠️ Zone Dangereuse - Administrateurs Uniquement
                        </h3>
                        <p className="text-red-700 mt-1">
                            Les opérations sur cette page peuvent affecter ou
                            supprimer définitivement toutes les données de
                            l'application. Utilisez avec une extrême prudence.
                        </p>
                    </div>
                </div>
            </div>

            {/* Database Status */}
            {dbStatus && (
                <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <Info className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Statut de la Base de Données
                        </h2>
                        <button
                            onClick={fetchDatabaseStatus}
                            className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Actualiser le statut"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            {dbStatus.connected ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                                <p className="font-medium">Connexion</p>
                                <p
                                    className={`text-sm ${
                                        dbStatus.connected
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {dbStatus.connected
                                        ? "Connectée"
                                        : "Déconnectée"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Database className="w-5 h-5 text-blue-500" />
                            <div>
                                <p className="font-medium">Base de Données</p>
                                <p className="text-sm text-gray-600">
                                    {dbStatus.database}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-500" />
                            <div>
                                <p className="font-medium">Tables</p>
                                <p className="text-sm text-gray-600">
                                    {dbStatus.tablesCount} tables
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                        Dernière mise à jour :{" "}
                        {new Date().toLocaleString("fr-FR")}
                    </div>
                </div>
            )}

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sync Database */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <RefreshCw className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Synchroniser la Base de Données
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Met à jour le schéma de la base de données sans
                                supprimer les données existantes. Crée les
                                tables manquantes et ajoute les nouvelles
                                colonnes.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Opération généralement sûre</span>
                            </div>
                            <button
                                onClick={handleSyncDatabase}
                                disabled={isLoading}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                <span>Synchroniser</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Create Admin */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Créer un Administrateur
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Crée un compte administrateur par défaut avec
                                les identifiants ee@ee.ee / ee@ee.ee. Utile
                                après une reconstruction de la base.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 p-2 rounded mb-4">
                                <Info className="w-4 h-4" />
                                <span>Opération sûre</span>
                            </div>
                            <button
                                onClick={handleCreateAdmin}
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <UserPlus className="w-4 h-4" />
                                )}
                                <span>Créer Admin</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rebuild Database */}
                <div className="bg-white rounded-lg border-2 border-red-200 shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Reconstruire la Base de Données
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Supprime complètement la base de données et la
                                recrée avec un schéma vierge. Crée
                                automatiquement un compte administrateur.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-red-700 bg-red-50 p-2 rounded mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                <span>⚠️ SUPPRIME TOUTES LES DONNÉES</span>
                            </div>
                            <button
                                onClick={handleRebuildDatabase}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                <span>Reconstruire</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Emergency Reset */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-2 border-red-300 shadow-sm p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-red-200 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-900 mb-2">
                                🚨 Réinitialisation d'Urgence
                            </h3>
                            <p className="text-red-800 text-sm mb-4">
                                Option nucléaire réservée aux situations
                                critiques. Détruit tout et redémarre le serveur
                                automatiquement. À utiliser uniquement en cas de
                                corruption grave.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-red-800 bg-red-100 p-2 rounded mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                <span>💥 OPTION NUCLÉAIRE</span>
                            </div>
                            <button
                                onClick={handleEmergencyReset}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4" />
                                )}
                                <span>RÉINITIALISATION D'URGENCE</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📚 Guide d'Utilisation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                            Quand utiliser la Synchronisation ?
                        </h4>
                        <ul className="space-y-1 text-gray-600">
                            <li>• Après une mise à jour du code</li>
                            <li>• Quand de nouvelles tables sont ajoutées</li>
                            <li>
                                • Pour corriger des problèmes de schéma mineurs
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                            Quand reconstruire complètement ?
                        </h4>
                        <ul className="space-y-1 text-gray-600">
                            <li>• En développement local uniquement</li>
                            <li>• Quand la structure a complètement changé</li>
                            <li>• Pour repartir sur une base propre</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-100 rounded-lg border-l-4 border-yellow-500">
                    <p className="text-yellow-800 text-sm">
                        <strong>⚠️ Conseil :</strong> Toujours faire une
                        sauvegarde avant toute opération destructive en
                        production. Ces outils sont principalement destinés au
                        développement.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManagement;
