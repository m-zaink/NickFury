import { Router, Request, Response } from "express";
import Joi from "joi";
import paginated from "../../../middlewares/paginated/paginated";
import {
    GroundZero,
    soldier
} from "../../../middlewares/soldier/soldier";

const bookmarks = Router();

bookmarks.get(
    "/",
    paginated(),
    async (req: Request, res: Response) => {
        // TODO: Implement this route
        throw Error("Unimplemented");
    },
);

bookmarks.post(
    "/",
    soldier({
        schema: Joi.object({
            tweetId: Joi.string(),
        }),
        groundZero: GroundZero.body,
    }),
    async (req: Request, res: Response) => {
        // TODO: Implement this route
        throw Error("Unimplemented");
    },
);

bookmarks.delete(
    "/",
    soldier({
        schema: Joi.object({
            tweetId: Joi.string().required(),
        }),
        groundZero: GroundZero.query,
    }),
    async (req: Request, res: Response) => {
        // TODO: Implement this route
        throw Error("Unimplemented");
    },
)

export = bookmarks;