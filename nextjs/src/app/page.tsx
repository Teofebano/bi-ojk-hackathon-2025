import { MessageCircle, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            💬 AI Financial Planner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized financial advice through intelligent conversations. 
            Our AI assistant will help you create tailored financial plans based on your goals and situation.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Chat Feature */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AI Chat Assistant</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Start a conversation about your financial goals. Our AI will ask questions to understand your situation 
              and generate personalized financial plans tailored to your needs.
            </p>
            <a
              href="/chat"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Start Chatting
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Admin Feature */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Secure administrative area for managing the financial planning system. 
              Requires Google account authentication for access.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Admin Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">AI-Powered Conversations</h3>
              <p className="text-gray-600 text-sm">
                Natural language processing for intuitive financial discussions
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Personalized Plans</h3>
              <p className="text-gray-600 text-sm">
                Three tailored financial strategies based on your risk tolerance
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Your financial information is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>© 2025 AI Financial Planner. Built with Next.js and OpenAI.</p>
        </div>
      </div>
    </div>
  );
}
