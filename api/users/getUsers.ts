import { StatusCodes } from 'http-status-codes';

import { fetchGQL } from '../../src/contentful';

import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function usersHandler(req: VercelRequest, res: VercelResponse) {
        const t = await fetchGQL(
            JSON.stringify({
                query: `
                    query {
                        userCollection {
                            items {
                                sys{
                                    id
                                }
                                userid
                                password
                                firstName
                                lastName
                                email
                                address
                            }
                        }
                    }
                `,
            })
        );

        const response = await t.json();

        return res
        .setHeader("Access-Control-Allow-Origin", "*")
        .status(StatusCodes.OK)
        .json(response.data.userCollection.items);
}