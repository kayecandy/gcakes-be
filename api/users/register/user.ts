import { VercelRequest, VercelResponse } from "@vercel/node";

import { StatusCodes } from "http-status-codes";

import { fetchCM } from "../../../src/contentful";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res
        .status(StatusCodes.NOT_FOUND)
        .setHeader("Allow", "POST")
        .end("Not allowed");
    }

    console.log(req.body);

    const user = await (
        await fetchCM("entries", {
            method: "POST",
            headers: {
                "X-Contentful-Content-Type": "user",
            },
            body: JSON.stringify({
                fields: {
                    userid: {
                        "en-US": req.body.userid,
                    },
                    password: {
                        "en-US": req.body.password,
                    },
                    admin: {
                        "en-US": req.body.admin,
                    },
                },
            }),
        })
    ).json();

    if (req.body.published) {
        await fetchCM(`entries/${user.sys.id}/published`, {
            method: "PUT",
            headers: {
                "X-Contentful-Version": "1",
            },
        });
    }

    return res.status(StatusCodes.OK).json(user);
}