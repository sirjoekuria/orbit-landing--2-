import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
                <div className="mb-8">
                    <Link
                        to="/signup"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-rocs-green mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Sign Up
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rocs-green/10 rounded-lg">
                            <Shield className="w-6 h-6 text-rocs-green" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>
                    <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="prose prose-green max-w-none text-gray-600 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>
                            At Rocs Crew, we collect information you provide directly to us when you create an account, such as your name, email address, phone number, and identification documents for riders.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, including processing deliveries, communicating with you, and ensuring the safety and security of our platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies</h2>
                        <p>
                            We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze how our platform is used.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@rocscrew.com.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100">
                    <Button
                        className="bg-rocs-green hover:bg-rocs-green/90 text-white font-bold px-8"
                        onClick={() => window.print()}
                    >
                        Print Policy
                    </Button>
                </div>
            </div>
        </div>
    );
}
