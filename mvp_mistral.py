import streamlit as st
import requests
import json
from rule_engine import recommend_insurance

st.set_page_config(page_title="Vitta - Asuransi Cerdas", page_icon="💼")
st.title("💬 Vitta - Rekomendasi Asuransi Cerdas")
st.markdown("""
Halo! Saya **Vitta**, asisten cerdas yang siap bantu kamu memahami kebutuhan finansial dan menemukan produk **asuransi** yang paling cocok.
Ceritain aja dulu kondisi kamu, nanti aku bantu carikan solusi yang sesuai 😊
""")

# Inisialisasi riwayat percakapan dan profil pengguna
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user_profile" not in st.session_state:
    st.session_state.user_profile = {
        "occupation": None,
        "income_level": None,
        "dependents": None,
        "concerns": [],
        "sharia_preference": None
    }

# Tampilkan riwayat chat
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Input dari pengguna
user_input = st.chat_input("Ceritain kondisi kamu di sini...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    with st.chat_message("assistant"):
        with st.spinner("Lagi mikir solusi terbaik buat kamu..."):

            # Buat riwayat percakapan
            history = "\n".join([f"{m['role']}: {m['content']}" for m in st.session_state.messages])

            # Prompt untuk mistral
            prompt = (
                "Kamu adalah Vitta, chatbot keuangan ramah untuk para pekerja informal di Indonesia.\n"
                "Tugas kamu adalah menggali informasi dari pengguna: pekerjaan, penghasilan, tanggungan keluarga, kekhawatiran finansial, dan preferensi syariah.\n\n"
                "- Gunakan bahasa obrolan santai tapi tetap sopan.\n"
                "- Jangan seperti form, tetap empatik dan santai.\n"
                "- Jangan sebut hal teknis seperti 'rule engine' ke pengguna.\n"
                "- Jangan kasih rekomendasi sampai sistem siap.\n\n"
                "Contoh gaya:\n"
                "\"Kerja kamu sehari-hari kayak gimana? Soalnya ini penting biar aku bisa bantu lebih pas :)\"\n\n"
                "Riwayat percakapan:\n"
                f"{history}\n"
                "assistant:"
            )

            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={"model": "mistral", "prompt": prompt, "stream": False}
                )
                reply = response.json()["response"]
            except Exception as e:
                reply = f"❌ Gagal mengambil respons: {e}"

            st.markdown(reply)
            st.session_state.messages.append({"role": "assistant", "content": reply})

            # Deteksi informasi dari input (manual rule-based sementara)
            if "ojek" in user_input or "driver" in user_input:
                st.session_state.user_profile["occupation"] = "pekerja transportasi"
                if "kecelakaan" not in st.session_state.user_profile["concerns"]:
                    st.session_state.user_profile["concerns"].append("kecelakaan")
            if "anak" in user_input and "pendidikan" in user_input:
                if "pendidikan anak" not in st.session_state.user_profile["concerns"]:
                    st.session_state.user_profile["concerns"].append("pendidikan anak")
            if "penghasilan" in user_input or "pendapatan" in user_input:
                if "tidak tetap" in user_input or "pas-pasan" in user_input:
                    st.session_state.user_profile["income_level"] = "rendah"
                elif "cukup" in user_input:
                    st.session_state.user_profile["income_level"] = "menengah"
                elif "tinggi" in user_input or "lebih" in user_input:
                    st.session_state.user_profile["income_level"] = "tinggi"
            if "syariah" in user_input:
                st.session_state.user_profile["sharia_preference"] = True
            if "tidak syariah" in user_input or "konvensional" in user_input:
                st.session_state.user_profile["sharia_preference"] = False
            if "anak" in user_input and st.session_state.user_profile["dependents"] is None:
                st.session_state.user_profile["dependents"] = 1
            if "sendiri" in user_input or "tidak punya tanggungan" in user_input:
                st.session_state.user_profile["dependents"] = 0

            # Debug info di console (tidak muncul di UI)
            print("📄 USER PROFILE TERDETEKSI:")
            print(json.dumps(st.session_state.user_profile, indent=2))

            # Proses rekomendasi jika profil sudah lengkap
            profile = st.session_state.user_profile
            if all([
                profile["occupation"],
                profile["income_level"],
                profile["dependents"] is not None,
                profile["concerns"],
                profile["sharia_preference"] is not None
            ]):
                result = recommend_insurance(profile)

                if result["recommendations"]:
                    # Gabungkan semua rekomendasi ke dalam satu markdown
                    recommendation_text = "✨ Berdasarkan cerita kamu, ini rekomendasi asuransi yang mungkin cocok:\n\n"
                    for item in result["recommendations"]:
                        product = item["product"]
                        reasons = item["reasons"]

                        # Smoothing reasoning
                        reasons_text = " ".join([
                            f"Karena {r}," if i == 0 else f"dan juga {r.lower()}"
                            for i, r in enumerate(reasons)
                        ])

                        recommendation_text += f"""
**🛡️ {product['name']}**
- Premi: Rp{product['premium']:,}/bulan
- Manfaat: {product['benefits']}
- {reasons_text}.

"""
                    st.markdown(recommendation_text)
                else:
                    st.markdown("Maaf, aku belum bisa menemukan produk yang cocok. Coba ceritain lebih lanjut ya 😊")
