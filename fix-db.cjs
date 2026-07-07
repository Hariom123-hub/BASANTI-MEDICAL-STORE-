const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
    projectId: "climbing-spot-mdzmz",
    appId: "1:326192956278:web:ec5bb4567579a437ea3057",
    apiKey: "AIzaSyBFf3BGlFZSESwoeqNkNOPbGj3YdBFzD48",
    authDomain: "climbing-spot-mdzmz.firebaseapp.com",
    storageBucket: "climbing-spot-mdzmz.firebasestorage.app",
    messagingSenderId: "326192956278"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-basantimedicalst-8f8d1d72-35b1-44f7-9d59-728d7c0eb071");

async function fix() {
  try {
    const docRef = doc(db, "app_state", "main");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      let data = snap.data();
      let branding = data.branding || {};
      
      // Update branding
      if (branding.appName === "Firebase Test Store" || branding.appName === "Sonu Medicals" || branding.appName === "Partha Pharmacy") {
          branding.appName = "BASANTI MEDICAL STORE";
      }
      branding.aiAssistantName = "Basanti AI Assistant";
      branding.opsPanelTitle = "Basanti Pharmacist & Operations Hub";
      branding.mobileNavTitle = "Basanti Navigation";
      branding.supportEmail = "support@basantimedical.com";
      branding.galleryPageTitle = branding.galleryPageTitle.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.galleryAddressText = branding.galleryAddressText.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.investPageText = branding.investPageText.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.investPageEmail = "support@basantimedical.com";
      branding.aboutUsPageTitle = branding.aboutUsPageTitle.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.aboutUsPageText = branding.aboutUsPageText.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.aboutUsFactsTitle = branding.aboutUsFactsTitle.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.premiumClubTitle = branding.premiumClubTitle.replace(/Partha/g, "Basanti").replace(/Sonu/g, "Basanti");
      branding.bannerOfferText = branding.bannerOfferText.replace(/parthapharmacy20/g, "basanti20");

      data.branding = branding;
      
      await setDoc(docRef, data);
      console.log("Firestore updated successfully.");
    } else {
      console.log("No data in Firestore!");
    }
  } catch(e) {
    console.error(e);
  }
}

fix();
