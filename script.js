const firebaseConfig = { apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw", authDomain: "koffi-basket-2026.firebaseapp.com", projectId: "koffi-basket-2026", storageBucket: "koffi-basket-2026.firebasestorage.app", messagingSenderId: "1001801483627", appId: "1:1001801483627:web:7967fff930e50022b5382e" };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let joueurConnecte = null;
let tousLesJoueurs = [];

function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='admin'){ chargerJoueurs(); chargerEquipes(); }
  if(id==='actualites') chargerAnnonces();
}

document.addEventListener('DOMContentLoaded', function(){
  // PRIX DYNAMIQUE
  const codePromo = document.getElementById('codePromo');
  if(codePromo){
    codePromo.oninput = (e) => {
      document.getElementById('prix').textContent = e.target.value.toUpperCase()==='KOFFI25'? '75f' : '100f';
    }
  }

  // INSCRIPTION
  const formJoueur = document.getElementById('formJoueur');
  if(formJoueur){
    formJoueur.onsubmit = async (e) => {
      e.preventDefault(); const f = e.target;
      const prix = f.code_promo.value.toUpperCase()==='KOFFI25'?75:100;
      let photoUrl = "";
      const photoFile = document.getElementById('photoJoueur').files[0];
      if(photoFile){
        const formData = new FormData();
        formData.append("image", photoFile);
        const res = await fetch("https://api.imgbb.com/1/upload?key=9a1fb916aa791ee3077810ebda9f7c3b", { method: "POST", body: formData });
        const data = await res.json();
        if(data.success){ photoUrl = data.data.url; }
        else { alert("Erreur upload: " + data.error.message); return; }
      }
      await db.collection("joueurs").add({ nom:f.nom.value, nationalite:f.nationalite.value, taille:f.taille.value, poids:f.poids.value, poste:f.poste.value, email:f.email.value, whatsapp:f.whatsapp.value, mot_de_passe: f.mot_de_passe.value, photo: photoUrl, prix_paye:prix, statut:"attente", date:new Date() });
      alert(`Inscription ok! Envoie ${prix}f au 0162196973.`); f.reset(); showPage('accueil');
    }
  }

  // PUBLICATION
  const formPublication = document.getElementById('formPublication');
  if(formPublication){
    formPublication.onsubmit = async (e) => {
      e.preventDefault();
      const file = document.getElementById('imagePub').files[0];
      let imageUrl = "";
      if(file){
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("https://api.imgbb.com/1/upload?key=9a1fb916aa791ee3077810ebda9f7c3b", { method: "POST", body: formData });
        const data = await res.json();
        imageUrl = data.data.url;
      }
      await db.collection("annonces").add({ categorie: document.getElementById('categoriePub').value, titre: document.getElementById('titrePub').value, message: document.getElementById('messagePub').value, image: imageUrl, date: new Date() });
      alert("Publié"); formPublication.reset(); showPage('admin');
    }
  }

  // RECHERCHE
  const recherche = document.getElementById('rechercheJoueur');
  if(recherche){
    recherche.oninput = (e) => {
      const texte = e.target.value.toLowerCase();
      const filtres = tousLesJoueurs.filter(j => j.nom.toLowerCase().includes(texte) || j.email.toLowerCase().includes(texte));
      afficherJoueurs(filtres);
    }
  }
});

// CONNEXION
window.loginJoueur = async () => {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  const snap = await db.collection("joueurs").where("email","==",email).where("mot_de_passe","==",pass).get();
  if(snap.size > 0){
    joueurConnecte = snap.docs[0].data();
    if(joueurConnecte.statut === "attente"){ alert("En attente"); showPage('accueil'); return; }
    if(joueurConnecte.statut === "approuve"){
      document.getElementById('bienvenueJoueur').textContent = "Bienvenue " + joueurConnecte.nom;
      if(document.getElementById('photoProfil')){ document.getElementById('photoProfil').src = joueurConnecte.photo || 'https://i.imgur.com/default.png'; }
      showPage('espace-joueur'); chargerNotifications(); setInterval(chargerNotifications, 5000);
    }
    if(joueurConnecte.statut === "refuse"){ alert("Refusé"); }
  } else { alert("Mauvais email ou mot de passe"); }
}

