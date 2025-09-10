export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this, Next.js is working!
        </p>
      </div>
    </div>
  );
}

// Disable static generation for this page
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};