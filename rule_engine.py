# Final version of rule_engine.py with English variable names but values remain in Bahasa Indonesia

def recommend_insurance(user_profile):
    occupation = user_profile.get("occupation", "").lower()
    income_level = user_profile.get("income_level", "rendah")
    dependents = user_profile.get("dependents", 0)
    concerns = [c.lower() for c in user_profile.get("concerns", [])]
    sharia_preference = user_profile.get("sharia_preference", False)

    product_database = [
        {
            "name": "Asuransi Rawat Inap Mikro",
            "type": "rawat inap",
            "premium": 20000,
            "benefits": "Santunan harian saat dirawat di rumah sakit.",
            "is_sharia_compliant": True,
            "suitable_for": ["buruh harian", "pekerja kasar", "driver ojek", "pekerja transportasi"]
        },
        {
            "name": "Asuransi Jiwa Berjangka",
            "type": "jiwa",
            "premium": 50000,
            "benefits": "Uang pertanggungan jika peserta meninggal dunia.",
            "is_sharia_compliant": True,
            "suitable_for": ["semua"]
        },
        {
            "name": "Asuransi Kecelakaan Diri",
            "type": "kecelakaan",
            "premium": 25000,
            "benefits": "Santunan jika terjadi cedera atau meninggal karena kecelakaan.",
            "is_sharia_compliant": False,
            "suitable_for": ["pekerja jalanan", "buruh", "driver ojek", "kurir"]
        },
        {
            "name": "Asuransi Kesehatan Dasar",
            "type": "kesehatan",
            "premium": 100000,
            "benefits": "Menanggung biaya pengobatan dasar dan perawatan.",
            "is_sharia_compliant": False,
            "suitable_for": ["pekerja informal", "keluarga kecil"]
        },
        {
            "name": "Asuransi Jiwa Mikro Keluarga",
            "type": "jiwa",
            "premium": 40000,
            "benefits": "Perlindungan jiwa untuk pasangan dan anak-anak.",
            "is_sharia_compliant": True,
            "suitable_for": ["keluarga kecil", "pasangan muda", "ibu rumah tangga"]
        },
        {
            "name": "Asuransi Mikro Syariah",
            "type": "jiwa",
            "premium": 35000,
            "benefits": "Perlindungan jiwa berbasis takaful.",
            "is_sharia_compliant": True,
            "suitable_for": ["semua"]
        },
        {
            "name": "Asuransi Penyakit Kritis",
            "type": "penyakit kritis",
            "premium": 120000,
            "benefits": "Santunan besar untuk kanker, stroke, dll.",
            "is_sharia_compliant": False,
            "suitable_for": ["35+", "pekerja informal", "dengan riwayat medis"]
        },
        {
            "name": "BPJS Kesehatan",
            "type": "kesehatan",
            "premium": 35000,
            "benefits": "Perlindungan kesehatan publik dari pemerintah.",
            "is_sharia_compliant": False,
            "suitable_for": ["semua"]
        },
        {
            "name": "Asuransi Unit Link",
            "type": "investasi",
            "premium": 300000,
            "benefits": "Perlindungan jiwa sekaligus investasi jangka panjang.",
            "is_sharia_compliant": False,
            "suitable_for": ["penghasilan menengah ke atas"]
        },
        {
            "name": "Asuransi Pendidikan Anak",
            "type": "pendidikan anak",
            "premium": 100000,
            "benefits": "Dana pendidikan jika orang tua meninggal atau sebagai tabungan.",
            "is_sharia_compliant": True,
            "suitable_for": ["orang tua muda", "pekerja informal", "pedagang"]
        },
        {
            "name": "Asuransi Pensiun (DPLK)",
            "type": "pensiun",
            "premium": 75000,
            "benefits": "Dana pensiun saat usia lanjut.",
            "is_sharia_compliant": True,
            "suitable_for": ["40+", "pekerja informal"]
        },
        {
            "name": "Asuransi Properti Mikro",
            "type": "properti",
            "premium": 30000,
            "benefits": "Menanggung risiko kebakaran, banjir, dll.",
            "is_sharia_compliant": False,
            "suitable_for": ["pedagang", "pemilik warung", "pemilik rumah"]
        },
        {
            "name": "Asuransi Gadget Mikro",
            "type": "gadget",
            "premium": 20000,
            "benefits": "Penggantian atau perbaikan jika rusak/curi.",
            "is_sharia_compliant": False,
            "suitable_for": ["driver ojek", "reseller", "kurir", "dropshipper"]
        },
        {
            "name": "Asuransi Usaha Mikro (Warung Aman)",
            "type": "usaha",
            "premium": 40000,
            "benefits": "Menanggung kerugian fisik atas usaha.",
            "is_sharia_compliant": True,
            "suitable_for": ["warung", "penjahit", "pedagang"]
        },
        {
            "name": "Asuransi Pengangkutan Barang",
            "type": "logistik",
            "premium": 50000,
            "benefits": "Melindungi barang selama proses pengiriman.",
            "is_sharia_compliant": False,
            "suitable_for": ["kurir", "penjual online", "sopir logistik"]
        },
        {
            "name": "Asuransi Perjalanan Domestik",
            "type": "perjalanan",
            "premium": 20000,
            "benefits": "Melindungi jika terjadi kecelakaan selama perjalanan.",
            "is_sharia_compliant": False,
            "suitable_for": ["mobilitas tinggi"]
        }
    ]

    recommendations = []

    for product in product_database:
        match_reasons = []

        if product["type"] in concerns:
            match_reasons.append(f"sesuai dengan kekhawatiran kamu tentang {product['type']}")
        if occupation in product["suitable_for"] or "semua" in product["suitable_for"]:
            match_reasons.append(f"cocok dengan jenis pekerjaan kamu sebagai {occupation}")
        if sharia_preference and not product["is_sharia_compliant"]:
            continue
        if sharia_preference and product["is_sharia_compliant"]:
            match_reasons.append("sesuai dengan preferensi syariah kamu")
        if not sharia_preference:
            match_reasons.append("tersedia dalam bentuk konvensional")

        # Use dependents to add explanation and filter
        if dependents >= 1 and product["type"] == "pendidikan anak":
            match_reasons.append("kamu punya tanggungan anak, jadi butuh perlindungan pendidikan")
        if dependents >= 2 and product["type"] == "jiwa":
            match_reasons.append("perlindungan jiwa penting untuk melindungi keluarga kamu")
        if dependents >= 3 and product["premium"] > 50000:
            continue  # filter out high-premium options for high dependent families

        # Income filtering
        if income_level == "rendah" and product["premium"] > 60000:
            continue
        if income_level == "menengah" and product["premium"] > 200000:
            continue

        if len(match_reasons) >= 2:
            recommendations.append({
                "product": product,
                "reasons": match_reasons
            })

    return {
        "profile": user_profile,
        "recommendations": recommendations
    }