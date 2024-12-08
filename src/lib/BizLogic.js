
/** LIST OF ASSUMPTIONS
 *  1. Rent income covers mortgage and maintance. Beyond that we are not concerned with rent
 *  2. constant home apprectiation rate
 *  3. constant refinance fee
 *  4. constant interest rate
 *  5. refinances are done immediatly after paying the mortgage for that month
 *  6. the cost to get into a new home is 32% of whatever the price of our original home is after adjusting for appreciation (initialHomePrice * (1+appreciationRate)^years * 0.32)
 *  7. in the growth period, we purchase a new home the month that a home has enough potential payout from a refinance to do that up until 2 years from the withdrawl period
 *  8. in the withdraw period we get th monthly income by assuming a yearly income of totalPortfolioValue * appreciationRate * 0.75, then split that over 12 months
 */


import House from './House.js'

// Currrency formatter
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
};

/**
 * 
 * @param {number} initialHomeCount 
 * @param {number} growthYears 
 * @param {object} marketConditions {
 *                                     initialHomePrice : value, 
 *                                     percentAnnualHomeAppreciation : value, 
 *                                     percentDownPayment: value, 
 *                                     percentAnnualInterestRate: value, 
 *                                     loanTermYears: value, 
 *                                     refinanceCost: value
 *                                   }
 */


function incomeFromHomeCountAndYears(initialHomeCount, growthYears, marketConditions){

    /////////  GROWTH PERIOD   //////////

    let initialHomePrice = marketConditions.initialHomePrice;
    let percentAnnualHomeAppreciation = marketConditions.percentAnnualHomeAppreciation;
    let percentDownPayment = marketConditions.percentDownPayment;
    let percentAnnualInterestRate = marketConditions.percentAnnualInterestRate;
    let loanTermYears = marketConditions.loanTermYears;
    let refinanceCost = marketConditions.refinanceCost;

    let fractionOfHomePriceToGetIn = (percentDownPayment + 7) / 100;
    let TOP = initialHomePrice * fractionOfHomePriceToGetIn * initialHomeCount;
    let refinanceSpillOver = 0;

    let homes = [];
    for (let i = 0; i < initialHomeCount; i++) {
    homes.push(new House(0, initialHomePrice, percentAnnualHomeAppreciation, percentDownPayment, percentAnnualInterestRate, loanTermYears, refinanceCost, homes.length));
    }

    for (let month = 1; month <= growthYears*12; month++) {
    let newHomesAddedThisMonth = [];
    for (const home of homes) {
        let currentHomePrice = home.getCurrentHomeValue(month);
        if (growthYears*12 - month > 24) { // if we are within two and a half years of the withdrawl stage we should stop buy homes
        if (home.getPossibleRefinancePayout(month) > currentHomePrice * fractionOfHomePriceToGetIn) {
            let payout = home.doARefinance(month, percentAnnualInterestRate, percentDownPayment, loanTermYears); //adjusts values in the house object
            newHomesAddedThisMonth.push(new House(month, initialHomePrice, percentAnnualHomeAppreciation, percentDownPayment, percentAnnualInterestRate, loanTermYears, refinanceCost, homes.length+newHomesAddedThisMonth.length));
            refinanceSpillOver += (payout - currentHomePrice);
        }
        }
    }
    homes.push(...newHomesAddedThisMonth);
    }

    ////////////////////////////////// WITHDRAWL PERIOD ///////////////////////////////////////////

    const monthWithdrawlStarts = growthYears * 12;
    let totalPortfolioValue = 0;
    let totalEquity = 0;
    let totalDebt = 0;
    for (let home of homes) {
        totalPortfolioValue += home.getCurrentHomeValue(monthWithdrawlStarts);
        totalEquity += home.getCurrentHomeValue(monthWithdrawlStarts) - home.schedule[monthWithdrawlStarts - home.monthOfLatestMortgageOrRefinance].remainingBalance;
        totalDebt += home.schedule[monthWithdrawlStarts - home.monthOfLatestMortgageOrRefinance].remainingBalance;
    }
    const yearlyIncome = totalPortfolioValue * (percentAnnualHomeAppreciation/100) * 0.75;
    const monthlyIncome = yearlyIncome / 12;

    return {
        TOP: TOP,
        monthWithdrawlStarts: monthWithdrawlStarts,
        totalPortfolioValue: totalPortfolioValue,
        totalEquity: totalEquity,
        totalDebt: totalDebt,
        yearlyIncome: yearlyIncome,
        monthlyIncome: monthlyIncome,
        homes: homes,
        year: growthYears
    }
}

function propertyRequirementCalculation(desiredIncome, years, marketConditions){
    const inflationAdjustedDesiredIncome = desiredIncome * Math.pow(1+marketConditions.inflationRate/100, years);
    
    let monthlyIncome = 0;
    for(let i = 1; i < 100; i++){
        const result = incomeFromHomeCountAndYears(i, years, marketConditions);
        monthlyIncome = result.monthlyIncome;
        if(monthlyIncome > inflationAdjustedDesiredIncome){
            result.initialHomeCount = i;
            result.inflationAdjustedDesiredIncome = inflationAdjustedDesiredIncome;
            return result;
        }
    }

    return{
        error: true,
        message: "Unable to achieve desired income with given parameters. Please enter a more reasonable income and time frame"
    };

}



export default propertyRequirementCalculation