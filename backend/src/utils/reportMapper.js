export const mapReport = (r) => ({
    ...r,
    totalExpenses: r.totalAmount,
    remainingLimit: r.creditLimit - r.totalAmount,
    isAggregate: false,
});

export const mapReportWithTransactions = (r) => ({
    ...mapReport(r),
    transactions: r.transactions?.map(t => ({
        ...t,
        transactionDate: t.date
    })) ?? [],
});
