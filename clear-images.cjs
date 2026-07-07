const fs = require('fs');

let data = JSON.parse(fs.readFileSync('data-db.json', 'utf-8'));

if (data.branding) {
    data.branding.heroImageUrl = "";
    data.branding.categoryImages = {
        "prescription": "",
        "otc": "",
        "ayurveda": "",
        "baby": "",
        "personal": "",
        "health": "",
        "nutrition": "",
        "elder": "",
        "covid": ""
    };
    data.branding.expertDoctorImage = "";
    data.branding.bookLabTestsImage = "";
    data.branding.galleryImages = [
        { id: "g1", url: "" },
        { id: "g2", url: "" },
        { id: "g3", url: "" }
    ];
    data.branding.galleryBannerImage = "";
    data.branding.investPageImage = "";
    data.branding.aboutUsPageImage = "";
    data.branding.aboutUsFacts.forEach(fact => fact.imageUrl = "");
    data.branding.verifyDeliveryBgUrl = "";
}

fs.writeFileSync('data-db.json', JSON.stringify(data, null, 2));
