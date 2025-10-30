export const variableDefinitions: Record<string, string[]> = {
    driver: ['id', 'firstName', 'lastName', 'status', 'email', 'commissionTotal', 'siteId', 'badgeExpiry', 'performance.averageRating'],
    vehicle: ['id', 'registration', 'make', 'model', 'status', 'ownershipType', 'siteId', 'attributes'],
    booking: ['id', 'price', 'cost', 'pickupAddress', 'destinationAddress', 'status', 'paymentStatus', 'siteId', 'attributes', 'customerName', 'accountName'],
    customer: ['id', 'name', 'priorityLevel', 'isBanned', 'totalSpend', 'attributes'],
    account: ['id', 'name', 'priorityLevel', 'isBanned', 'outstandingBalance', 'totalSpend', 'tags', 'siteId'],
    document: ['name', 'expiryDate', 'daysUntilExpiry'],
    invoice: ['netEarnings', 'grossAmount', 'commission', 'statementUrl'],
    timestamp: [],
    signature: []
};

// Helper function to parse simple dot notation strings into the nested object structure
// e.g., ['customer.name', 'booking.id'] -> { customer: ['name'], booking: ['id'] }
export const parsePlaceholdersToVariables = (placeholders: string[]): Record<string, string[]> => {
    const variables: Record<string, string[]> = {};
    placeholders.forEach(placeholder => {
        const parts = placeholder.split('.');
        if (parts.length > 0) {
            const root = parts[0];
            if (!variables[root]) {
                variables[root] = [];
            }
            if(parts.length > 1) {
                 variables[root].push(parts.slice(1).join('.'));
            }
        }
    });
    // Add full definitions for known roots
    Object.keys(variables).forEach(root => {
        if(variableDefinitions[root as keyof typeof variableDefinitions]) {
            variables[root] = [...new Set([...variables[root], ...variableDefinitions[root as keyof typeof variableDefinitions]])];
        }
    });
    return variables;
}
