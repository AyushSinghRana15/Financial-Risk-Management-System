function About() {
    return (
        <div className="p-6 max-w-5xl space-y-8">

            {/* Title */}
            <div>
                <h1 className="text-3xl font-bold mb-2">About FinRisk</h1>
                <p className="text-gray-600">
                    FinRisk is an AI-powered Financial Risk Management System designed to help users
                    analyze, monitor, and optimize their investment portfolios with intelligent insights.
                </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
                <p className="text-gray-600">
                    To simplify financial risk analysis using modern technologies like machine learning,
                    real-time data processing, and intuitive visualizations — enabling smarter investment decisions.
                </p>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold">📊 Risk Analytics Dashboard</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            Visualize credit risk, market volatility, liquidity risk, and overall portfolio performance.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold">🤖 AI Insights Engine</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            Get intelligent, AI-driven insights and recommendations based on your portfolio data.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold">📈 Market Monitoring</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            Track real-time market trends including indices, crypto, and commodities.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow">
                        <h3 className="font-semibold">💼 Portfolio Management</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            Manage and analyze your investment portfolio with dynamic allocation and risk metrics.
                        </p>
                    </div>

                </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-3">Technology Stack</h2>

                <ul className="text-gray-600 space-y-1 text-sm">
                    <li><b>Frontend:</b> React (Vite), Tailwind CSS, Recharts</li>
                    <li><b>Backend:</b> FastAPI (Python)</li>
                    <li><b>Database:</b> SQLAlchemy + SQLite / PostgreSQL</li>
                    <li><b>AI Integration:</b> OpenRouter API</li>
                    <li><b>Market Data:</b> yfinance API</li>
                </ul>
            </div>

            {/* Architecture */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-2">System Architecture</h2>
                <p className="text-gray-600 text-sm">
                    FinRisk follows a modular full-stack architecture where the React frontend communicates
                    with FastAPI backend services through REST APIs. Each risk module is designed independently,
                    allowing scalability and maintainability.
                </p>
            </div>

            {/* Value */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-2">Why FinRisk?</h2>
                <p className="text-sm">
                    FinRisk combines financial analytics with AI to deliver actionable insights,
                    helping users reduce risk, optimize portfolios, and make data-driven decisions
                    with confidence.
                </p>
            </div>
            {/* Architecture Mind Map */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-6">Architecture Flow</h2>

                <div className="flex flex-col items-center gap-6">

                    {/* User */}
                    <div className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl shadow text-sm font-medium">
                        👤 User
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">↓</div>

                    {/* Frontend */}
                    <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl shadow text-sm font-medium">
                        ⚛️ React Frontend (Dashboard UI)
                    </div>

                    <div className="text-gray-400">↓</div>

                    {/* Backend */}
                    <div className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl shadow text-sm font-medium">
                        ⚡ FastAPI Backend (APIs)
                    </div>

                    <div className="text-gray-400">↓</div>

                    {/* Services */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="bg-yellow-100 text-yellow-700 px-4 py-3 rounded-xl shadow text-sm text-center">
                            🤖 AI Engine <br /> (OpenRouter)
                        </div>

                        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl shadow text-sm text-center">
                            📊 Market Data <br /> (yfinance)
                        </div>

                        <div className="bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl shadow text-sm text-center">
                            🗄️ Database <br /> (SQLAlchemy)
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default About;