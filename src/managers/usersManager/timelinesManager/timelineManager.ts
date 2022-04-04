import { StreamAssistant } from "../../../assistants/stream/stream";
import { Failure, Success } from "../../../utils/typescriptx/typescriptx";
import { Paginated, PaginationQuery } from "../../core/types";
import { Tweet } from "../../tweetsManager/models";
import { TweetsManager } from "../../tweetsManager/tweetsManager";
import { UsersManager } from "../usersManager";
import { TimelineFeedFailure as TimelineFeedFailure } from "./types";

export class TimelineManager {
    public static readonly shared = new TimelineManager();

    async feed(parameters: {
        userId: String;
    } & PaginationQuery): Promise<Success<Paginated<Tweet>> | Failure<TimelineFeedFailure>> {
        const isUserExists = await UsersManager.shared.exists({
            userId: parameters.userId
        });

        if (!isUserExists) {
            const result = new Failure<TimelineFeedFailure>(TimelineFeedFailure.USER_DOES_NOT_EXISTS);
            return result;
        }

        const activities = await StreamAssistant.shared.timelineFeed.activities({
            userId: parameters.userId,
            limit: parameters.limit,
            nextToken: parameters.nextToken,
        });

        if (activities !== null) {
            const tweets: Tweet[] = [];

            for (const partialTweet of activities.page) {
                const tweetResult = await TweetsManager.shared.tweet({
                    tweetId: partialTweet.tweetId,
                });

                if (tweetResult instanceof Failure) {
                    const result = new Failure<TimelineFeedFailure>(TimelineFeedFailure.UNKNOWN);
                    return result;
                }

                tweets.push(tweetResult.data);
            }

            const timeline = new Paginated<Tweet>({
                page: tweets,
                nextToken: activities?.nextToken,
            });

            const result = new Success<Paginated<Tweet>>(timeline);
            return result;
        }

        const result = new Failure<TimelineFeedFailure>(TimelineFeedFailure.UNKNOWN);
        return result;
    }
}