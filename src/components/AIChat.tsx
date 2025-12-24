import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { extractExpenseWithAI, type ExtractedExpense } from '../services/aiService';
import { Send, Sparkles, Check, X, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

const AIChat: React.FC = () => {
    const { categories, addExpense } = useFinanceStore();
    const { geminiKey } = useSettingsStore();

    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [suggestion, setSuggestion] = useState<ExtractedExpense | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input || !geminiKey) return;

        setIsProcessing(true);
        setError(null);
        try {
            const result = await extractExpenseWithAI(geminiKey, input, categories);
            setSuggestion(result);
            setInput('');
        } catch (err: any) {
            setError(err.message || 'AI failed to process. Check your API key.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = async () => {
        if (!suggestion) return;

        await addExpense({
            name: suggestion.name,
            amount: suggestion.amount,
            category: suggestion.category,
            tags: [],
            timestamp: new Date(suggestion.date),
            notes: suggestion.notes,
            paymentMethod: 'Cash',
            isTaxDeductible: false,
        });

        setSuggestion(null);
    };

    if (!geminiKey) {
        return (
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-purple-600 mx-auto" />
                <h3 className="font-bold text-purple-900">AI Entry Disabled</h3>
                <p className="text-sm text-purple-700">Go to Settings and provide a Gemini API Key to enable voice/text entry.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Chat Input */}
            <form onSubmit={handleSend} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Spent 12 on dinner at Mama's"
                    className="w-full bg-white rounded-2xl border-none shadow-lg py-4 pl-6 pr-14 focus:ring-2 focus:ring-purple-500 text-gray-700"
                    disabled={isProcessing || !!suggestion}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-gray-300"
                    disabled={!input || isProcessing || !!suggestion}
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </form>

            {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {/* AI Suggestion Card */}
            {suggestion && (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-500 overflow-hidden animate-in slide-in-from-bottom-4">
                    <div className="bg-purple-500 p-3 flex items-center justify-between text-white">
                        <div className="flex items-center space-x-2 text-sm font-semibold">
                            <Sparkles className="w-4 h-4" />
                            <span>AI Extracted Details</span>
                        </div>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${suggestion.confidence === 'high' ? 'bg-green-400' : 'bg-orange-400'}`}>
                            {suggestion.confidence} Confidence
                        </span>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-bold">Merchant</label>
                                <p className="text-lg font-bold text-gray-900 leading-tight">{suggestion.name}</p>
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] uppercase text-gray-400 font-bold">Amount</label>
                                <p className="text-2xl font-black text-purple-600">RM {suggestion.amount.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                                <label className="text-[10px] uppercase text-gray-400 font-bold block">Category</label>
                                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{suggestion.category}</span>
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] uppercase text-gray-400 font-bold block">Date</label>
                                <p className="text-xs font-medium text-gray-600">{new Date(suggestion.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {suggestion.missingFields.length > 0 && (
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-orange-700">
                                    <span className="font-bold">Heads up!</span> Missing: {suggestion.missingFields.join(', ')}
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={() => setSuggestion(null)}
                                className="flex-1 border-2 border-gray-100 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 flex items-center justify-center space-x-2"
                            >
                                <X className="w-4 h-4" />
                                <span>Discard</span>
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-3 bg-purple-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 flex items-center justify-center space-x-2 px-8"
                            >
                                <Check className="w-4 h-4" />
                                <span>Confirm & Save</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State / Prompt */}
            {!suggestion && !isProcessing && (
                <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs py-4">
                    <MessageSquare className="w-4 h-4" />
                    <p>Try "Lunch at KFC for 25.00 today"</p>
                </div>
            )}
        </div>
    );
};

export default AIChat;
