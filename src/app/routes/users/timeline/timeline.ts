import { Router, Request, Response } from "express";
import { kMaximumPaginatedPageLength } from "../../../../managers/core/types";
import TimelinesManager from "../../../../managers/timelinesManager/timelinesManager";
import { TimelineFailureReason } from "../../../../managers/timelinesManager/types";
import { sentenceCasize } from "../../../../utils/caser/caser";
import { Failure } from "../../../../utils/typescriptx/typescriptx";
import { SessionizedRequest } from "../../../core/override";
import {
    AllOkRouteSuccess,
    InternalRouteFailure,
    SemanticRouteFailure,
} from "../../../core/types";
import paginated from "../../../middlewares/paginated/paginated";
import selfishGuard from "../../../middlewares/selfieGuard/selfieGuard";

const timeline = Router({
    mergeParams: true,
});

timeline.get(
    "/",
    [selfishGuard(), paginated()],
    async (req: Request, res: Response) => {
        const session = (req as SessionizedRequest).session;

        const nextToken = req.query.nextToken as String;
        const limit = parseInt(req.query.limit as string);

        const safeLimit = isNaN(limit) ? kMaximumPaginatedPageLength : limit;

        const timelineResult = await TimelinesManager.shared.timeline({
            userId: session.userId,
            nextToken: nextToken,
            limit: safeLimit,
        });

        if (timelineResult instanceof Failure) {
            const message = sentenceCasize(
                TimelineFailureReason[timelineResult.reason]
            );

            switch (timelineResult.reason) {
                case TimelineFailureReason.malformedParameters: {
                    const response = new SemanticRouteFailure(message);

                    res.status(SemanticRouteFailure.statusCode).json(response);

                    return;
                }
                default: {
                    const response = new InternalRouteFailure(message);

                    res.status(InternalRouteFailure.statusCode).json(response);

                    return;
                }
            }
        }

        const timeline = timelineResult.data;

        const response = new AllOkRouteSuccess(timeline);

        res.status(AllOkRouteSuccess.statusCode).json(response);
    }
);

export default timeline;
