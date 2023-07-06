import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Navigation from "../../components/Navigation.svelte";

describe('Navigation Component', () => {
  it('navigation renders correctly', () => {
    render(Navigation);

    const firstLink = screen.getByText('Home')

    expect(firstLink).toBeTruthy()
  })
})
