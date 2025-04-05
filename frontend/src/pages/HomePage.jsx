import { Link } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="bg-base-100 rounded-2xl shadow-xl p-10 max-w-2xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold text-primary">
          My ToDo Application
        </h1>
        <p className="text-lg text-base-content mt-4">
          Organize your thoughts. Plan your tasks. Track your goals. All in one place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to="/login" className="btn btn-secondary btn-lg w-full sm:w-40">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-40">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
