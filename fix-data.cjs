const fs = require('fs');

function fix(filename) {
    if (fs.existsSync(filename)) {
        let text = fs.readFileSync(filename, 'utf-8');
        text = text.replace(/Firebase Test Store/g, "BASANTI MEDICAL STORE");
        text = text.replace(/Partha Pharmacy/g, "Basanti Medical Store");
        text = text.replace(/Sonu Medicals/g, "Basanti Medical Store");
        text = text.replace(/Partha Medical Store/g, "Basanti Medical Store");
        text = text.replace(/Partha/g, "Basanti");
        text = text.replace(/Sonu/g, "Basanti");
        text = text.replace(/parthapharmacymedicals/g, "basantimedical");
        text = text.replace(/parthapharmacy20/g, "basanti20");
        
        fs.writeFileSync(filename, text);
        console.log("Fixed " + filename);
    }
}

fix('data-db.json');
fix('server.ts');
