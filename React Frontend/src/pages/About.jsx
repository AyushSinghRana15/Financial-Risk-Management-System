function About() {
    return (
        <div className="p-6 max-w-5xl space-y-8">

            {/* Title */}
            <div>
                <h1 className="text-3xl font-bold mb-2">About FinRisk</h1>
                <p className="text-gray-600">
                    FinRisk is an AI-powered Financial Risk Management System built to help users
                    intelligently analyze, monitor, and optimize their investment portfolios.
                    By combining real-time market data with AI-driven insights, it enables smarter
                    financial decisions, proactive risk detection, and data-backed portfolio strategies.
                </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                    Our mission is to make financial risk analysis accessible, intelligent, and actionable.
                    By leveraging machine learning, real-time market data, and intuitive visualizations,
                    FinRisk empowers users to identify risks early, optimize portfolios efficiently,
                    and make confident, data-driven investment decisions.
                </p>
            </div>

            {/* Features */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>

                <div className="grid md:grid-cols-2 gap-6">

                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                        <h3 className="font-semibold text-lg">📊 Risk Analytics Dashboard</h3>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            Gain a comprehensive view of your portfolio with advanced visualizations of
                            credit risk, market volatility, liquidity exposure, and overall performance metrics.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                        <h3 className="font-semibold text-lg">🤖 AI Insights Engine</h3>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            Leverage AI-powered analysis to uncover hidden risks, detect patterns,
                            and receive actionable recommendations tailored to your portfolio.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                        <h3 className="font-semibold text-lg">📈 Market Monitoring</h3>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            Stay ahead of the market with real-time tracking of stocks, indices,
                            cryptocurrencies, and commodities—powered by live data integration.
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                        <h3 className="font-semibold text-lg">💼 Portfolio Management</h3>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                            Efficiently manage your investments with dynamic allocation insights,
                            performance tracking, and risk-adjusted portfolio analysis.
                        </p>
                    </div>

                </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-3">Technology Stack</h2>

                <ul className="text-gray-600 space-y-2 text-sm leading-relaxed">

                    <li>
                        <b>Frontend:</b> React (Vite), Tailwind CSS, Recharts, Axios,
                        React Router DOM, JWT Decode
                    </li>

                    <li>
                        <b>Backend:</b> FastAPI (Python), RESTful APIs, Modular Router Architecture,
                        Uvicorn Server, Dependency Injection
                    </li>

                    <li>
                        <b>Database:</b> SQLAlchemy ORM, SQLite (development), PostgreSQL (scalable production-ready option)
                    </li>

                    <li>
                        <b>Authentication:</b> Google OAuth 2.0, JWT Token Handling, Session Management (localStorage)
                    </li>

                    <li>
                        <b>AI & ML Integration:</b> OpenRouter API (LLMs), Prompt Engineering for Financial Insights
                    </li>

                    <li>
                        <b>Market Data:</b> yfinance API for real-time stock, crypto, and index data
                    </li>

                    <li>
                        <b>Data Visualization:</b> Recharts for interactive charts and analytics dashboards
                    </li>

                    <li>
                        <b>Deployment & Scalability:</b> CORS Handling, Environment Configuration,
                        API Integration Layer, Production-ready backend structure
                    </li>

                </ul>
            </div>

            {/* Architecture */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-2">System Architecture</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    FinRisk follows a modular, full-stack architecture designed for scalability,
                    maintainability, and seamless data flow. The React (Vite) frontend acts as a dynamic
                    client layer, handling UI rendering, state management, and API communication via Axios.

                    <br /><br />

                    The FastAPI backend is structured using modular routers, where each core domain—
                    authentication, portfolio management, market data, and risk analysis—is separated
                    into independent services. This ensures clean code organization, easier debugging,
                    and future scalability.

                    <br /><br />

                    Authentication is handled through Google OAuth, where JWT tokens are decoded on the
                    frontend and validated via backend endpoints. Users are automatically created and
                    managed in the database, enabling a seamless login experience without traditional
                    credential storage.

                    <br /><br />

                    The data layer is powered by SQLAlchemy ORM with SQLite for development and
                    PostgreSQL support for production scalability. Proper session handling ensures
                    efficient and safe database interactions.

                    <br /><br />

                    External integrations play a key role in the system:
                    real-time financial data is fetched using yfinance, while AI-driven insights are
                    generated via OpenRouter APIs, enabling intelligent risk assessment and portfolio analysis.

                    <br /><br />

                    The overall architecture enables a smooth pipeline:
                    user interaction → API request → backend processing → data/AI integration →
                    structured response → interactive visualization on the dashboard.
                </p>
            </div>

            {/* Value */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Why FinRisk?</h2>
                <p className="text-sm leading-relaxed w-full">
                    FinRisk bridges the gap between complex financial analytics and intelligent decision-making.
                    By combining real-time market data, AI-driven insights, and intuitive visualizations,
                    it empowers users to proactively manage risk, optimize portfolio performance,
                    and make confident, data-backed investment decisions in a fast-moving market.
                </p>
            </div>
            {/* Architecture Flow */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h2 className="text-xl font-semibold mb-4">Architecture Flow</h2>

                <div className="flex flex-col items-center space-y-4 text-sm text-gray-700">

                    <div className="bg-blue-100 px-4 py-2 rounded-lg shadow-sm">
                        👤 User Interaction
                    </div>

                    <div>↓</div>

                    <div className="bg-green-100 px-4 py-2 rounded-lg shadow-sm">
                        ⚛️ React Frontend (Dashboard UI)
                    </div>

                    <div>↓</div>

                    <div className="bg-yellow-100 px-4 py-2 rounded-lg shadow-sm">
                        🔌 API Layer (Axios Requests)
                    </div>

                    <div>↓</div>

                    <div className="bg-purple-100 px-4 py-2 rounded-lg shadow-sm">
                        ⚡ FastAPI Backend (Modular Routers)
                    </div>

                    <div>↓</div>

                    <div className="bg-pink-100 px-4 py-2 rounded-lg shadow-sm">
                        🧠 AI Engine (OpenRouter)
                    </div>

                    <div className="bg-indigo-100 px-4 py-2 rounded-lg shadow-sm">
                        📊 Market Data (yfinance)
                    </div>

                    <div className="bg-gray-100 px-4 py-2 rounded-lg shadow-sm">
                        🗄️ Database (SQLAlchemy)
                    </div>

                    <div>↓</div>

                    <div className="bg-emerald-100 px-4 py-2 rounded-lg shadow-sm">
                        📈 Processed Response → Dashboard Visualization
                    </div>

                </div>
            </div>
            {/* GitHub */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                    <h2 className="text-xl font-semibold mb-1">Source Code</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Explore the complete codebase of FinRisk, including frontend, backend,
                        AI integration, and portfolio management system. The project is structured
                        with scalability and production-readiness in mind.
                    </p>
                </div>

                <a
                    href="https://github.com/AyushSinghRana15/Financial-Risk-Management-System.git"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition whitespace-nowrap"
                >
                    View on GitHub →
                </a>

            </div>
        </div>
    );
}

export default About;