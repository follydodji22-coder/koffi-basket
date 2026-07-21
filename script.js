const firebaseConfig = { 
  apiKey: "AIzaSyDT6IKXPu8g_hUZn74IIXIFFsb9NADNQtw", 
  authDomain: "koffi-basket-2026.firebaseapp.com", 
  projectId: "koffi-basket-2026", 
  storageBucket: "koffi-basket-2026.firebasestorage.app", 
  messagingSenderId: "1001801483627", 
  appId: "1:1001801483627:web:7967fff930e50022b5382e" 
}; 

firebase.initializeApp(firebaseConfig); 
const db = firebase.firestore(); 
const ADMIN_PASSWORD = "Koffi2026"; 

let chargerJoueurs;

// CHANGER DE PAGE - GLOBALE
window.showPage = function(pageId) { 
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); 
  const page = document.getElementById(pageId);
  if(page) page.classList.add('active'); 
  if(pageId === 'admin') chargerJoueurs(); 
} 

// ATTENDRE QUE LA PAGE CHARGE
document.addEventListener('DOMContentLoaded', function() { 
  
  // PRIX DYNAMIQUE
  const codePromo = document.getElementById('codePromo'); 
  const prixSpan = document.getElementById('prix');
  if(codePromo && prixSpan){ 
    codePromo.addEventListener('input', () => { 
      const prix = codePromo.value.toUpperCase() === 'KOFFI25'? 75 : 100; 
      prixSpan.textContent = prix + 'f'; 
    }); 
  } 

  // INSCRIPTION SANS PHOTO
  const formJoueur = document.getElementById('formJoueur'); 
  if(formJoueur){ 
    formJoueur.addEventListener('submit', async (e) => { 
      e.preventDefault(); 
      const form = e.target; 
      const code = form.code_promo ? form.code_promo.value.toUpperCase() : "";
      const prix = code === 'KOFFI25'? 75 : 100;

      try {
        await db.collection("joueurs").add({
          nom: form.nom.value, nationalite: form.nationalite.value, taille: form.taille.value,
          poids: form.poids.value, poste: form.poste.value, email: form.email.value,
          whatsapp: form.whatsapp.value, 
          photo: "https://i.imgur.com/8Km9tLL.png",
          prix_paye: prix, statut: "attente", date: new Date()
        });

        alert(`Inscription reçue! ✅ \n\nEnvoie ${prix}f au 0162196973 avec ton nom`);
        form.reset();
        if(prixSpan) prixSpan.textContent = '100f';
        showPage('accueil');

      } catch(error) { 
        alert("Erreur: " + error.message); 
        console.error(error);
      } 
    }); 
  }

  // LOGIN ADMIN
  window.loginAdmin = function() {
    const pwdInput = document.getElementById('adminPass');
    if(!pwdInput) return;
    const pwd = pwdInput.value;
    if(pwd === ADMIN_PASSWORD) { 
      showPage('admin'); 
    } else { 
      alert('Mauvais mot de passe'); 
    }
  }

  // LOGOUT
  window.logout = function() {
    showPage('accueil');
  }

}); // FIN DU DOMContentLoaded

// CHARGER JOUEURS
chargerJoueurs = async function() {
  const tbody = document.getElementById('listeJoueurs');
  const stats = document.getElementById('statsReelles');
  if(!tbody) return;
  try {
    const snapshot = await db.collection("joueurs").orderBy("date", "desc").get();
    tbody.innerHTML = "";
    let total = 0, valides = 0;
    snapshot.forEach(doc => {
      const j = doc.data();
      total++;
      if(j.statut === "valide") valides++;
      tbody.innerHTML += `
        <tr>
          <td><img src="${j.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;"></td>
          <td>${j.nom}</td>
          <td>${j.poste}</td>
          <td>${j.taille}cm</td>
          <td>${j.whatsapp}</td>
          <td><span style="color:${j.statut==='valide'?'var(--vert)':'orange'}">${j.statut}</span></td>
          <td>
            ${j.statut === "attente"? `<button class="btn-mini success" onclick="validerJoueur('${doc.id}')">Valider</button>` : ''}
            <button class="btn-mini danger" onclick="supprimerJoueur('${doc.id}')">Suppr</button>
          </td>
        </tr>`;
    });
    if(stats) stats.innerHTML = `<div class="stat-card"><h3>${total}</h3><p>Inscrits</p></div><div class="stat-card"><h3>${valides}</h3><p>Validés</p></div>`;
  } catch(e) {
    console.error("Erreur chargement:", e);
  }
}

// VALIDER JOUEUR
window.validerJoueur = async function(id){
  await db.collection("joueurs").doc(id).update({statut: "valide"});
  chargerJoueurs();
}

// SUPPRIMER JOUEUR
window.supprimerJoueur = async function(id){
  if(confirm("Supprimer ce joueur ?")) {
    await db.collection("joueurs").doc(id).delete();
    chargerJoueurs();
  }
                          }
window.publierAnnonce = async function(){
  const message = prompt("Écris ton annonce pour tous les joueurs :"); // ça ouvre une petite fenêtre
  if(!message) return; // si tu annules, ça fait rien
  
  await db.collection("annonces").add({ // ça enregistre dans Firebase
    message: message,
    date: new Date()
  });
  
  alert("Annonce publiée ✅");
}
