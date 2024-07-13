import { Request, Response } from "express";
import { getUserData } from "../services/index.js";

// Объект для харения запросов. Ключ - IP клиента
const requestTimeouts: { [key: string]: NodeJS.Timeout | null } = {};

// Контроллер для эндпоинта /search
export const searchController = async (req: Request, res: Response) => {
	const { email, number } = req.body;
	const clientIp = req.ip;

	if (!clientIp) {
		return res.status(400).json({ error: "IP address not found in request" });
	}
	// Очистка предыдущего таймаута, если запрос с одного IP
	if (requestTimeouts[clientIp]) {
		clearTimeout(requestTimeouts[clientIp]);
	}

	// Создание нового таймаута для запроса
	requestTimeouts[clientIp] = setTimeout(async () => {
		try {
			const results = await getUserData(email, number);
			res.json(results);
		} catch (err) {
			console.log("CONTROLLER ERROR: ", err);
			res.status(500).json({ error: "Error reading data file" });
		} finally {
			requestTimeouts[clientIp] = null;
		}
	}, 5000);
};
