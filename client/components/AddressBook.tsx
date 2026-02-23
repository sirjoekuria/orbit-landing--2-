import { useState, useEffect } from 'react';
import { MapPin, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface SavedAddress {
    name: string;
    address: string;
    type: 'pickup' | 'delivery';
}

export default function AddressBook() {
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
            try {
                setAddresses(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved addresses', e);
            }
        }
    }, []);

    const removeAddress = (index: number) => {
        const newAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(newAddresses);
        localStorage.setItem('savedAddresses', JSON.stringify(newAddresses));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Your Saved Addresses</h3>
            </div>

            {addresses.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="h-32 flex flex-col items-center justify-center text-gray-500">
                        <MapPin className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No saved addresses yet.</p>
                        <p className="text-xs">Addresses are automatically saved when you place an order.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, index) => (
                        <Card key={index} className="overflow-hidden border-rocs-green/20 hover:border-rocs-green/50 transition-colors">
                            <CardContent className="p-4 flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="mt-1 bg-rocs-green/10 p-2 rounded-full">
                                        <MapPin className="w-4 h-4 text-rocs-green" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{addr.name}</h4>
                                        <p className="text-sm text-gray-500 line-clamp-2">{addr.address}</p>
                                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 rounded">
                                            {addr.type}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeAddress(index)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
