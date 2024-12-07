
/** list of noteworthy assumptions:
 *  1. Rent income covers mortgage and maintance. Beyond that we are not concerned with rent
 *  2. constant home apprectiation rate
 *  3. constant refinance fee
 *  4. constant interest rate
 *  5. refinances are done immediatly after paying the mortgage for that month
 *  6. the cost to get into a new home is 32% of whatever the price of our original home is after adjusting for appreciation (initialHomePrice * (1+appreciationRate)^years * 0.32)
 *  7. in the growth period, we purchase a new home the month that a home has enough potential payout from a refinance to do that
 *  8. ??!mayChangeThisOne!?? when we show the widrawl period info, we are showing an average income per month for a plan that is spread over 20 years 
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



/////////  GROWTH PERIOD   //////////

// required inputs
let growthYears = 20; 
let initialHomeCount = 1; 

// background inputs ie set them to defaults but let the user change them in the background if needed
let initialHomePrice = 280_000;
let percentAnnualHomeAppreciation = 5;
let percentDownPayment = 20;
let percentAnnualInterestRate = 6;
let loanTermYears = 30;
let refinanceCost = 7000;


let fractionOfHomePriceToGetIn = (percentDownPayment + 7) / 100;
let TOP = initialHomePrice * fractionOfHomePriceToGetIn * initialHomeCount;
let refinanceSpillOver = 0;

let homes = [];
for (let i = 0; i < initialHomeCount; i++) {
  homes.push(new House(0, initialHomePrice, percentAnnualHomeAppreciation, percentDownPayment, percentAnnualInterestRate, loanTermYears, refinanceCost));
}

//// return debugging loop//////////////////////////
// for (let year = 1; year < 100; year++) {
// let growthYears = year;
// let homes = [];
// for (let i = 0; i < initialHomeCount; i++) {
//   homes.push(new House(0, initialHomePrice, percentAnnualHomeAppreciation, percentDownPayment, percentAnnualInterestRate, loanTermYears));
// }
/////////////////////////////////////////////////////

for (let month = 1; month <= growthYears*12; month++) {
  let newHomesAddedThisMonth = [];
  for (const home of homes) {
    let currentHomePrice = home.getCurrentHomeValue(month);
    if (growthYears*12 - month > 24) { // if we are within two years of the withdrawl stage we should stop buying homes to let equity build up
      if (home.getPossibleRefinancePayout(month) > currentHomePrice * fractionOfHomePriceToGetIn) {
        let payout = home.doARefinance(month, percentAnnualInterestRate, percentDownPayment, loanTermYears); //adjusts values in the house object
        newHomesAddedThisMonth.push(new House(month, initialHomePrice, percentAnnualHomeAppreciation, percentDownPayment, percentAnnualInterestRate, loanTermYears, refinanceCost));
        refinanceSpillOver += (payout - currentHomePrice * fractionOfHomePriceToGetIn);
      }
    }
  }
  homes.push(...newHomesAddedThisMonth);
}

console.log('|-------------------------------------------------------------------|');
console.log('|---------------------------growth period---------------------------|');
console.log('|-------------------------------------------------------------------|');

for (let i = 0; i < homes.length; i++) {  
  console.log(`Home #${i}: purchase month=${homes[i].monthOfPurchase}`);
} 


console.log('\n|-------------------------------------------------------------------|');
console.log('|-------------------------withdrawl period--------------------------|');
console.log('|-------------------------------------------------------------------|');
////////////////////////////////// WITHDRAWL PERIOD ///////////////////////////////////////////

const monthWithdrawlStarts = growthYears * 12;

const totalPortfolioValue = homes[0].getCurrentHomeValue(monthWithdrawlStarts) * homes.length;
const yearlyIncome = totalPortfolioValue * (percentAnnualHomeAppreciation/100) * 0.75;
const monthlyIncome = yearlyIncome / 12;


let totalRefi = 0;
const sortedHomes = homes.sort((a, b) => b.getPossibleRefinancePayout(monthWithdrawlStarts) - a.getPossibleRefinancePayout(monthWithdrawlStarts));
sortedHomes.forEach((home) => {
  let payout = home.getPossibleRefinancePayout(monthWithdrawlStarts);
  if (payout > 0) {
    totalRefi += payout;
  }
  console.log(`month of purchase:${home.monthOfPurchase}  home price at that time: ${formatCurrency(home.getCurrentHomeValue(home.monthOfPurchase))}  potential payout: ${formatCurrency(payout)}`);
});
// console.log(`YEAR=${year},  homeCount=${homes.length},   totalPayout =  ${formatCurrency(totalRefi)}`);



console.log(`\ntotal portfolio value: ${formatCurrency(totalPortfolioValue)} value of each home: ${formatCurrency(totalPortfolioValue / homes.length)}`);
console.log(`Yearly income: ${formatCurrency(yearlyIncome)}, monthly income: ${formatCurrency(monthlyIncome)}`);



console.log(`refinance spillover: ${formatCurrency(refinanceSpillOver)}`);












// // for (month = monthWithdrawlStarts; month < monthWithdrawlEnds; month++) {
// //   const sortedHomes = homes.sort((a, b) => b.schedule[month]);
  

// // }

//////// debugging loop bracket
// }
//////////

// console.log( " \n ------------------------ \n test timeeeeee: \n --------------------------------");

