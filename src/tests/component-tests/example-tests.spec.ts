import { render, screen } from "@testing-library/svelte";
import TestComponent from "../../components/TestComponent.svelte";

describe('Test Component', () => {
  it('renders correctly', () => {
    render(TestComponent);

    const username = screen.getByText('Username')

    expect(username).toBeTruthy()
  })
})
