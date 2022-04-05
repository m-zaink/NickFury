import { Success, Failure } from "../../utils/typescriptx/typescriptx";
import { LikesManager } from "../tweetsManager/likesManager/likesManager";
import { Tweet, TweetViewerMeta, ViewableTweet } from "../tweetsManager/models";
import { ViewableTweetFailure } from "../tweetsManager/types";
import { BookmarksManager } from "../usersManager/bookmarksManager/bookmarksManager";
import { ViewableUser } from "../usersManager/models";
import { UsersManager } from "../usersManager/usersManager";
import { ViewableUserX } from "../usersManager/viewables";

export class ViewableTweetX {
    private tweet: Tweet;

    constructor(parameters: {
        tweet: Tweet
    }) {
        this.tweet = parameters.tweet;
    }

    async viewable(parameters: {
        viewerId: String;
        options?: {
            enableViewerCheck?: Boolean;
        };
    }): Promise<Success<ViewableTweet> | Failure<ViewableTweetFailure>> {
        if (parameters.options?.enableViewerCheck === true) {
            const isViewerExists = await UsersManager.shared.exists({
                userId: parameters.viewerId
            });

            if (!isViewerExists) {
                const result = new Failure<ViewableTweetFailure>(ViewableTweetFailure.VIEWER_DOES_NOT_EXISTS);
                return result;
            }
        }

        const isLiked = await LikesManager.shared.exists({
            like: {
                authorId: parameters.viewerId,
                tweetId: this.tweet.id
            }
        });

        const isBookmarked = await BookmarksManager.shared.exists({
            bookmark: {
                authorId: parameters.viewerId,
                tweetId: this.tweet.id
            }
        });

        const viewerMeta: TweetViewerMeta = {
            liked: isLiked,
            bookmarked: isBookmarked,
        };

        const authorResult = await UsersManager.shared.user({
            userId: this.tweet.authorId,
        });

        if (authorResult instanceof Failure) {
            switch (authorResult.reason) {
                default: {
                    const result = new Failure<ViewableTweetFailure>(ViewableTweetFailure.UNKNOWN);
                    return result;
                }
            }
        }

        const author = authorResult.data;

        const viewableAuthorX = new ViewableUserX({
            user: author
        });

        const viewableAuthorResult = await viewableAuthorX.viewable({
            viewerId: parameters.viewerId
        });

        if (viewableAuthorResult instanceof Failure) {
            switch (viewableAuthorResult.reason) {
                default: {
                    const result = new Failure<ViewableTweetFailure>(ViewableTweetFailure.UNKNOWN);
                    return result;
                }
            }
        }

        const viewableAuthor = viewableAuthorResult.data as ViewableUser;

        const viewableTweet: ViewableTweet = {
            ...this.tweet,
            author: viewableAuthor,
            viewerMeta: viewerMeta,
        }

        const result = new Success<ViewableTweet>(viewableTweet);
        return result;
    }
}