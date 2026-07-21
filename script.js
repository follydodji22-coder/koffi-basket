const form = document.getElementById('formJoueur');
const codePromo = document.getElementById('codePromo');
const prix = document.getElementById('prix');

codePromo.addEventListener('input', () => {
  if(codePromo.value.toUpperCase() === 'KOFFI25') {
    prix.textContent = '75f'; // -25%
  } else {
    prix.textContent = '100f';
  }
});
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const photoFile = form.querySelector('input[type=file]').files[0];
  const photoRef = storage.ref('joueurs/' + Date.now() + photoFile.name);
  const snapshot = await photoRef.put(photoFile);
  const photoURL = await snapshot.ref.getDownloadURL();

  const prix = codePromo.value.toUpperCase() === 'KOFFI25'? 75 : 100;

  await db.collection("joueurs").add({
    nom: form.nom.value,
    nationalite: form.nationalite.value,
    taille: form.taille.value,
    poste: form.poste.value,
    email: form.email.value,
    whatsapp: form.whatsapp.value,
    photo: photoURL,
    prix_paye: prix,
    statut: "attente",
    date: new Date()
  });

  alert(`Inscription reçue! Envoie ${prix}f au 0162196973`);
  form.reset();
});
  // Ici plus tard on connecte à la base de données + envoi email à koffibasket2026@gmail.com
});
// Simulation pour le bouton "Créer match"
document.getElementById('formMatch')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Match 5V5 publié ! Les joueurs sélectionnés recevront une notification.');
});

// Simulation bouton valider
document.querySelectorAll('.btn-mini').forEach(btn => {
  btn.addEventListener('click', () => {
    if(btn.textContent.includes('Valider')) {
      alert('Joueur validé ! Un email sera envoyé à koffibasket2026@gmail.com');
    }
    if(btn.textContent.includes('Sélectionner')) {
      alert('Joueur ajouté à une équipe');
    }
  })
})
const ADMIN_PASSWORD = "Koffi2026"; // <-- Change ce mot de passe


// Fonction pour changer de page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Login Admin
document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const pass = document.getElementById('adminPass').value;
  if(pass === ADMIN_PASSWORD) {
    showPage('admin');
    document.getElementById('errorLogin').style.display = 'none';
  } else {
    document.getElementById('errorLogin').style.display = 'block';
  }
});

function logout() {
  showPage('accueil');
  document.getElementById('adminPass').value = "";
}
// Ta config Firebase - tu la copies depuis la console Firebase
const firebaseConfig = {
  apiKey: <script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
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
  const app = initializeApp(firebaseConfig);
</script>,
  authDomain: "koffi-basket-2026.firebaseapp.com",
  projectId: "koffi-basket-2026",
  storageBucket: "koffi-basket-2026.appspot.com",
  appId: "TON_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();