import { render, screen } from "@testing-library/svelte";
import Login from "../../components/Login.svelte";

describe('test login component', () => {
  it('login renders correctly', () => {
    render(Login);

    const username = screen.getByText('Username')

    expect(username).toBeTruthy()
  })
  it('invalid credentials error is displayed', () => {
    render(Login)

    const errorMessage = screen.getByTestId('errorMessage').innerHTML;

    expect(errorMessage).toBe('Invalid credentials! ')
  })
})
