import { Request, Response } from 'express';

export interface MyContext {
	req: Request;
	res: Response;
	payload?: { userId: string };
	upc_user_constraint?: String;
}
