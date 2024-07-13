import path from "path";
import { readDataFromFile } from "../utils/index.js";

export const getUserData = async function (email: string | undefined, number: string | undefined) {
	const data = await readDataFromFile(path.join(path.resolve(), "./src/data.json"));
	const results = data.filter((user) => {
		return (!email || user.email === email) && (!number || user.number === number);
	});

	return results;
};
