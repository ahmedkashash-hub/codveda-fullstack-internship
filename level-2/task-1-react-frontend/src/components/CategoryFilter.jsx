function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <fieldset className="category-filter">
      <legend>Filter by category</legend>
      <div className="category-filter__options">
        {categories.map((category) => (
          <button
            className={selectedCategory === category ? 'is-active' : ''}
            type="button"
            key={category}
            aria-pressed={selectedCategory === category}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default CategoryFilter
