class AmortizationCalculator {
  constructor() {
    // Use 2 decimal places for displayed/returned values
    this.displayDecimals = 2;
  }

  /**
   * Calculate monthly payment for a loan
   * @param {number} principal - The loan amount
   * @param {number} annualInterestRate - Annual interest rate (as a percentage, e.g., 5.5 for 5.5%)
   * @param {number} loanTermYears - Loan term in years
   * @returns {number} Monthly payment amount
   */
  calculateMonthlyPayment(principal, annualInterestRate, loanTermYears) {
    if (
      typeof principal !== "number" ||
      typeof annualInterestRate !== "number" ||
      typeof loanTermYears !== "number"
    ) {
      throw new Error("All parameters must be numbers");
    }
    if (principal <= 0 || annualInterestRate <= 0 || loanTermYears <= 0) {
      throw new Error("All parameters must be positive numbers");
    }
    const monthlyRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    // Calculate without rounding for internal use
    const monthlyPayment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    // Round only for display
    return this.roundDisplay(monthlyPayment);
  }

  /**
   * Generate complete amortization schedule
   * @param {number} principal - The loan amount
   * @param {number} annualInterestRate - Annual interest rate (as a percentage)
   * @param {number} loanTermYears - Loan term in years
   * @returns {Array} Array of monthly payment details as a dictionary.
   *
   * return object format:
   * {
   *  paymentNumber: (the month),
   *  paymentAmount: (the monthly payment),
   *  principalPayment: (the ammount of the payment that goes to the principal),
   *  interestPayment: (the amount towards the interest),
   *  totalInterest: (the amount paid to interest so far),
   *  remainingBalance: (self explanatory)
   *  }
   */
  generateAmortizationSchedule(principal, annualInterestRate, loanTermYears) {
    if (
      typeof principal !== "number" ||
      typeof annualInterestRate !== "number" ||
      typeof loanTermYears !== "number"
    ) {
      throw new Error(`All amo calcl parameters must be numbers \n 
                      principal: ${typeof(principal)} \n
                      interest rate: ${typeof(annualInterestRate)} \n
                      loan term; ${typeof(loanTermYears)}`);
    }

    if (principal <= 0 || annualInterestRate <= 0 || loanTermYears <= 0) {
      throw new Error("All amo calc parameters must be positive numbers");
    }

    const monthlyRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const exactMonthlyPayment =
      (principal *
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    let schedule = [];
    let remainingBalance = principal;
    let totalInterest = 0;
    let totalPrincipal = 0;

    // fill in the zeroth entry manually
    schedule.push({
      paymentNumber: 0,
      paymentAmount: 0,
      principalPayment: 0,
      interestPayment: 0,
      totalInterest: 0,
      remainingBalance: this.roundDisplay(remainingBalance)});


    for (let month = 1; month <= numberOfPayments; month++) {
      const isLastPayment = month === numberOfPayments;

      // Calculate exact interest without rounding
      const interestPayment = remainingBalance * monthlyRate;

      let principalPayment;
      let paymentAmount;

      if (isLastPayment) {
        // For the last payment, pay off the exact remaining balance
        principalPayment = remainingBalance;
        paymentAmount = principalPayment + interestPayment;
      } else {
        // Use exact monthly payment and calculate principal
        paymentAmount = exactMonthlyPayment;
        principalPayment = paymentAmount - interestPayment;
      }

      // Update running totals without rounding
      totalInterest += interestPayment;
      totalPrincipal += principalPayment;
      remainingBalance -= principalPayment;

      // Only round numbers for display in the payment object
      const payment = {
        paymentNumber: month,
        paymentAmount: this.roundDisplay(paymentAmount),
        principalPayment: this.roundDisplay(principalPayment),
        interestPayment: this.roundDisplay(interestPayment),
        totalInterest: this.roundDisplay(totalInterest),
        remainingBalance: this.roundDisplay(remainingBalance),
      };

      schedule.push(payment);
    }

    return schedule;
  }

  /**
   * Calculate total cost of the loan
   * @param {number} principal - The loan amount
   * @param {number} annualInterestRate - Annual interest rate (as a percentage)
   * @param {number} loanTermYears - Loan term in years
   * @returns {Object} Total cost breakdown {monthlyPayment, totalPayments, totalPrincipal, totalInterest, totalCost}
   */
  calculateLoanCosts(principal, annualInterestRate, loanTermYears) {
    if (
      typeof principal !== "number" ||
      typeof annualInterestRate !== "number" ||
      typeof loanTermYears !== "number"
    ) {
      throw new Error("All parameters must be numbers");
    }

    if (principal <= 0 || annualInterestRate <= 0 || loanTermYears <= 0) {
      throw new Error("All parameters must be positive numbers");
    }

    const schedule = this.generateAmortizationSchedule(
      principal,
      annualInterestRate,
      loanTermYears
    );
    const lastPayment = schedule[schedule.length - 1];
    const baseMonthlyPayment = this.calculateMonthlyPayment(
      principal,
      annualInterestRate,
      loanTermYears
    );

    // Calculate exact total cost
    const exactTotalCost =
      baseMonthlyPayment * (loanTermYears * 12 - 1) + lastPayment.paymentAmount;

    return {
      monthlyPayment: baseMonthlyPayment,
      finalPayment: lastPayment.paymentAmount,
      totalPayments: schedule.length,
      totalPrincipal: this.roundDisplay(principal),
      totalInterest: lastPayment.totalInterest,
      totalCost: this.roundDisplay(exactTotalCost),
    };
  }

  // Round for display/output (2 decimal places)
  roundDisplay(value) {
    if (value === undefined || value === null || isNaN(value)) {
      throw new Error("Invalid value provided for rounding");
    }
    return Number(
      Math.round(value + "e" + this.displayDecimals) +
        "e-" +
        this.displayDecimals
    );
  }
}

export default AmortizationCalculator;
