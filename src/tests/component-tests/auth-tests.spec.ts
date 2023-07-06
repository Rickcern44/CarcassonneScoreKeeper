import { render, screen } from "@testing-library/svelte";
import Login from "../../components/Login.svelte";

describe('test login component', () => {
  it('login renders correctly', () => {
    render(Login);

    const username = screen.getByText('Username')

    expect(username).toBeTruthy()
  })
})
