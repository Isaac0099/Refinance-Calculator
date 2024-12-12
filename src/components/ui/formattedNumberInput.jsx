import { useState } from 'react';
import { Input } from '@/components/ui/input';

const FormattedNumberInput = ({
    value,
    onChange,
    placeholder,
    className,
    min
}) => {
    // Format number with commas for display
    const formatValue = (val) => {
        if (!val) return '';
        // Remove any commas and convert to number
        const number = parseFloat(val.toString().replace(/,/g, ''));
        if (isNaN(number)) return '';
        // Format with commas
        return number.toLocaleString('en-US');
    };

    // Handle input changes
    const handleChange = (e) => {
        // Get the raw value without commas
        const rawValue = e.target.value.replace(/,/g, '');
        // Update the state with the numeric value
        onChange(rawValue);
    };

    return (
        <Input
            type="text" // Changed from "number" to "text" to allow commas
            value={formatValue(value)}
            onChange={handleChange}
            placeholder={placeholder}
            className={className}
            min={min}
            // Optional: Prevent non-numeric input
            onKeyPress={(e) => {
                if (!/[\d.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                    e.preventDefault();
                }
            }}
        />
    );
};

export default FormattedNumberInput;