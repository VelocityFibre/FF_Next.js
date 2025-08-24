export function OnboardingInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
      <ul className="space-y-1 text-sm text-blue-800">
        <li>• Upload all required documents marked with a red asterisk (*)</li>
        <li>• Documents will be reviewed by our admin team within 24-48 hours</li>
        <li>• You will be notified via email once documents are approved or if changes are needed</li>
        <li>• Ensure all documents are clear, legible, and up-to-date</li>
        <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX (max 10MB per file)</li>
      </ul>
    </div>
  );
}