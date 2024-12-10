import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

const HomeListBuilder = () => {
    const [homes, setHomes] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const addHome = () => {
        const newHome = {
            id: Date.now(),
            basePrice: 280000,
            purchaseDate: new Date(selectedYear, selectedMonth),
            year: selectedYear,
            month: selectedMonth
        };
        setHomes([...homes, newHome]);
    };

    const removeHome = (id) => {
        setHomes(homes.filter(home => home.id !== id));
    };

    const handleCalculate = () => {
        // This would pass the homes array to your simulation function
        console.log('Homes to simulate:', homes);
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Build Your Home Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium">Purchase Year</label>
                        <Select
                            value={selectedYear.toString()}
                            onValueChange={(value) => setSelectedYear(parseInt(value))}
                        >
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <label className="text-sm font-medium">Purchase Month</label>
                        <Select
                            value={selectedMonth.toString()}
                            onValueChange={(value) => setSelectedMonth(parseInt(value))}
                        >
                            <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button onClick={addHome}>Add Home</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="text-sm font-medium">Added Homes:</div>
                    {homes.length === 0 ? (
                        <div className="text-sm text-gray-500">No homes added yet</div>
                    ) : (
                        <div className="space-y-2">
                            {homes.map((home) => (
                                <div
                                    key={home.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <span className="font-medium">
                                            ${home.basePrice.toLocaleString()}
                                        </span>
                                        <span className="text-gray-600 ml-2">
                                            {months[home.month]} {home.year}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeHome(home.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleCalculate}
                        disabled={homes.length === 0}
                        className="w-32"
                    >
                        Calculate
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default HomeListBuilder;