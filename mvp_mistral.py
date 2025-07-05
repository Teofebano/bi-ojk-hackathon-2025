import streamlit as st
import requests

st.set_page_config(page_title="AI Financial Planner", page_icon="💸")
st.title("💬 Your Personal Financial Planner")
st.markdown("Hi, I am Vitta, your personal financial planner. Anything on your mind now?")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Accept user input
user_input = st.chat_input("Tell me your financial situation or goals...")

if user_input:
    # Store user message
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    with st.chat_message("assistant"):
        with st.spinner("Replying..."):
            # Compile entire conversation as prompt
            prompt = "\n".join([f"{m['role']}: {m['content']}" for m in st.session_state.messages])
            prompt += """

You are a helpful, patient financial advisor named Vitta. Your goal is to understand the user's financial situation deeply before giving advice.

1. Start by asking follow-up questions to clarify their goals, income, debts, and spending habits.
2. Do not provide financial plans until you feel you have enough information.
3. Be empathetic and conversational.
4. At the end of each reply, ask a clear, helpful follow-up question.

Once the user has answered enough and you feel confident, provide 3 tailored financial plans: Option A, B, and C, each with pros and cons.

Respond now based on the last message in the conversation history.
"""


            # Call Ollama API locally
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={"model": "mistral", "prompt": prompt, "stream": False}
                )
                reply = response.json()["response"]
            except Exception as e:
                reply = f"❌ Failed to get response: {e}"

            st.markdown(reply)
            st.session_state.messages.append({"role": "assistant", "content": reply})
