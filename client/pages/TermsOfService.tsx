import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-rocs-green mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rocs-green/10 rounded-lg">
                            <FileText className="w-6 h-6 text-rocs-green" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
                    </div>
                    <p className="text-gray-500">Last updated: May 15, 2024</p>
                </div>

                <div className="prose prose-green max-w-none text-gray-600 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Rocs Crew platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
                        <p>
                            Rocs Crew provides a delivery services platform connecting customers with delivery riders. We are responsible for facilitating these connections and managing the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Responsibilities</h2>
                        <p>
                            Users are responsible for maintaining the confidentiality of their accounts and passwords. You agree to provide accurate and complete information when registering.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Prohibited Conduct</h2>
                        <p>
                            You may not use our services for any illegal purpose or in a way that violates the rights of others. This includes harassment, fraud, and distributing malicious code.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100">
                    <Button
                        className="bg-rocs-green hover:bg-rocs-green/90 text-white font-bold px-8"
                        onClick={() => window.print()}
                    >
                        Print Terms
                    </Button>
                </div>
            </div>
        </div>
    );
}