window.loginAdmin = () => {
  if(document.getElementById('adminPass').value == "admin123"){ showPage('admin'); }
  else { alert("Mauvais mot de passe"); }
}

window.logout = () => showPage('accueil');
window.logoutJoueur = () => { joueurConnecte = null; showPage('accueil'); };

// JOUEURS ADMIN
async function chargerJoueurs(){
  const snap = await db.collection("joueurs").get();
  tousLesJoueurs = [];
  snap.forEach(d=>{ if(d.data().statut == "attente"){ tousLesJoueurs.push({id: d.id,...d.data()}); } });
  afficherJoueurs(tousLesJoueurs);
}

function afficherJoueurs(liste){
  let html = "";
  liste.forEach(j=>{
    const photo = j.photo? `<img src="${j.photo}" style="width:50px; height:50px; border-radius:50%;">` : '<img src="https://i.imgur.com/default.png" style="width:50px; height:50px; border-radius:50%;">';
    html+=`<tr>
      <td>${photo}</td><td>${j.nom}</td><td>${j.email}</td><td>${j.prix_paye}f</td>
      <td><button onclick="approuver('${j.id}')">Approuver</button> <button onclick="refuser('${j.id}')">Refuser</button></td>
    </tr>`;
  });
  document.getElementById('listeJoueurs').innerHTML = html || "<tr><td colspan=5>Aucun joueur</td></tr>";
}

window.approuver = async (id) => {
  const joueur = await db.collection("joueurs").doc(id).get();
  await db.collection("joueurs").doc(id).update({statut:"approuve"});
  await db.collection("notifications").add({ pour: joueur.data().email, message: "Approuvé ✅", lu: false, date: new Date() });
  chargerJoueurs();
}
window.refuser = async (id) => { await db.collection("joueurs").doc(id).update({statut:"refuse"}); chargerJoueurs(); }

// EQUIPES
async function chargerEquipes(){
  const snap = await db.collection("equipes").get();
  let html = "";
  snap.forEach(d=>{ if(d.data().statut == "attente"){ html += `<div><b>${d.data().nom}</b> <button onclick="approuverEquipe('${d.id}')">Approuver</button></div>`; } });
  document.getElementById('listeEquipes').innerHTML = html || "<p>Aucune équipe</p>";
}
window.approuverEquipe = async (id) => { await db.collection("equipes").doc(id).update({statut:"approuve"}); chargerEquipes(); }
window.soumettreEquipe = async () => {
  const nom = document.getElementById('nomEquipe').value;
  const membres = [...document.querySelectorAll('.membre')].map(i=>i.value).filter(v=>v);
  await db.collection("equipes").add({ nom, capitaine: joueurConnecte.email, membres, statut:"attente" });
  alert("Equipe envoyée"); showPage('espace-joueur');
}

// ACTUS + NOTIFS
async function chargerAnnonces(){
  const snap = await db.collection("annonces").get();
  let html = "";
  snap.forEach(d=>{ const a = d.data(); html+=`<div><b>[${a.categorie}] ${a.titre}</b> ${a.image? `<img src="${a.image}" style="width:100%;">` : ''} <p>${a.message}</p></div>`; });
  document.getElementById('listeAnnonces').innerHTML = html || "Aucune annonce";
}
async function chargerNotifications(){
  if(!joueurConnecte) return;
  const snap = await db.collection("notifications").where("pour","==",joueurConnecte.email).where("lu","==",false).get();
  if(snap.size > 0){ document.getElementById('notifBox').style.display = 'block'; document.getElementById('nbNotif').textContent = snap.size; }
}
window.voirNotifications = async () => {
  const snap = await db.collection("notifications").where("pour","==",joueurConnecte.email).where("lu","==",false).get();
  let texte = ""; snap.forEach(d => { texte += "🔔 " + d.data().message + "\n\n"; d.ref.update({lu:true}); });
  alert(texte); document.getElementById('notifBox').style.display = 'none';
                                           }
