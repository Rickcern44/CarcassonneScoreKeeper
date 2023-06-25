import { describe, it, expect } from "vitest";
import { database } from "$lib/db";
import { test } from "@playwright/test";

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});
describe('supabase tests', (): void => {
	it('test connection', () =>{
		const db = database;
		expect(db).toBeDefined();
		expect(db).to
	})
})
