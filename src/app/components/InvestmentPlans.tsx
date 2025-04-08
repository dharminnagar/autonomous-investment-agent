import { useInvestmentPlans } from '../hooks/useInvestmentPlans';
import { format } from 'date-fns';

export function InvestmentPlans() {
  const { plans, loading, error, executePlan } = useInvestmentPlans();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No investment plans found. Create a new plan to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Investment Plans</h2>
      <div className="grid gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{plan.token}</h3>
                <p className="text-sm text-gray-500">
                  {plan.amount} {plan.token} every {plan.interval}
                </p>
                <p className="text-sm text-gray-500">
                  Starts: {format(new Date(plan.startDate), 'PPP')}
                </p>
              </div>
              <button
                onClick={() => executePlan(plan.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Execute Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 