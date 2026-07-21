// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw",
  authDomain: "koffi-basket-2026.firebaseapp.com",
  projectId: "koffi-basket-2026",
  storageBucket: "koffi-basket-2026.firebasestorage.app",
  messagingSenderId: "1001801483627",
  appId: "1:1001801483627:web:7967fff930e50022b5382e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);  // 1. COLLE TA CONFIG FIREBASE ICI
const firebaseConfig = { /* TA CONFIG */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const ADMIN_PASSWORD = "Koffi2026"; // Change ce mdp

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  if(pageId === 'admin') chargerJoueurs(); // charge les vrais joueurs
}

// 2. INSCRIPTION VERS FIREBASE
document.getElementById('formJoueur').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const photoFile = form.photo.files[0];
  const photoRef = storage.ref('joueurs/' + Date.now() + photoFile.name);
  const snapshot = await photoRef.put(photoFile);
  const photoURL = await snapshot.ref.getDownloadURL();
  const prix = form.code_promo.value.toUpperCase() === 'KOFFI25'? 75 : 100;

  await db.collection("joueurs").add({
    nom: form.nom.value, nationalite: form.nationalite.value, taille: form.taille.value,
    poids: form.poids.value, poste: form.poste.value, email: form.email.value,
    whatsapp: form.whatsapp.value, photo: photoURL, prix_paye: prix,
    statut: "attente", date: new Date()
  });
  alert(`Inscription reçue! Envoie ${prix}f au 0162196973`);
  form.reset();
  showPage('accueil');
});

// 3. LOGIN ADMIN
document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  if(document.getElementById('adminPass').value === ADMIN_PASSWORD) {
    showPage('admin');
  } else {
    document.getElementById('errorLogin').style.display = 'block';
  }
});

function logout() { showPage('accueil'); }

// 4. CHARGER LES VRAIS JOUEURS DEPUIS FIREBASE
async function chargerJoueurs() {
  const snapshot = await db.collection("joueurs").orderBy("date", "desc").get();
  const tbody = document.getElementById('listeJoueurs');
  tbody.innerHTML = "";
  let total = 0, attente = 0;

  snapshot.forEach(doc => {
    const j = doc.data();
    total++;
    if(j.statut === 'attente') attente++;
    tbody.innerHTML += `
      <tr>
        <td><img src="${j.photo}" class="avatar"></td>
        <td>${j.nom}</td><td>${j.poste}</td><td>${j.taille}cm</td>
        <td>${j.whatsapp}</td>
        <td><span class="badge ${j.statut}">${j.statut}</span></td>
        <td><button onclick="valider('${doc.id}')" class="btn-mini">Valider</button></td>
      </tr>`;
  });

  // Affiche les vrais stats
  document.getElementById('statsReelles').innerHTML = `
    <div class="stat-card"><h3>Joueurs inscrits</h3><p>${total}</p></div>
    <div class="stat-card"><h3>En attente paiement</h3><p>${attente}</p></div>
  `;
}

// 5. VALIDER UN JOUEUR
async function valider(id) {
  await db.collection("joueurs").doc(id).update({statut: "valide"});
  chargerJoueurs();
}