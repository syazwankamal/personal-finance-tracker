import React, { useState } from 'react';
import { useFinanceStore, SYSTEM_CATEGORY, type Expense } from '../store/useFinanceStore';
import { PlusCircle, Calendar as CalendarIcon, Tag, Info, Save, X, Camera, Image as ImageIcon } from 'lucide-react';
import { compressImage, blobToDataURL } from '../services/imageService';

interface ExpenseFormProps {
    initialData?: Partial<Expense>;
    onSuccess?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSuccess }) => {
    const { categories, addExpense, updateExpense } = useFinanceStore();

    const [name, setName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [category, setCategory] = useState(initialData?.category || categories[0] || SYSTEM_CATEGORY);
    const [date, setDate] = useState(initialData?.timestamp ? new Date(initialData.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [receiptBlob, setReceiptBlob] = useState<Blob | null>(initialData?.localReceipt || null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    // Load preview if initial blob exists
    React.useEffect(() => {
        if (initialData?.localReceipt) {
            blobToDataURL(initialData.localReceipt).then(setReceiptPreview);
        }
    }, [initialData?.localReceipt]);

    const isEditing = !!initialData?.id;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            setReceiptBlob(compressed);
            const preview = await blobToDataURL(compressed);
            setReceiptPreview(preview);
        } catch (err) {
            console.error('Failed to process image:', err);
            alert('Failed to process image. Please try another one.');
        }
    };

    const removeReceipt = () => {
        setReceiptBlob(null);
        setReceiptPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;

        const expenseData = {
            name,
            amount: parseFloat(amount),
            category,
            tags: initialData?.tags || [],
            timestamp: new Date(date),
            notes,
            paymentMethod: initialData?.paymentMethod || 'Cash',
            isTaxDeductible: initialData?.isTaxDeductible || false,
            localReceipt: receiptBlob || undefined,
        };

        if (isEditing && initialData.id) {
            await updateExpense(initialData.id, expenseData);
        } else {
            await addExpense(expenseData);
        }

        if (onSuccess) {
            onSuccess();
        } else {
            setName('');
            setAmount('');
            setNotes('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center space-x-2">
                    <PlusCircle className={`w-5 h-5 ${isEditing ? 'text-blue-600' : 'text-green-600'}`} />
                    <h2 className="font-black text-gray-800 uppercase tracking-tight">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                </div>
                {onSuccess && (
                    <button type="button" onClick={onSuccess} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merchant / Item</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., KFC"
                        className="w-full rounded-xl border-gray-100 bg-gray-50 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500 py-3 px-4 font-bold text-gray-900 border"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (RM)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-xl border-gray-100 bg-gray-50 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500 py-3 px-4 font-black text-gray-900 border"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-gray-300" /> Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-xl border-gray-100 bg-gray-50 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500 py-3 px-4 font-bold text-gray-900 border"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-gray-300" /> Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border-gray-100 bg-gray-50 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500 py-3 px-4 font-bold text-gray-900 border appearance-none"
                    >
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-gray-300" /> Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full rounded-xl border-gray-100 bg-gray-50 shadow-none focus:bg-white focus:ring-2 focus:ring-blue-500 py-3 px-4 font-medium text-gray-600 border"
                    rows={2}
                />
            </div>

            {/* Receipt Section */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-gray-300" /> Receipt Photo
                </label>

                {receiptPreview ? (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 aspect-[4/3] bg-gray-50">
                        <img src={receiptPreview} alt="Receipt" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label className="p-3 bg-white rounded-full text-blue-600 cursor-pointer hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5" />
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            </label>
                            <button
                                type="button"
                                onClick={removeReceipt}
                                className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                            <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-2" />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase">Take Photo</span>
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                        </label>
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group">
                            <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-2" />
                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500 uppercase">Upload File</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                {onSuccess && (
                    <button
                        type="button"
                        onClick={onSuccess}
                        className="flex-1 bg-gray-100 text-gray-400 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                    </button>
                )}
                <button
                    type="submit"
                    className={`flex-2 ${isEditing ? 'bg-blue-600' : 'bg-green-600'} text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg ${isEditing ? 'shadow-blue-100' : 'shadow-green-100'} hover:opacity-90 transition-all flex items-center justify-center space-x-2 px-8`}
                >
                    <Save className="w-5 h-5" />
                    <span>{isEditing ? 'Update Expense' : 'Save Expense'}</span>
                </button>
            </div>
        </form>
    );
};

export default ExpenseForm;
