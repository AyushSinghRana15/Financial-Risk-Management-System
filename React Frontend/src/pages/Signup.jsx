import { Link } from "react-router-dom";

export default function Signup() {
    return (

        <div className="flex items-center justify-center min-h-screen bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-96">

                <h2 className="text-2xl font-bold mb-6 text-center">
                    Create FinRisk Account
                </h2>

                <form className="space-y-4">

                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full border p-2 rounded-lg"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full border p-2 rounded-lg"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full border p-2 rounded-lg"
                    />

                    <button
                        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    >
                        Sign Up
                    </button>

                </form>

                <p className="text-sm text-center mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600">
                        Login
                    </Link>
                </p>

            </div>

        </div>

    );
}