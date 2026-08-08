function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <label htmlFor="product-search">Search products</label>
      <input id="product-search" type="search" placeholder="Search by title..." value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

export default SearchBar
