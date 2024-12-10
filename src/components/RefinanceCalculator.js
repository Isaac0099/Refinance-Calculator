"use client";

import propertyRequirementCalculation from '../lib/BizLogic.js'
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Info,
  Settings,
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
  const [yearsAhead, setYearsAhead] = useState(15);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Property settings
  const [homePrice, setHomePrice] = useState(280_000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [propertyAppreciation, setPropertyAppreciation] = useState(5.0);
  const [refinanceCost, setRefinanceCost] = useState(7000);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [inflationRate, setInflationRate] = useState(2.5)

  // Calculated property data
  const [properties, setProperties] = useState([]);


  const handleCalculate =  () => {
    setError("");
    if (!monthlyIncome || monthlyIncome <= 0) {
      setError("Please enter a valid monthly income target");
      return;
    }
    if (!yearsAhead || yearsAhead < 5 || yearsAhead > 100) {
      setError("Please enter a growth period timeline between 5 to 100 years");
      return;
    }
    if (!homePrice || homePrice < 100_000 || homePrice > 5_000_000) {
      setError("Please enter a home price between $100,000 and $5,000,000");
      return;
    }
    if (!downPaymentPercent || downPaymentPercent < 1 || downPaymentPercent > 99) {
      setError("Please enter down payment percent between 1 and 99");
      return;
    }
    if (!propertyAppreciation || propertyAppreciation < 1 || propertyAppreciation > 100) {
      setError("Please enter an appreciation rate between 1 and 100 percent");
      return;
    } 
    if (!refinanceCost || refinanceCost < 0) {
      setError("Please enter a refinance cost of 0 or greater");
      return;
    }
    
    try {
      const marketConditions = {
        initialHomePrice: homePrice,
        percentAnnualHomeAppreciation: propertyAppreciation,
        percentDownPayment: downPaymentPercent,
        loanTermYears: loanTermYears,
        percentAnnualInterestRate: 6.5,
        refinanceCost: refinanceCost,
        inflationRate: inflationRate
      };
      const result = propertyRequirementCalculation(monthlyIncome, yearsAhead, marketConditions);


      if(result.error){
        setError(result.message);
        return;
      }

      setResult(result);
      setProperties(result.homes);
    } catch (err) {
      setError(err.message || "An error occurred during calculation");
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
              <h3 className="font-semibold">Property {property.index + 1} Details</h3>
            </div>
            <Table>
              <TableBody>
              <TableRow>
                  <TableCell>Month of Purchase</TableCell>
                  <TableCell>
                    {property.monthOfPurchase}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Purchase Price</TableCell>
                  <TableCell>
                    {formatCurrency(property.getCurrentHomeValue(property.monthOfPurchase))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Value</TableCell>
                  <TableCell>{formatCurrency(property.getCurrentHomeValue(result.monthWithdrawlStarts))}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Equity</TableCell>
                  <TableCell>
                    {formatCurrency(
                      property.getCurrentHomeValue(result.monthWithdrawlStarts)- property.schedule[result.monthWithdrawlStarts - property.monthOfLatestMortgageOrRefinance].remainingBalance
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Monthly Mortgage</TableCell>
                  <TableCell>
                    {formatCurrency(property.schedule[result.year*12 - property.monthOfLatestMortgageOrRefinance].paymentAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Right Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" />
              <h3 className="font-semibold">Refinances During Growth Period</h3>
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
                      <TableCell>Year {(refi.month / 12).toFixed(1)}</TableCell>
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Plan to Achieve Future Income Calculator
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
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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

              <Accordion type="single" collapsible className="md:col-span-2 w-full">
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
                        <Label>Inflation Rate (%)</Label>
                        <Input
                          type="number"
                          value={inflationRate}
                          onChange={(e) =>
                            setInflationRate(parseFloat(e.target.value))
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

            <div className="md:col-span-2">
              <Button
                onClick={handleCalculate}
                variant="default"
                className="w-full text-base bg-[#f17422ff]"
              >
                Calculate
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">
                      Target Income After Inflation
                    </h3>
                    <div className="text-xl font-bold text-[#f17422ff]">
                      {formatCurrency(result.inflationAdjustedDesiredIncome)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">
                      Total out of pocket (TOP) cost today needed to support target income in {result.year} years
                    </h3>
                    <div className="text-xl font-bold text-gray-600">
                      {formatCurrency(result.TOP)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">
                      This TOP allows you to purchase 
                    </h3>
                    <div className="text-xl font-bold text-[#f17422ff]">
                    {result.initialHomeCount} home(s) today
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">
                      With refinancing and purchasing more homes during the {result.year} years, the inital {result.initialHomeCount} home(s) are projected to grow to
                    </h3>
                    <div className="text-xl font-bold text-[#f17422ff]">
                    {result.homes.length} homes
                    </div>
                  </CardContent>
                </Card> 
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">
                      These {result.homes.length} homes then provide an average monthly income of
                    </h3>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(result.monthlyIncome)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">
                      And a total yearly income of
                    </h3>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(result.yearlyIncome)}
                    </div>
                  </CardContent>
                </Card>  
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">Your portfolio value after {result.year} years is worth</h3>
                    <div className="text-xl font-bold text-[#607091]">
                      {formatCurrency(result.totalPortfolioValue)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">With the total equity built being</h3>
                    <div className="text-xl font-bold text-[#607091]">
                      {formatCurrency(result.totalEquity)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <h3 className="font-semibold mb-1">Total debt</h3>
                    <div className="text-xl font-bold text-gray-600">
                      {formatCurrency(result.totalDebt)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {result.homes.length <= 16 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  {result.homes.map((property, index) => (
                    <PropertyCard key={index} property={property} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
