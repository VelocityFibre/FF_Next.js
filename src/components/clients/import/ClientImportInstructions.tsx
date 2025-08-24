/**
 * Import Instructions Component for Client Import
 */

export function ClientImportInstructions() {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Import Instructions</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Download the template to see the required format</li>
        <li>• Required fields: Company Name, Contact Person, Email, and Phone</li>
        <li>• Status options: active, inactive, suspended, prospect, former</li>
        <li>• Category options: enterprise, sme, residential, government, non_profit, education, healthcare</li>
        <li>• Priority options: low, medium, high, critical, vip</li>
        <li>• Payment terms: immediate, net_7, net_14, net_30, net_60, net_90, prepaid</li>
        <li>• Credit rating: excellent, good, fair, poor, unrated</li>
        <li>• Service types should be comma-separated (e.g., ftth, enterprise, maintenance)</li>
        <li>• Tags should be comma-separated for categorization</li>
      </ul>
    </div>
  );
}