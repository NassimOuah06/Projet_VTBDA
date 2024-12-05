import { Link } from "react-router-dom"
const Navbar = () => {

  return (
    <header>
      <div className="app-header">
      <Link to="/">
          <h1>Résultats de Veille</h1>
        </Link>
      </div>
    </header>
  )
}

export default Navbar