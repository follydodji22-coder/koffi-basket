const firebaseConfig = { apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw", authDomain: "koffi-basket-2026.firebaseapp.com", projectId: "koffi-basket-2026", storageBucket: "koffi-basket-2026.firebasestorage.app", messagingSenderId: "1001801483627", appId: "1:1001801483627:web:7967fff930e50022b5382e" }; 
firebase.initializeApp(firebaseConfig); 
const db = firebase.firestore(); 

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='admin') chargerJoueurs();
  if(id==='actualites') chargerAnnonces();
}
window.showPage = showPage;

document.getElementById('codePromo').oninput = () => {
  document.getElementById('prix').textContent = (document.getElementById('codePromo').value.toUpperCase()==='KOFFI25'?75:100)+'f';
}

document.getElementById('formJoueur').onsubmit = async (e) => {
  e.preventDefault(); const f = e.target;
  const prix = f.code_promo.value.toUpperCase()==='KOFFI25'?75:100;
  await db.collection("joueurs").add({ nom:f.nom.value, nationalite:f.nationalite.value, taille:f.taille.value, poids:f.poids.value, poste:f.poste.value, email:f.email.value, whatsapp:f.whatsapp.value, photo:"https://i.imgur.com/8Km9tLL.png", prix_paye:prix, statut:"attente", date:new Date() });
  alert(`Inscription ok! Envoie ${prix}f au 0162196973`); f.reset(); showPage('accueil');
}

window.loginAdmin = () => { if(document.getElementById('adminPass').value==='Koffi2026'){ showPage('admin'); } else{ alert('Mauvais mot de passe'); } }
window.logout = () => showPage('accueil');

async function chargerJoueurs(){
  const snap = await db.collection("joueurs").where("statut","==","attente").get();
  let html = "";
  snap.forEach(d=>{ const j=d.data(); html+=`<tr><td>${j.nom}</td><td><button class="approve-btn" onclick="approuver('${d.id}')">Approuver</button><button class="reject-btn" onclick="refuser('${d.id}')">Refuser</button></td></tr>`; });
  document.getElementById('listeJoueurs').innerHTML = html || "<tr><td>Aucun joueur en attente</td></tr>";
  document.getElementById('statsReelles').innerHTML = `<p>Total en attente: ${snap.size}</p>`;
}
// AJOUTE ÇA APRES chargerJoueurs()

async function chargerEquipes(){
  const snapEquipe = await db.collection("equipes").where("statut","==","attente").get();
  let htmlEq = "";
  snapEquipe.forEach(d=>{ 
    const eq = d.data();
    htmlEq += `<p><b>${eq.nom}</b> Capitaine: ${eq.capitaine} 
    <button class="approve-btn" onclick="approuverEquipe('${d.id}')">Approuver</button></p>`; 
  });
  document.getElementById('listeEquipes').innerHTML = htmlEq || "Aucune équipe en attente";
}

window.approuverEquipe = async (id) => { 
  await db.collection("equipes").doc(id).update({statut:"approuve"}); 
  alert("Equipe approuvée"); 
  chargerEquipes(); 
}
window.approuver = async (id) => { await db.collection("joueurs").doc(id).update({statut:"approuve"}); alert("Joueur approuvé"); chargerJoueurs(); }
window.refuser = async (id) => { await db.collection("joueurs").doc(id).update({statut:"refuse"}); alert("Joueur refusé"); chargerJoueurs(); }

async function chargerAnnonces(){
  const snap = await db.collection("annonces").orderBy("date","desc").get();
  let html = "";
  snap.forEach(d=>{ html+=`<div style="background:rgba(0,0,0,0.3); padding:10px; margin:10px 0; border-radius:8px;">${d.data().message}</div>`; });
  document.getElementById('listeAnnonces').innerHTML = html || "Aucune annonce";
}
window.publierAnnonce = async () => { const msg = prompt("Ton annonce:"); if(msg){ await db.collection("annonces").add({message:msg, date:new Date()}); alert("Publié"); } }
let joueurConnecte = null;

// 1. INSCRIPTION AVEC MOT DE PASSE
document.getElementById('formJoueur').onsubmit = async (e) => {
  e.preventDefault(); const f = e.target;
  const prix = f.code_promo.value.toUpperCase()==='KOFFI25'?75:100;
  await db.collection("joueurs").add({ 
    nom:f.nom.value, email:f.email.value, whatsapp:f.whatsapp.value, 
    mot_de_passe: f.email.value, // par défaut on met l'email comme mdp pour simplifier
    prix_paye:prix, statut:"attente", date:new Date() 
  });
  alert(`Inscription ok! Envoie ${prix}f au 0162196973. Ton mot de passe = ton email pour l'instant`);
  f.reset(); showPage('accueil');
}

// 2. CONNEXION JOUEUR
window.loginJoueur = async () => {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const snap = await db.collection("joueurs").where("email","==",email).where("mot_de_passe","==",pass).where("statut","==","approuve").get();
  if(snap.size > 0){ 
    joueurConnecte = snap.docs[0].data();
    document.getElementById('bienvenueJoueur').textContent = "Bienvenue " + joueurConnecte.nom;
    showPage('espace-joueur'); chargerMesEquipes();
  } else { alert("Compte non approuvé ou mauvais identifiants"); }
}
window.logoutJoueur = () => { joueurConnecte = null; showPage('accueil'); }

// 3. CREER EQUIPE
window.soumettreEquipe = async () => {
  const nom = document.getElementById('nomEquipe').value;
  const membres = [...document.querySelectorAll('.membre')].map(i=>i.value);
  await db.collection("equipes").add({ nom, membres, capitaine: joueurConnecte.email, statut: "attente", date: new Date() });
  alert("Equipe envoyée à l'admin pour approbation"); showPage('espace-joueur');
}
async function chargerMesEquipes(){
  const snap = await db.collection("equipes").where("capitaine","==",joueurConnecte.email).get();
  let html = "";
  snap.forEach(d=>{ html += `<p>${d.data().nom} - Statut: ${d.data().statut}</p>`; });
  document.getElementById('mesEquipes').innerHTML = html;
}

// 4. MESSAGERIE
window.envoyerMessage = async () => {
  const msg = document.getElementById('messageInput').value;
  await db.collection("messages").add({ de: joueurConnecte.email, message: msg, date: new Date() });
  document.getElementById('messageInput').value = ""; chargerMessages();
}
async function chargerMessages(){
  const snap = await db.collection("messages").orderBy("date").get();
  let html = "";
  snap.forEach(d=>{ html += `<p><b>${d.data().de}:</b> ${d.data().message}</p>`; });
  document.getElementById('chatBox').innerHTML = html;
}
setInterval(chargerMessages, 3000); // recharge toutes les 3s
