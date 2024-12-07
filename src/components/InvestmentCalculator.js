"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Info,
  Settings,
  ChevronDown,
  Percent,
  DollarSign,
  AlertCircle,
  Home,
  Calendar,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PropertyRefinanceCalculator() {
  // Core state
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [yearsAhead, setYearsAhead] = useState("15");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Property settings
  const [initialProperties, setInitialProperties] = useState(1);
  const [homePrice, setHomePrice] = useState(280000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [propertyAppreciation, setPropertyAppreciation] = useState(5.0);
  const [interestRate, setInterestRate] = useState(6.5);
  const [refinancePeriod, setRefinancePeriod] = useState(3);
  const [refinanceCost, setRefinanceCost] = useState(7000);
  const [monthlyRent, setMonthlyRent] = useState(2000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(300);
  const [loanTermYears, setLoanTermYears] = useState(30);

  // Calculated property data
  const [properties, setProperties] = useState([]);

  const initializeProperties = (count) => {
    const newProperties = [];
    for (let i = 0; i < count; i++) {
      newProperties.push({
        id: i,
        purchaseMonth: 0,
        purchasePrice: homePrice,
        currentValue: homePrice,
        downPayment: homePrice * (downPaymentPercent / 100),
        originalLoanAmount: homePrice * (1 - downPaymentPercent / 100),
        currentLoanBalance: homePrice * (1 - downPaymentPercent / 100),
        monthlyMortgage: calculateMonthlyMortgage(
          homePrice * (1 - downPaymentPercent / 100),
          interestRate,
          loanTermYears
        ),
        refinanceSchedule: [],
        equityWithdrawals: [],
        monthlyRent: monthlyRent,
        monthlyExpenses: monthlyExpenses,
        nextRefinanceMonth: refinancePeriod * 12,
      });
    
    return newProperties;
  };

  const calculatePropertyProjections = (properties, totalMonths) => {
    let projectedProperties = properties.map((prop) => ({ ...prop }));

    // Calculate month-by-month changes for each property
    for (let month = 1; month <= totalMonths; month++) {
      projectedProperties = projectedProperties.map((property) => {
        const monthsSincePurchase = month - property.purchaseMonth;
        if (monthsSincePurchase <= 0) return property;

        // Calculate new property value
        const newValue =
          property.purchasePrice *
          Math.pow(1 + propertyAppreciation / 100 / 12, monthsSincePurchase);

        // Check if it's time to refinance
        const shouldRefinance = month >= property.nextRefinanceMonth;

        if (shouldRefinance) {
          const equityAvailable = newValue * 0.75 - property.currentLoanBalance;
          const refinanceAmount = Math.max(0, equityAvailable - refinanceCost);

          if (refinanceAmount > 0) {
            property.refinanceSchedule.push({
              month,
              amount: refinanceAmount,
              newLoanBalance: property.currentLoanBalance + refinanceAmount,
            });

            property.currentLoanBalance += refinanceAmount;
            property.nextRefinanceMonth = month + refinancePeriod * 12;

            // Split refinance amount over next period
            const monthlyWithdrawal = refinanceAmount / (refinancePeriod * 12);
            property.equityWithdrawals.push({
              startMonth: month,
              endMonth: month + refinancePeriod * 12,
              monthlyAmount: monthlyWithdrawal,
            });
          }
        }

        return {
          ...property,
          currentValue: newValue,
        };
      });
    }

    return projectedProperties;
  };

  const calculateMonthlyMortgage = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    const monthlyPayment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return monthlyPayment;
  };

  const handleCalculate = () => {
    setError("");

    if (!monthlyIncome || monthlyIncome <= 0) {
      setError("Please enter a valid monthly income target");
      return;
    }

    try {
      const initialProps = initializeProperties(initialProperties);
      const projectedProps = calculatePropertyProjections(
        initialProps,
        yearsAhead * 12
      );
      setProperties(projectedProps);

      // Calculate summary metrics
      const totalRefinanceIncome = projectedProps.reduce(
        (sum, prop) =>
          sum +
          prop.refinanceSchedule.reduce((total, ref) => total + ref.amount, 0),
        0
      );

      setResult({
        properties: projectedProps,
        totalRefinanceIncome,
        averageMonthlyIncome: totalRefinanceIncome / (yearsAhead * 12),
        totalEquity: projectedProps.reduce(
          (sum, prop) => sum + (prop.currentValue - prop.currentLoanBalance),
          0
        ),
      });
    } catch (err) {
      setError("An error occurred during calculation");
      console.error(err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const PropertyCard = ({ property }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5" />
              <h3 className="font-semibold">Property Details</h3>
            </div>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Purchase Price</TableCell>
                  <TableCell>
                    {formatCurrency(property.purchasePrice)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Value</TableCell>
                  <TableCell>{formatCurrency(property.currentValue)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Equity</TableCell>
                  <TableCell>
                    {formatCurrency(
                      property.currentValue - property.currentLoanBalance
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Mortgage</TableCell>
                  <TableCell>
                    {formatCurrency(property.monthlyMortgage)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Right Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              <h3 className="font-semibold">Refinance Schedule</h3>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {property.refinanceSchedule.map((refi, index) => (
                    <TableRow key={index}>
                      <TableCell>Year {Math.floor(refi.month / 12)}</TableCell>
                      <TableCell>{formatCurrency(refi.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Property-by-Property Refinance Calculator
        </CardTitle>
        <Alert className="bg-white">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Note</AlertTitle>
          <AlertDescription>
            This calculator provides a detailed property-by-property analysis of
            refinancing strategies. Results are estimates based on consistent
            appreciation and refinancing assumptions.
          </AlertDescription>
        </Alert>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                Target Monthly Income
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Enter your desired monthly income from property
                        refinancing
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="Enter target monthly income"
                  className="pl-9"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                Initial Properties
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Number of properties to start with
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                type="number"
                value={initialProperties}
                onChange={(e) => setInitialProperties(parseInt(e.target.value))}
                min="1"
              />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                Investment Timeline (Years)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Number of years to project</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                type="number"
                value={yearsAhead}
                onChange={(e) => setYearsAhead(e.target.value)}
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={handleCalculate}
                variant="default"
                className="w-full bg-[#f17422ff]"
              >
                Calculate
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2">
                      Total Refinance Income
                    </h3>
                    <div className="text-2xl font-bold text-[#f17422ff]">
                      {formatCurrency(result.totalRefinanceIncome)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2">
                      Average Monthly Income
                    </h3>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.averageMonthlyIncome)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2">Total Equity Built</h3>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.totalEquity)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                {result.properties.map((property, index) => (
                  <PropertyCard key={index} property={property} />
                ))}
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="settings">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Advanced Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div>
                        <Label>Home Price</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={homePrice}
                            onChange={(e) =>
                              setHomePrice(parseFloat(e.target.value))
                            }
                            className="pl-9"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Down Payment (%)</Label>
                        <div className="relative">
                          <Percent className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={downPaymentPercent}
                            onChange={(e) =>
                              setDownPaymentPercent(parseFloat(e.target.value))
                            }
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Annual Appreciation (%)</Label>
                        <div className="relative">
                          <Percent className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={propertyAppreciation}
                            onChange={(e) =>
                              setPropertyAppreciation(
                                parseFloat(e.target.value)
                              )
                            }
                            step="0.1"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Interest Rate (%)</Label>
                        <div className="relative">
                          <Percent className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={interestRate}
                            onChange={(e) =>
                              setInterestRate(parseFloat(e.target.value))
                            }
                            step="0.1"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Refinance Period (Years)</Label>
                        <Input
                          type="number"
                          value={refinancePeriod}
                          onChange={(e) =>
                            setRefinancePeriod(parseFloat(e.target.value))
                          }
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>Refinance Cost</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={refinanceCost}
                            onChange={(e) =>
                              setRefinanceCost(parseFloat(e.target.value))
                            }
                            className="pl-9"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Monthly Rent</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={monthlyRent}
                            onChange={(e) =>
                              setMonthlyRent(parseFloat(e.target.value))
                            }
                            className="pl-9"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Monthly Expenses</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={monthlyExpenses}
                            onChange={(e) =>
                              setMonthlyExpenses(parseFloat(e.target.value))
                            }
                            className="pl-9"
                            min="0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Loan Term (Years)</Label>
                        <Input
                          type="number"
                          value={loanTermYears}
                          onChange={(e) =>
                            setLoanTermYears(parseFloat(e.target.value))
                          }
                          min="1"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
}
