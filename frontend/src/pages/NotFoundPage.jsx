import { Link } from 'react-router-dom'
import { BiError } from 'react-icons/bi'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md shadow-xl p-6 bg-base-100 text-center">
        <h2 className="text-3xl font-bold flex items-center gap-2 justify-center mb-4 text-error">
          404 <BiError />
        </h2>
        <p className="text-lg mb-6">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary w-full">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
