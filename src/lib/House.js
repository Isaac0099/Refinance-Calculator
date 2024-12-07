import AmortizationCalculator from './AmortizationCalculator.js';

class House {
    constructor(monthOfPurchase, homePrice, percentAnnualHomeAppreciation, percentDownPayment, percentAnnualInterestRate, loanTermYears, refinanceCost) {
        this.monthOfPurchase = monthOfPurchase;
        this.monthOfLatestMortgageOrRefinance = monthOfPurchase;
        this.initialHomePrice = homePrice; // intitalHomePrice refers to the home price set in the overall simulation settings not at the time of purchase unless this is an original home. Sorry about that yall
        this.currentHomePrice = this.initialHomePrice * Math.pow(1+percentAnnualHomeAppreciation/100, monthOfPurchase/12)
        this.percentAnnualHomeAppreciation = percentAnnualHomeAppreciation;
        this.percentDownPayment = percentDownPayment;
        this.percentAnnualInterestRate = percentAnnualInterestRate;
        this.loanTermYears = loanTermYears;
        this.loanAmount = this.currentHomePrice * (100 - percentDownPayment) / 100;
        this.amoCalc = new AmortizationCalculator();
        this.schedule = this.amoCalc.generateAmortizationSchedule(this.loanAmount, this.percentAnnualInterestRate, this.loanTermYears);
        this.refinanceCost = refinanceCost;
        this.refinanceSchedule = [];
    }

    getCurrentHomeValue(currentMonth) {
        return this.initialHomePrice * Math.pow(1+this.percentAnnualHomeAppreciation/100, currentMonth/12);
    }

    getCurrentEquity(currentMonth) {
        const monthsIntoAmoSchedule = currentMonth - this.monthOfLatestMortgageOrRefinance;
        const homeValue = this.getCurrentHomeValue(currentMonth);
        const remainingBalance = this.schedule[monthsIntoAmoSchedule].remainingBalance;
        const percentOwnershipOfHome = this.percentDownPayment + ((this.loanAmount - remainingBalance)/this.loanAmount * 100);
        const currentEquity = percentOwnershipOfHome * homeValue;
        return currentEquity;
    }

    /**
     * Calculates refinance potential payout
     * @param {number} percentAnnualHomeAppreciationRate - Annual home appreciation rate as a percentage
     * @param {number} monthsSinceMortgageOrRefinance - Number of months since original mortgage or last refinance
     * @returns {number} payout {number} - The potential cash payout from refinancing (after costs)
    **/
    getPossibleRefinancePayout(currentMonth) {
        if (currentMonth == this.monthOfLatestMortgageOrRefinance) {
            throw new Error("can't get possible refinance details for the month you do a refinance")
        }
        const monthsSinceMortgageOrRefinance = currentMonth - this.monthOfLatestMortgageOrRefinance;
        const currentHomeValue = this.initialHomePrice * Math.pow((1 + (this.percentAnnualHomeAppreciation/100)), (currentMonth / 12));
        const grossPayout = currentHomeValue * 0.75 - this.refinanceCost;
        const remainingPrincipleOnMortgage = this.schedule[monthsSinceMortgageOrRefinance].remainingBalance; 
        const payout = grossPayout - remainingPrincipleOnMortgage; // we are working under the assumption that the refinance is done immediately after the mortgage payment for this month

        return payout;
    }

    doARefinance(currentMonth, newInterestRate, newPercentDownPayment, newLoanTermYears) {
        if (newPercentDownPayment < this.percentDownPayment) {
            throw new Error('Down payment for refinance cannot be lower than initial downpayment percent.');
        }

        const monthsSinceMortgageOrRefinance = currentMonth - this.monthOfLatestMortgageOrRefinance;

        // Payout information
        const currentHomeValue = this.initialHomePrice * Math.pow((1 + (this.percentAnnualHomeAppreciation/100)), (currentMonth / 12));
        const grossPayout = currentHomeValue * 0.75 - this.refinanceCost;
        const remainingPrincipleOnMortgage = this.schedule[monthsSinceMortgageOrRefinance].remainingBalance;
        const payoutAfterPayingOffCurrentMortgage = grossPayout - remainingPrincipleOnMortgage; 
        
        // New loan info (updating class fields)
        this.monthOfLatestMortgageOrRefinance = currentMonth;
        this.loanAmount = currentHomeValue * 0.75;
        this.loanTermYears = newLoanTermYears;
        this.percentAnnualInterestRate = newInterestRate;
        this.percentDownPayment = newPercentDownPayment;
        this.schedule = this.amoCalc.generateAmortizationSchedule(this.loanAmount, Number(this.percentAnnualInterestRate), Number(this.loanTermYears));
        this.refinanceSchedule.push({month: currentMonth, amount: payoutAfterPayingOffCurrentMortgage})

        // /// debugging junk
        // this.loanNumber += 1;
        // console.log(`year: ${(currentMonth/12).toFixed(1)}, mortgage number ${this.loanNumber} payment:  ${formatCurrency(this.schedule[1].paymentAmount)}  new loan amount:  ${formatCurrency(this.loanAmount)}`);
        // /////////////////////////

        return payoutAfterPayingOffCurrentMortgage       
    }
}


// Currrency formatter
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
};

export default House;
