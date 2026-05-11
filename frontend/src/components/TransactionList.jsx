import { useState } from 'react'

const CATEGORY_COLORS = {
  Food: '#ff7043',
  Transport: '#4f8fff',
  Shopping: '#ab47bc',
  Entertainment: '#26c6da',
  Utilities: '#ffb830',
  Groceries: '#66bb6a',
  Health: '#ef5350',
  Education: '#7e57c2',
  Income: '#00d4aa'
}

export default function TransactionList({
  transactions
}) {

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')

  // Categories
  const categories = [
    'All',
    ...new Set(
      transactions.map((t) => t.category)
    )
  ]

  // Filtered transactions
  const filtered = transactions.filter((t) =>

    (catFilter === 'All' ||
      t.category === catFilter)

    &&

    t.description
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div>

      {/* Title */}
      <h2
        style={{
          fontFamily: 'var(--font-mono)',
          marginBottom: '1.5rem',
          color: 'var(--accent)'
        }}
      >
        // Transactions
      </h2>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >

        {/* Search */}
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: 1,
            minWidth: 200,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: 8,
            padding: '8px 14px',
            fontFamily: 'var(--font-main)',
            fontSize: 14
          }}
        />

        {/* Category Filter */}
        <select
          value={catFilter}
          onChange={(e) =>
            setCatFilter(e.target.value)
          }
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: 8,
            padding: '8px 14px',
            fontFamily: 'var(--font-main)',
            fontSize: 14
          }}
        >

          {categories.map((c) => (

            <option
              key={c}
              value={c}
            >
              {c}
            </option>

          ))}

        </select>

      </div>

      {/* Table */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      >

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr 2fr 1fr 1fr',

            padding: '10px 20px',

            borderBottom:
              '1px solid var(--border)',

            color: 'var(--muted)',
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
        >

          <span>Date</span>

          <span>Description</span>

          <span>Category</span>

          <span style={{ textAlign: 'right' }}>
            Amount
          </span>

        </div>

        {/* Rows */}
        {filtered.map((tx, i) => (

          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 2fr 1fr 1fr',

              padding: '12px 20px',

              borderBottom:
                i < filtered.length - 1
                  ? '1px solid var(--border)'
                  : 'none',

              alignItems: 'center'
            }}
          >

            {/* Date */}
            <span
              style={{
                color: 'var(--muted)',
                fontSize: 13,
                fontFamily: 'var(--font-mono)'
              }}
            >
              {tx.date}
            </span>

            {/* Description */}
            <span
              style={{
                fontWeight: 500,
                fontSize: 14
              }}
            >
              {tx.description}
            </span>

            {/* Category */}
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,

                background:
                  (CATEGORY_COLORS[tx.category]
                    || '#888') + '22',

                color:
                  CATEGORY_COLORS[tx.category]
                  || '#888'
              }}
            >
              {tx.category}
            </span>

            {/* Amount */}
            <span
              style={{
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--danger)'
              }}
            >
              ₹{tx.amount}
            </span>

          </div>

        ))}

        {/* Empty State */}
        {filtered.length === 0 && (

          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--muted)'
            }}
          >
            No transactions found.
          </div>

        )}

      </div>

    </div>
  )
}