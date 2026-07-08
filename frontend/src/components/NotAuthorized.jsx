import { useNavigate } from 'react-router-dom';

const NotAuthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Not Authorized</h1>
        <p className="text-gray-500 mb-6">
          You do not have permission to access this page. Please contact your administrator.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default NotAuthorized;
