import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar.jsx'

describe('SearchBar', () => {
  it('renders the input with the current search term', () => {
    render(<SearchBar searchTerm="pixel" onSearchChange={() => {}} />)

    const input = screen.getByLabelText(/search products/i)
    expect(input).toHaveValue('pixel')
  })

  it('calls onSearchChange on every keystroke (real-time filtering)', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar searchTerm="" onSearchChange={onSearchChange} />)

    const input = screen.getByLabelText(/search products/i)
    await user.type(input, 'i')

    expect(onSearchChange).toHaveBeenCalledWith('i')
  })

  it('clears the search when the clear button is clicked', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar searchTerm="apple" onSearchChange={onSearchChange} />)

    await user.click(screen.getByLabelText(/clear search/i))

    expect(onSearchChange).toHaveBeenCalledWith('')
  })
})
