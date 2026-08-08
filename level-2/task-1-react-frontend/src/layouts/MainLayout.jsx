import Header from '../components/Header.jsx'

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="container">{children}</main>
    </div>
  )
}

export default MainLayout
