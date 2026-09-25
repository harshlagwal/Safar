export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getBudgetTierLabel(budget: number): {
  label: string;
  description: string;
} {
  if (budget < 3000) {
    return {
      label: 'Thrift mode',
      description: 'Hostels, sleeper buses, local dhabas & budget spots',
    };
  }
  if (budget <= 15000) {
    return {
      label: 'Comfort zone',
      description: 'Comfortable trains/Volvo AC, 3-star stays & scenic cafes',
    };
  }
  if (budget <= 40000) {
    return {
      label: 'Premium',
      description: 'Boutique stays, cabs, flights & exclusive experiences',
    };
  }
  return {
    label: 'Luxury',
    description: 'Heritage resorts, private transfers & royal hospitality',
  };
}
