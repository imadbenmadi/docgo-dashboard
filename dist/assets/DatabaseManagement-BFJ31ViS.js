import{g as I,r as g,a as x,S as a,j as e,P as h,C as S,T as U}from"./index-CguMy95A.js";import{L as u}from"./loader-DcS4kooo.js";import{D as f}from"./database-CfiNpvxE.js";import{T as o}from"./triangle-alert-BOMoQ5vW.js";import{I as v}from"./info-C2hf4f3q.js";import{S as A}from"./shield-cSl_FMm2.js";import{T as j}from"./trash-2-DAGZkfAB.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=I("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]),q=()=>{const[n,i]=g.useState(!1),[c,y]=g.useState(null),[w,b]=g.useState(!0);g.useEffect(()=>{m()},[]);const m=async()=>{try{b(!0);const d=await x.get("/Admin/rebuild_database/status");y(d.data)}catch{a.fire({icon:"error",title:"Erreur",text:"Impossible de récupérer le statut de la base de données"})}finally{b(!1)}},p=(d,t,r,s="warning")=>a.fire({icon:s==="danger"?"error":"warning",title:d,html:t,showCancelButton:!0,confirmButtonText:r,cancelButtonText:"Annuler",confirmButtonColor:s==="danger"?"#dc2626":"#f59e0b",cancelButtonColor:"#6b7280",reverseButtons:!0,focusCancel:!0}),C=async()=>{var t,r;if((await p("⚠️ Synchronisation de la Base de Données",`
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
            `,"Oui, synchroniser")).isConfirmed)try{i(!0);const s=await x.post("/Admin/rebuild_database/sync");await a.fire({icon:"success",title:"✅ Synchronisation Réussie",html:`
                    <div class="text-left">
                        <p><strong>Résultat :</strong></p>
                        <p class="text-sm text-gray-600">${s.data.message}</p>
                    </div>
                    `}),m()}catch(s){a.fire({icon:"error",title:"❌ Erreur de Synchronisation",text:((r=(t=s.response)==null?void 0:t.data)==null?void 0:r.message)||"Une erreur est survenue lors de la synchronisation"})}finally{i(!1)}},R=async()=>{var t,r;if((await p("🚨 ATTENTION - Reconstruction Complète",`
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
            `,"OUI, TOUT SUPPRIMER","danger")).isConfirmed&&(await a.fire({icon:"warning",title:"🚨 DERNIÈRE CONFIRMATION",html:`
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
                `,showCancelButton:!0,confirmButtonText:"OUI, JE CONFIRME",cancelButtonText:"NON, ANNULER",confirmButtonColor:"#dc2626",cancelButtonColor:"#059669",focusCancel:!0})).isConfirmed)try{i(!0);const l=await x.post("/Admin/rebuild_database/rebuild");await a.fire({icon:"success",title:"✅ Base de Données Reconstruite",html:`
                        <div class="text-left space-y-2">
                            <p><strong>Opération terminée avec succès !</strong></p>
                            <div class="bg-green-100 p-3 rounded-lg">
                                <p class="text-green-800 text-sm">${l.data.message}</p>
                                ${l.data.adminCreated?'<p class="text-blue-700 text-sm mt-2">👤 Compte administrateur créé : ee@ee.ee / ee@ee.ee</p>':""}
                            </div>
                        </div>
                        `}),m()}catch(l){a.fire({icon:"error",title:"❌ Erreur de Reconstruction",text:((r=(t=l.response)==null?void 0:t.data)==null?void 0:r.message)||"Une erreur est survenue lors de la reconstruction"})}finally{i(!1)}},E=async()=>{var t,r;if((await p("👤 Création d'un Administrateur",`
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
            `,"Créer l'Administrateur")).isConfirmed)try{i(!0);const s=await x.post("/Admin/rebuild_database/create-admin");await a.fire({icon:s.data.created?"success":"info",title:s.data.created?"✅ Administrateur Créé":"ℹ️ Information",html:`
                    <div class="text-left">
                        <p class="text-sm">${s.data.message}</p>
                        ${s.data.created?'<div class="mt-3 bg-green-100 p-3 rounded-lg"><p class="text-green-800 text-sm">Vous pouvez maintenant vous connecter avec :<br><strong>Email :</strong> ee@ee.ee<br><strong>Mot de passe :</strong> ee@ee.ee</p></div>':""}
                    </div>
                    `}),m()}catch(s){a.fire({icon:"error",title:"❌ Erreur de Création",text:((r=(t=s.response)==null?void 0:t.data)==null?void 0:r.message)||"Une erreur est survenue lors de la création"})}finally{i(!1)}},T=async()=>{var t,r;if((await p("🚨 RÉINITIALISATION D'URGENCE",`
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
            `,"RÉINITIALISATION D'URGENCE","danger")).isConfirmed&&(await a.fire({icon:"error",title:"💥 OPTION NUCLÉAIRE",html:`
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
                `,input:"text",inputPlaceholder:"Tapez DÉTRUIRE pour confirmer",showCancelButton:!0,confirmButtonText:"LANCER LA DESTRUCTION",cancelButtonText:"ANNULER",confirmButtonColor:"#7f1d1d",cancelButtonColor:"#059669",inputValidator:l=>{if(l!=="DÉTRUIRE")return"Vous devez taper exactement 'DÉTRUIRE' pour confirmer"}})).isConfirmed)try{i(!0);const l=await x.post("/Admin/rebuild_database/emergency-reset");await a.fire({icon:"success",title:"💥 Réinitialisation Terminée",html:`
                        <div class="text-left space-y-2">
                            <p><strong>Destruction et reconstruction terminées !</strong></p>
                            <div class="bg-green-100 p-3 rounded-lg">
                                <p class="text-green-800 text-sm">${l.data.message}</p>
                                <p class="text-blue-700 text-sm mt-2">👤 Administrateur recréé : ee@ee.ee / ee@ee.ee</p>
                                <p class="text-orange-700 text-sm mt-1">🔄 Le serveur va redémarrer...</p>
                            </div>
                        </div>
                        `,timer:5e3,timerProgressBar:!0}),setTimeout(()=>{window.location.reload()},6e3)}catch(l){a.fire({icon:"error",title:"❌ Erreur de Réinitialisation",text:((r=(t=l.response)==null?void 0:t.data)==null?void 0:r.message)||"Une erreur est survenue lors de la réinitialisation"})}finally{i(!1)}};return w?e.jsx("div",{className:"flex items-center justify-center min-h-[400px]",children:e.jsxs("div",{className:"text-center",children:[e.jsx(u,{className:"w-8 h-8 animate-spin mx-auto mb-4 text-blue-600"}),e.jsx("p",{className:"text-gray-600",children:"Chargement du statut de la base de données..."})]})}):e.jsxs("div",{className:"p-6 max-w-6xl mx-auto",children:[e.jsxs("div",{className:"mb-8",children:[e.jsxs("div",{className:"flex items-center space-x-3 mb-4",children:[e.jsx(f,{className:"w-8 h-8 text-blue-600"}),e.jsx("h1",{className:"text-3xl font-bold text-gray-900",children:"Gestion de la Base de Données"})]}),e.jsx("p",{className:"text-gray-600",children:"Interface d'administration pour la gestion et maintenance de la base de données."})]}),e.jsx("div",{className:"bg-red-50 border-l-4 border-red-400 p-4 mb-8",children:e.jsxs("div",{className:"flex items-start",children:[e.jsx(o,{className:"w-6 h-6 text-red-400 mt-0.5 mr-3 flex-shrink-0"}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold text-red-800",children:"⚠️ Zone Dangereuse - Administrateurs Uniquement"}),e.jsx("p",{className:"text-red-700 mt-1",children:"Les opérations sur cette page peuvent affecter ou supprimer définitivement toutes les données de l'application. Utilisez avec une extrême prudence."})]})]})}),c&&e.jsxs("div",{className:"bg-white rounded-lg border shadow-sm p-6 mb-8",children:[e.jsxs("div",{className:"flex items-center space-x-3 mb-4",children:[e.jsx(v,{className:"w-6 h-6 text-blue-600"}),e.jsx("h2",{className:"text-xl font-semibold text-gray-900",children:"Statut de la Base de Données"}),e.jsx("button",{onClick:m,className:"ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",title:"Actualiser le statut",children:e.jsx(h,{className:"w-4 h-4"})})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"flex items-center space-x-3 p-3 bg-gray-50 rounded-lg",children:[c.connected?e.jsx(S,{className:"w-5 h-5 text-green-500"}):e.jsx(U,{className:"w-5 h-5 text-red-500"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Connexion"}),e.jsx("p",{className:`text-sm ${c.connected?"text-green-600":"text-red-600"}`,children:c.connected?"Connectée":"Déconnectée"})]})]}),e.jsxs("div",{className:"flex items-center space-x-3 p-3 bg-gray-50 rounded-lg",children:[e.jsx(f,{className:"w-5 h-5 text-blue-500"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Base de Données"}),e.jsx("p",{className:"text-sm text-gray-600",children:c.database})]})]}),e.jsxs("div",{className:"flex items-center space-x-3 p-3 bg-gray-50 rounded-lg",children:[e.jsx(A,{className:"w-5 h-5 text-purple-500"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:"Tables"}),e.jsxs("p",{className:"text-sm text-gray-600",children:[c.tablesCount," tables"]})]})]})]}),e.jsxs("div",{className:"mt-4 text-xs text-gray-500",children:["Dernière mise à jour :"," ",new Date().toLocaleString("fr-FR")]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsx("div",{className:"bg-white rounded-lg border shadow-sm p-6",children:e.jsxs("div",{className:"flex items-start space-x-4",children:[e.jsx("div",{className:"p-3 bg-yellow-100 rounded-lg",children:e.jsx(h,{className:"w-6 h-6 text-yellow-600"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Synchroniser la Base de Données"}),e.jsx("p",{className:"text-gray-600 text-sm mb-4",children:"Met à jour le schéma de la base de données sans supprimer les données existantes. Crée les tables manquantes et ajoute les nouvelles colonnes."}),e.jsxs("div",{className:"flex items-center space-x-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded mb-4",children:[e.jsx(o,{className:"w-4 h-4"}),e.jsx("span",{children:"Opération généralement sûre"})]}),e.jsxs("button",{onClick:C,disabled:n,className:"w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2",children:[n?e.jsx(u,{className:"w-4 h-4 animate-spin"}):e.jsx(h,{className:"w-4 h-4"}),e.jsx("span",{children:"Synchroniser"})]})]})]})}),e.jsx("div",{className:"bg-white rounded-lg border shadow-sm p-6",children:e.jsxs("div",{className:"flex items-start space-x-4",children:[e.jsx("div",{className:"p-3 bg-blue-100 rounded-lg",children:e.jsx(N,{className:"w-6 h-6 text-blue-600"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Créer un Administrateur"}),e.jsx("p",{className:"text-gray-600 text-sm mb-4",children:"Crée un compte administrateur par défaut avec les identifiants ee@ee.ee / ee@ee.ee. Utile après une reconstruction de la base."}),e.jsxs("div",{className:"flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 p-2 rounded mb-4",children:[e.jsx(v,{className:"w-4 h-4"}),e.jsx("span",{children:"Opération sûre"})]}),e.jsxs("button",{onClick:E,disabled:n,className:"w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2",children:[n?e.jsx(u,{className:"w-4 h-4 animate-spin"}):e.jsx(N,{className:"w-4 h-4"}),e.jsx("span",{children:"Créer Admin"})]})]})]})}),e.jsx("div",{className:"bg-white rounded-lg border-2 border-red-200 shadow-sm p-6",children:e.jsxs("div",{className:"flex items-start space-x-4",children:[e.jsx("div",{className:"p-3 bg-red-100 rounded-lg",children:e.jsx(j,{className:"w-6 h-6 text-red-600"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Reconstruire la Base de Données"}),e.jsx("p",{className:"text-gray-600 text-sm mb-4",children:"Supprime complètement la base de données et la recrée avec un schéma vierge. Crée automatiquement un compte administrateur."}),e.jsxs("div",{className:"flex items-center space-x-2 text-sm text-red-700 bg-red-50 p-2 rounded mb-4",children:[e.jsx(o,{className:"w-4 h-4"}),e.jsx("span",{children:"⚠️ SUPPRIME TOUTES LES DONNÉES"})]}),e.jsxs("button",{onClick:R,disabled:n,className:"w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2",children:[n?e.jsx(u,{className:"w-4 h-4 animate-spin"}):e.jsx(j,{className:"w-4 h-4"}),e.jsx("span",{children:"Reconstruire"})]})]})]})}),e.jsx("div",{className:"bg-gradient-to-r from-red-50 to-red-100 rounded-lg border-2 border-red-300 shadow-sm p-6",children:e.jsxs("div",{className:"flex items-start space-x-4",children:[e.jsx("div",{className:"p-3 bg-red-200 rounded-lg",children:e.jsx(o,{className:"w-6 h-6 text-red-700"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"text-lg font-semibold text-red-900 mb-2",children:"🚨 Réinitialisation d'Urgence"}),e.jsx("p",{className:"text-red-800 text-sm mb-4",children:"Option nucléaire réservée aux situations critiques. Détruit tout et redémarre le serveur automatiquement. À utiliser uniquement en cas de corruption grave."}),e.jsxs("div",{className:"flex items-center space-x-2 text-sm text-red-800 bg-red-100 p-2 rounded mb-4",children:[e.jsx(o,{className:"w-4 h-4"}),e.jsx("span",{children:"💥 OPTION NUCLÉAIRE"})]}),e.jsxs("button",{onClick:T,disabled:n,className:"w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2",children:[n?e.jsx(u,{className:"w-4 h-4 animate-spin"}):e.jsx(o,{className:"w-4 h-4"}),e.jsx("span",{children:"RÉINITIALISATION D'URGENCE"})]})]})]})})]}),e.jsxs("div",{className:"mt-8 bg-gray-50 rounded-lg p-6",children:[e.jsx("h3",{className:"text-lg font-semibold text-gray-900 mb-4",children:"📚 Guide d'Utilisation"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6 text-sm",children:[e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-gray-800 mb-2",children:"Quand utiliser la Synchronisation ?"}),e.jsxs("ul",{className:"space-y-1 text-gray-600",children:[e.jsx("li",{children:"• Après une mise à jour du code"}),e.jsx("li",{children:"• Quand de nouvelles tables sont ajoutées"}),e.jsx("li",{children:"• Pour corriger des problèmes de schéma mineurs"})]})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-semibold text-gray-800 mb-2",children:"Quand reconstruire complètement ?"}),e.jsxs("ul",{className:"space-y-1 text-gray-600",children:[e.jsx("li",{children:"• En développement local uniquement"}),e.jsx("li",{children:"• Quand la structure a complètement changé"}),e.jsx("li",{children:"• Pour repartir sur une base propre"})]})]})]}),e.jsx("div",{className:"mt-4 p-4 bg-yellow-100 rounded-lg border-l-4 border-yellow-500",children:e.jsxs("p",{className:"text-yellow-800 text-sm",children:[e.jsx("strong",{children:"⚠️ Conseil :"})," Toujours faire une sauvegarde avant toute opération destructive en production. Ces outils sont principalement destinés au développement."]})})]})]})};export{q as default};
