import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { Save, ShieldCheck, Cloud, BrainCircuit, RefreshCw, UploadCloud } from 'lucide-react';
import { performFullBackup } from '../services/s3Service';

const Settings: React.FC = () => {
    const { geminiKey, s3Config, setGeminiKey, setS3Config, loadSettings, isLoading } = useSettingsStore();

    const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey);
    const [localS3, setLocalS3] = useState(s3Config);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        setLocalGeminiKey(geminiKey);
        setLocalS3(s3Config);
    }, [geminiKey, s3Config]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading settings...</div>;
    }

    const handleSaveAI = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setGeminiKey(localGeminiKey);
            setStatus({ type: 'success', message: 'Gemini API key saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save Gemini key.' });
        }
    };

    const handleSaveS3 = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setS3Config(localS3);
            setStatus({ type: 'success', message: 'S3 configuration saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save S3 configuration.' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <header className="flex items-center space-x-3 border-b pb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold">Local Settings</h1>
            </header>

            {status.type && (
                <div className={`p-4 rounded-lg flex items-center justify-between ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <span>{status.message}</span>
                    <button onClick={() => setStatus({ type: null, message: '' })} className="hover:opacity-75">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* AI Configuration */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold">AI Assistant (Gemini)</h2>
                </div>
                <p className="text-sm text-gray-600">Enter your Google Gemini API key to enable AI-powered expense extraction.</p>
                <form onSubmit={handleSaveAI} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">API Key</label>
                        <input
                            type="password"
                            value={localGeminiKey}
                            onChange={(e) => setLocalGeminiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save AI Key</span>
                    </button>
                </form>
            </section>

            {/* S3 Configuration */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Cloud className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-semibold">Cloud Backup (S3)</h2>
                    </div>
                    {s3Config.accessKeyId && (
                        <button
                            onClick={async () => {
                                try {
                                    setStatus({ type: 'success', message: 'Starting S3 backup...' });
                                    await performFullBackup(s3Config);
                                    setStatus({ type: 'success', message: 'Backup uploaded successfully to S3!' });
                                } catch (err: any) {
                                    setStatus({ type: 'error', message: `Backup failed: ${err.message || 'Check your CORS/Credentials'}` });
                                }
                            }}
                            className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                        >
                            <UploadCloud className="w-3 h-3" />
                            <span>Backup Now</span>
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-600">Configure your AWS S3 bucket for daily backups and receipt storage.</p>
                <form onSubmit={handleSaveS3} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bucket Name</label>
                            <input
                                type="text"
                                value={localS3.bucket}
                                onChange={(e) => setLocalS3({ ...localS3, bucket: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Region</label>
                            <input
                                type="text"
                                value={localS3.region}
                                onChange={(e) => setLocalS3({ ...localS3, region: e.target.value })}
                                placeholder="ap-southeast-1"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Access Key ID</label>
                        <input
                            type="text"
                            value={localS3.accessKeyId}
                            onChange={(e) => setLocalS3({ ...localS3, accessKeyId: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Secret Access Key</label>
                        <input
                            type="password"
                            value={localS3.secretAccessKey}
                            onChange={(e) => setLocalS3({ ...localS3, secretAccessKey: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save S3 Config</span>
                    </button>
                </form>
            </section>

            <footer className="text-center text-xs text-gray-500 pt-8 pb-4 border-t">
                <p>🔒 All keys are stored locally in your browser and never touch our servers.</p>
                <p className="mt-1">Ensure your S3 bucket has CORS enabled for this domain.</p>
            </footer>
        </div>
    );
};

export default Settings;
