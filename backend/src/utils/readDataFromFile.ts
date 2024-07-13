import fs from "fs";

// Функция для чтения JSON файла
export const readDataFromFile = (dataFilePath: string): Promise<any[]> => {
	return new Promise((resolve, reject) => {
		fs.readFile(dataFilePath, "utf8", (err, data) => {
			if (err) {
				console.log("DATA FILE READ ERROR: ", err);
				return reject(err);
			}
			try {
				const parsedData = JSON.parse(data);
				resolve(parsedData);
			} catch (parseErr) {
				console.log("DATA FILE PARSE ERROR: ", parseErr);
				reject(parseErr);
			}
		});
	});
};
