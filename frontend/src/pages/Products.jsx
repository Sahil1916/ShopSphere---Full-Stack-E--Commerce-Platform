import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import { products as productsApi } from '../services/api';
import {
    normalizeProduct,
    deriveCategories,
    initReveal
} from '../utils/helpers';

import ProductCard from '../components/ProductCard';

const PER_PAGE = 8;

export default function Products() {

    // =========================================================
    // STATE
    // =========================================================

    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState('');
    const [checkedCats, setCheckedCats] = useState([]);

    const [maxPrice, setMaxPrice] = useState(20000);
    const [sort, setSort] = useState('default');

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();


    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    useEffect(() => {

        setLoading(true);

        productsApi.getAll()
            .then(response => {

                const products = (response.data || [])
                    .map(normalizeProduct);

                setAllProducts(products);

                setCategories(
                    deriveCategories(products)
                );

                // Read category from URL
                const categoryFromUrl = searchParams.get('cat');

                if (categoryFromUrl) {
                    setCheckedCats([categoryFromUrl]);
                } else {
                    setCheckedCats([]);
                }

            })
            .catch(error => {

                console.error(
                    'Failed to load products:',
                    error
                );

                setAllProducts([]);
                setCategories([]);

            })
            .finally(() => {

                setLoading(false);

            });

    }, [searchParams]);


    // =========================================================
    // FILTER + SEARCH + SORT
    // =========================================================

    const filteredProducts = useMemo(() => {

        let products = [...allProducts];

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        const searchText = search
            .trim()
            .toLowerCase();

        if (searchText) {

            products = products.filter(product => {

                const name =
                    String(product.name || '')
                        .toLowerCase();

                const category =
                    String(product.category || '')
                        .toLowerCase();

                const description =
                    String(product.description || '')
                        .toLowerCase();

                return (
                    name.includes(searchText) ||
                    category.includes(searchText) ||
                    description.includes(searchText)
                );

            });

        }


        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        if (checkedCats.length > 0) {

            products = products.filter(product =>
                checkedCats.includes(product.category)
            );

        }


        // -----------------------------------------------------
        // PRICE
        // -----------------------------------------------------

        products = products.filter(product => {

            const price = Number(product.price) || 0;

            return price <= maxPrice;

        });


        // -----------------------------------------------------
        // SORT
        // -----------------------------------------------------

        if (sort === 'priceLow') {

            products.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );

        }

        else if (sort === 'priceHigh') {

            products.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );

        }

        return products;

    }, [
        allProducts,
        search,
        checkedCats,
        maxPrice,
        sort
    ]);


    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredProducts.length / PER_PAGE
        )
    );


    // If filters change, return to page 1.
    useEffect(() => {

        setPage(1);

    }, [
        search,
        checkedCats,
        maxPrice,
        sort
    ]);


    // Make sure current page is always valid.
    useEffect(() => {

        if (page > totalPages) {
            setPage(totalPages);
        }

    }, [page, totalPages]);


    // Starting index
    const startIndex =
        (page - 1) * PER_PAGE;


    // Products displayed on current page
    const pageItems =
        filteredProducts.slice(
            startIndex,
            startIndex + PER_PAGE
        );


    // =========================================================
    // REVEAL ANIMATION
    // =========================================================

    useEffect(() => {

        if (!loading) {

            const timer = setTimeout(() => {
                initReveal();
            }, 100);

            return () => clearTimeout(timer);

        }

    }, [
        loading,
        page,
        filteredProducts
    ]);


    // =========================================================
    // CATEGORY TOGGLE
    // =========================================================

    const toggleCategory = (category) => {

        setCheckedCats(previous => {

            if (previous.includes(category)) {

                return previous.filter(
                    item => item !== category
                );

            }

            return [
                ...previous,
                category
            ];

        });

    };


    // =========================================================
    // RESET FILTERS
    // =========================================================

    const resetFilters = () => {

        setSearch('');
        setCheckedCats([]);
        setMaxPrice(20000);
        setSort('default');
        setPage(1);

    };


    // =========================================================
    // PAGINATION HANDLER
    // =========================================================

    const goToPage = (newPage) => {

        if (
            newPage < 1 ||
            newPage > totalPages ||
            newPage === page
        ) {
            return;
        }

        setPage(newPage);

        window.scrollTo({
            top: 200,
            behavior: 'smooth'
        });

    };


    // =========================================================
    // PAGE NUMBERS
    // =========================================================

    const pageNumbers = Array.from(
        { length: totalPages },
        (_, index) => index + 1
    );


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="container py-4">

            {/* =================================================
                BREADCRUMB
            ================================================= */}

            <nav className="breadcrumb-shop mb-3">

                <Link to="/">
                    Home
                </Link>

                {' / '}

                <span className="text-dark fw-semibold">
                    Shop
                </span>

            </nav>


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="row mb-4 g-3 align-items-center">

                <div className="col-lg-7">

                    <h2 className="section-title mb-0">
                        All Products
                    </h2>

                    <p className="text-muted small mb-0">

                        Showing{' '}

                        {filteredProducts.length === 0
                            ? 0
                            : startIndex + 1
                        }

                        {'–'}

                        {Math.min(
                            startIndex + PER_PAGE,
                            filteredProducts.length
                        )}

                        {' '}of{' '}

                        {filteredProducts.length}

                        {' '}products

                    </p>

                </div>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="col-lg-5">

                    <div className="search-bar-wrap">

                        <i className="bi bi-search text-muted"></i>

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e =>
                                setSearch(e.target.value)
                            }
                        />

                        {search && (

                            <button
                                type="button"
                                className="btn btn-light-soft btn-sm"
                                onClick={() =>
                                    setSearch('')
                                }
                                title="Clear search"
                            >
                                <i className="bi bi-x"></i>
                            </button>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="row g-4">


                {/* =================================================
                    FILTER SIDEBAR
                ================================================= */}

                <div className="col-lg-3">

                    {/* Mobile filter button */}

                    <button
                        className="btn btn-light-soft w-100 mb-3 d-lg-none"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#filterPanel"
                        aria-controls="filterPanel"
                    >

                        <i className="bi bi-funnel me-1"></i>

                        Filters

                    </button>


                    <div
                        className="collapse d-lg-block"
                        id="filterPanel"
                    >


                        {/* CATEGORY FILTER */}

                        <div className="filter-card mb-3">

                            <h6>
                                Category
                            </h6>

                            {categories.length === 0 ? (

                                <p className="text-muted small mb-0">
                                    No categories available.
                                </p>

                            ) : (

                                categories.map(category => (

                                    <div
                                        key={category.name}
                                        className="form-check mb-2"
                                    >

                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`cat_${category.name}`}
                                            checked={
                                                checkedCats.includes(
                                                    category.name
                                                )
                                            }
                                            onChange={() =>
                                                toggleCategory(
                                                    category.name
                                                )
                                            }
                                        />

                                        <label
                                            className="form-check-label"
                                            htmlFor={`cat_${category.name}`}
                                        >

                                            {category.name}

                                            <span className="text-muted">
                                                {' '}({category.count})
                                            </span>

                                        </label>

                                    </div>

                                ))

                            )}

                        </div>


                        {/* PRICE FILTER */}

                        <div className="filter-card mb-3">

                            <h6>
                                Price Range
                            </h6>

                            <input
                                type="range"
                                className="form-range range-price"
                                min={0}
                                max={20000}
                                step={100}
                                value={maxPrice}
                                onChange={e =>
                                    setMaxPrice(
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <div className="d-flex justify-content-between small text-muted">

                                <span>
                                    ₹0
                                </span>

                                <span>
                                    Up to ₹
                                    {maxPrice.toLocaleString(
                                        'en-IN'
                                    )}
                                </span>

                            </div>

                        </div>


                        {/* APPLY */}

                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={() => setPage(1)}
                        >

                            <i className="bi bi-check2 me-1"></i>

                            Apply Filters

                        </button>


                        {/* RESET */}

                        <button
                            type="button"
                            className="btn btn-light-soft w-100 mt-2"
                            onClick={resetFilters}
                        >

                            <i className="bi bi-arrow-counterclockwise me-1"></i>

                            Reset

                        </button>

                    </div>

                </div>


                {/* =================================================
                    PRODUCTS AREA
                ================================================= */}

                <div className="col-lg-9">


                    {/* =================================================
                        SORT
                    ================================================= */}

                    <div className="d-flex justify-content-end mb-3">

                        <select
                            className="form-select w-auto"
                            value={sort}
                            onChange={e =>
                                setSort(e.target.value)
                            }
                        >

                            <option value="default">
                                Sort: Featured
                            </option>

                            <option value="priceLow">
                                Price: Low to High
                            </option>

                            <option value="priceHigh">
                                Price: High to Low
                            </option>

                        </select>

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="row g-4">

                            {[...Array(8)].map((_, index) => (

                                <div
                                    key={index}
                                    className="col-6 col-md-4 col-lg-4"
                                >

                                    <div
                                        className="skeleton"
                                        style={{
                                            height: 320,
                                            borderRadius: 18
                                        }}
                                    ></div>

                                </div>

                            ))}

                        </div>

                    ) : pageItems.length === 0 ? (

                        /* =================================================
                           EMPTY STATE
                        ================================================= */

                        <div className="text-center py-5">

                            <i
                                className="bi bi-search"
                                style={{
                                    fontSize: '2.5rem',
                                    color: 'var(--border)'
                                }}
                            ></i>

                            <h5 className="mt-3">
                                No products found
                            </h5>

                            <p className="text-muted">
                                Try adjusting your filters
                                or search term.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={resetFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        /* =================================================
                           PRODUCT GRID
                        ================================================= */

                        <div className="row g-4">

                            {pageItems.map(product => (

                                <ProductCard
                                    key={product.id}
                                    p={product}
                                />

                            ))}

                        </div>

                    )}


                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {!loading &&
                        filteredProducts.length > 0 &&
                        totalPages > 1 && (

                            <nav
                                className="mt-5"
                                aria-label="Product pagination"
                            >

                                <ul className="pagination justify-content-center">


                                    {/* PREVIOUS */}

                                    <li
                                        className={`page-item ${
                                            page === 1
                                                ? 'disabled'
                                                : ''
                                        }`}
                                    >

                                        <button
                                            type="button"
                                            className="page-link"
                                            disabled={page === 1}
                                            onClick={() =>
                                                goToPage(
                                                    page - 1
                                                )
                                            }
                                            aria-label="Previous page"
                                        >

                                            <i className="bi bi-chevron-left"></i>

                                        </button>

                                    </li>


                                    {/* PAGE NUMBERS */}

                                    {pageNumbers.map(
                                        pageNumber => (

                                            <li
                                                key={pageNumber}
                                                className={`page-item ${
                                                    page === pageNumber
                                                        ? 'active'
                                                        : ''
                                                }`}
                                            >

                                                <button
                                                    type="button"
                                                    className="page-link"
                                                    onClick={() =>
                                                        goToPage(
                                                            pageNumber
                                                        )
                                                    }
                                                >

                                                    {pageNumber}

                                                </button>

                                            </li>

                                        )
                                    )}


                                    {/* NEXT */}

                                    <li
                                        className={`page-item ${
                                            page === totalPages
                                                ? 'disabled'
                                                : ''
                                        }`}
                                    >

                                        <button
                                            type="button"
                                            className="page-link"
                                            disabled={
                                                page === totalPages
                                            }
                                            onClick={() =>
                                                goToPage(
                                                    page + 1
                                                )
                                            }
                                            aria-label="Next page"
                                        >

                                            <i className="bi bi-chevron-right"></i>

                                        </button>

                                    </li>

                                </ul>

                            </nav>

                        )}

                </div>

            </div>

        </div>

    );

}