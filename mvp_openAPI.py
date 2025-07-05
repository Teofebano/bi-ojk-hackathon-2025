import streamlit as st
from openai import OpenAI

# Set up OpenAI client
client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

# App UI setup
st.set_page_config(page_title="AI Financial Planner Chat", layout="centered")
st.title("💬 AI Financial Planner")
st.markdown("Talk to the assistant about your financial situation. It will ask questions and generate 3 tailored financial plans.")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user_data" not in st.session_state:
    st.session_state.user_data = {}

# Predefined system instruction
SYSTEM_PROMPT = """
You are an empathetic financial planning assistant. Have a friendly conversation with the user to learn about:
- Their current financial situation (income, expenses, debts, assets)
- Their goals (e.g. buying a house, retiring early, education)
- Their risk tolerance (low, medium, high)

Do not immediately give financial advice. First, gather all relevant information naturally through chat. Once the user has shared enough, say:
"Thanks! I have everything I need. Let me generate 3 personalized financial plans for you."

Then wait for the user to say something like "Okay" or "Go ahead" before generating the plans.
"""

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input box
if prompt := st.chat_input("Tell me about your financial situation or goals..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Prepare full chat for the assistant
    full_chat = [{"role": "system", "content": SYSTEM_PROMPT}] + st.session_state.messages

    # Get assistant reply
    with st.spinner("Thinking..."):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=full_chat,
                temperature=0.7
            )
            reply = response.choices[0].message.content
        except Exception as e:
            reply = f"❌ Error: {e}"

    # Store and display assistant reply
    st.session_state.messages.append({"role": "assistant", "content": reply})
    with st.chat_message("assistant"):
        st.markdown(reply)

    # Check if user typed "okay", "go ahead", or similar to trigger plan generation
    if prompt.strip().lower() in {"okay", "go ahead", "generate", "show me the plans"}:
        with st.spinner("Generating your personalized plans..."):
            summary_prompt = """
From the previous conversation, summarize the user’s financial profile, then create 3 financial plan options:
1. Conservative (low risk)
2. Balanced (moderate risk)
3. Aggressive (high risk)

Each plan must include:
- Allocation suggestions (saving, investing, emergency fund)
- Estimated time to reach goals
- Strategy summary
"""
            full_chat.append({"role": "user", "content": summary_prompt})
            try:
                plans_response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=full_chat,
                    temperature=0.7
                )
                plans_text = plans_response.choices[0].message.content
            except Exception as e:
                plans_text = f"❌ Error generating plans: {e}"

        st.session_state.messages.append({"role": "assistant", "content": plans_text})
        with st.chat_message("assistant"):
            st.markdown(plans_text)
